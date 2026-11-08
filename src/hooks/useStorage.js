import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { INITIAL_RECIPES } from '../utils/sampleData';
import { getAisleForIngredient } from '../utils/aisleHelper';
import { getUnitCategory } from '../utils/unitConverter';

const LOCAL_KEYS = {
  RECIPES: 'recipes_data',
  SHOPPING: 'shopping_list_data',
  CONFIG: 'app_config_data'
};

// Field Mapping: React State (camelCase) <-> Supabase PostgreSQL Columns (snake_case)
export const recipeToDb = (r) => ({
  id: r.id || crypto.randomUUID(),
  title: r.title || 'Ricetta senza titolo',
  image_url: r.imageUrl || null,
  servings: Number(r.servings) || 4,
  category: r.category || 'Primo',
  cuisine: r.cuisine || 'Italiana',
  difficulty: r.difficulty || 'Media',
  prep_time_minutes: Number(r.prepTimeMinutes) || 0,
  cook_time_minutes: Number(r.cookTimeMinutes) || 0,
  main_ingredient: r.mainIngredient || '',
  tags: Array.isArray(r.tags) ? r.tags : [],
  notes: r.notes || '',
  linked_recipe_ids: Array.isArray(r.linkedRecipeIds) ? r.linkedRecipeIds : [],
  ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
  steps: Array.isArray(r.steps) ? r.steps : []
});

export const recipeFromDb = (row) => {
  if (!row) return null;
  return {
    id: row.id || crypto.randomUUID(),
    title: row.title || 'Ricetta',
    imageUrl: row.image_url || '',
    servings: row.servings || 4,
    category: row.category || 'Primo',
    cuisine: row.cuisine || 'Italiana',
    difficulty: row.difficulty || 'Media',
    prepTimeMinutes: row.prep_time_minutes || 0,
    cookTimeMinutes: row.cook_time_minutes || 0,
    mainIngredient: row.main_ingredient || '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    notes: row.notes || '',
    linkedRecipeIds: Array.isArray(row.linked_recipe_ids) ? row.linked_recipe_ids : [],
    ingredients: Array.isArray(row.ingredients)
      ? row.ingredients.map((ing) => {
          if (!ing) return { name: '', amount: null, unit: '', isScalable: true, aisle: 'Altro' };
          const name = typeof ing === 'string' ? ing : ing.name || '';
          return {
            ...ing,
            name,
            amount: ing.amount != null && !isNaN(ing.amount) ? Number(ing.amount) : null,
            unit: ing.unit || '',
            isScalable: ing.isScalable !== false,
            aisle: getAisleForIngredient(name, ing.aisle)
          };
        })
      : [],
    steps: Array.isArray(row.steps) ? row.steps : []
  };
};

export const shoppingToDb = (item) => {
  const primaryQty = item.quantities && item.quantities.length > 0 ? item.quantities[0] : {};
  return {
    id: item.id || crypto.randomUUID(),
    ingredient_name: item.name || 'Prodotto',
    amount: primaryQty.amount != null && !isNaN(primaryQty.amount) ? Number(primaryQty.amount) : null,
    unit: primaryQty.unit || '',
    aisle: item.aisle || getAisleForIngredient(item.name, null),
    checked: Boolean(item.checked),
    is_manual: Boolean(item.isManual),
    source_recipe_ids: Array.isArray(item.recipeSources) ? item.recipeSources : []
  };
};

export const shoppingFromDb = (row) => {
  if (!row) return null;
  return {
    id: row.id || crypto.randomUUID(),
    name: row.ingredient_name || 'Prodotto',
    checked: Boolean(row.checked),
    aisle: getAisleForIngredient(row.ingredient_name, row.aisle),
    isManual: Boolean(row.is_manual),
    recipeSources: Array.isArray(row.source_recipe_ids) ? row.source_recipe_ids : [],
    quantities: [
      {
        amount: row.amount != null ? Number(row.amount) : null,
        unit: row.unit || '',
        category: getUnitCategory(row.unit)
      }
    ]
  };
};


// Messaggio mostrato quando il database non risponde (rete assente o progetto Supabase in pausa)
const OFFLINE_NOTICE =
  'Database non raggiungibile: stai vedendo le ricette salvate su questo dispositivo.';

const rowKey = (row) => JSON.stringify(row);

const readLocal = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

const writeLocal = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage non disponibile', e);
  }
};

const useStorageState = () => {
  const [recipes, setRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [appConfig] = useState({ theme: 'light', defaultServings: 4 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);

  // Riferimenti sempre aggiornati (evitano closure "vecchie" nelle funzioni async)
  const recipesRef = useRef(recipes);
  const shoppingRef = useRef(shoppingList);
  recipesRef.current = recipes;
  shoppingRef.current = shoppingList;

  // Ultima versione nota sul DB di ogni riga della spesa: id -> JSON della riga.
  // Serve per salvare solo le righe cambiate invece di cancellare e reinserire tutto.
  const syncedShoppingRef = useRef(new Map());

  const rememberShoppingRows = (items) => {
    const map = new Map();
    items.forEach((item) => map.set(item.id, rowKey(shoppingToDb(item))));
    syncedShoppingRef.current = map;
  };

  // Copia locale sempre allineata: se il DB non risponde l'app resta consultabile
  useEffect(() => {
    if (!isLoading) writeLocal(LOCAL_KEYS.RECIPES, recipes);
  }, [recipes, isLoading]);

  useEffect(() => {
    if (!isLoading) writeLocal(LOCAL_KEYS.SHOPPING, shoppingList);
  }, [shoppingList, isLoading]);

  const reportWriteError = (what, err) => {
    console.error(`Supabase ${what} error:`, err);
    setErrorNotice(`Non sono riuscito a salvare (${what}) sul database. Riprova tra poco.`);
  };

  // Fetch Recipes from Supabase
  const fetchRecipes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Tabella vuota: inserisce le ricette di esempio
        const seedRows = INITIAL_RECIPES.map(recipeToDb);
        const { data: inserted, error: seedErr } = await supabase
          .from('recipes')
          .insert(seedRows)
          .select();

        if (seedErr) {
          console.error('Error seeding recipes to Supabase', seedErr);
          setRecipes(INITIAL_RECIPES);
        } else {
          setRecipes((inserted || []).map(recipeFromDb).filter(Boolean));
        }
      } else {
        setRecipes(data.map(recipeFromDb).filter(Boolean));
      }
      return true;
    } catch (err) {
      console.error('Fetch recipes failed, loading offline fallback:', err);
      setRecipes(readLocal(LOCAL_KEYS.RECIPES, INITIAL_RECIPES));
      return false;
    }
  }, []);

  // Fetch Shopping List from Supabase
  const fetchShoppingList = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const parsed = (data || []).map(shoppingFromDb).filter(Boolean);
      rememberShoppingRows(parsed);
      setShoppingList(parsed);
      return true;
    } catch (err) {
      console.error('Fetch shopping list failed, loading offline fallback:', err);
      setShoppingList(readLocal(LOCAL_KEYS.SHOPPING, []));
      return false;
    }
  }, []);

  const loadAll = useCallback(async () => {
    const [okRecipes, okShopping] = await Promise.all([fetchRecipes(), fetchShoppingList()]);
    setErrorNotice(okRecipes && okShopping ? null : OFFLINE_NOTICE);
    return okRecipes && okShopping;
  }, [fetchRecipes, fetchShoppingList]);

  // Initial Fetch & Realtime Subscriptions
  useEffect(() => {
    let isMounted = true;

    (async () => {
      setIsLoading(true);
      await loadAll();
      if (isMounted) setIsLoading(false);
    })();

    // Quando torna la rete o si riapre l'app, riprova a sincronizzare
    const retry = () => {
      if (document.visibilityState === 'hidden') return;
      loadAll();
    };
    window.addEventListener('online', retry);
    document.addEventListener('visibilitychange', retry);

    const channelId = Math.random().toString(36).substring(2, 9);

    const recipesChannel = supabase
      .channel(`recipes_realtime_${channelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recipes' },
        (payload) => {
          if (!isMounted) return;
          if (payload.eventType === 'INSERT') {
            setRecipes((prev) => {
              const exists = prev.some((r) => r.id === payload.new.id);
              return exists ? prev : [recipeFromDb(payload.new), ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setRecipes((prev) =>
              prev.map((r) => (r.id === payload.new.id ? recipeFromDb(payload.new) : r))
            );
          } else if (payload.eventType === 'DELETE') {
            setRecipes((prev) => prev.filter((r) => r.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('Realtime recipes channel error');
        }
      });

    const shoppingChannel = supabase
      .channel(`shopping_realtime_${channelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shopping_list' },
        (payload) => {
          if (!isMounted) return;
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const item = shoppingFromDb(payload.new);
            syncedShoppingRef.current.set(item.id, rowKey(shoppingToDb(item)));
            setShoppingList((prev) => {
              const exists = prev.some((i) => i.id === item.id);
              if (!exists) return [...prev, item];
              return prev.map((i) => {
                if (i.id !== item.id) return i;
                // Mantiene le quantità multiple locali se il DB ne conserva solo la prima
                const sameAsLocal = rowKey(shoppingToDb(i)) === rowKey(shoppingToDb(item));
                return sameAsLocal ? i : item;
              });
            });
          } else if (payload.eventType === 'DELETE') {
            syncedShoppingRef.current.delete(payload.old.id);
            setShoppingList((prev) => prev.filter((i) => i.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      window.removeEventListener('online', retry);
      document.removeEventListener('visibilitychange', retry);
      supabase.removeChannel(recipesChannel);
      supabase.removeChannel(shoppingChannel);
    };
  }, [loadAll]);

  // RECIPES CRUD OPERATIONS
  const addRecipe = async (recipe) => {
    const newRecipe = { ...recipe, id: recipe.id || crypto.randomUUID() };
    setRecipes((prev) => [newRecipe, ...prev]);

    try {
      const { error } = await supabase.from('recipes').insert([recipeToDb(newRecipe)]);
      if (error) throw error;
    } catch (err) {
      reportWriteError('nuova ricetta', err);
    }
    return newRecipe;
  };

  const updateRecipe = async (id, updatedFields) => {
    const current = recipesRef.current.find((r) => r.id === id);
    if (!current) return;
    const targetRecipe = { ...current, ...updatedFields };
    setRecipes((prev) => prev.map((r) => (r.id === id ? targetRecipe : r)));

    try {
      const { error } = await supabase
        .from('recipes')
        .update(recipeToDb(targetRecipe))
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      reportWriteError('modifica ricetta', err);
    }
  };

  const deleteRecipe = async (id) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    try {
      const { error } = await supabase.from('recipes').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      reportWriteError('eliminazione ricetta', err);
    }
  };

  const saveRecipes = async (newList) => {
    const list = typeof newList === 'function' ? newList(recipesRef.current) : newList;
    setRecipes(list);

    try {
      const { error } = await supabase.from('recipes').upsert(list.map(recipeToDb));
      if (error) throw error;
    } catch (err) {
      reportWriteError('import ricette', err);
    }
  };

  const resetToSampleData = async () => {
    setRecipes(INITIAL_RECIPES);
    try {
      const { error: delErr } = await supabase
        .from('recipes')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (delErr) throw delErr;
      const { error } = await supabase.from('recipes').insert(INITIAL_RECIPES.map(recipeToDb));
      if (error) throw error;
    } catch (err) {
      reportWriteError('ripristino esempi', err);
    }
  };

  // SHOPPING LIST
  // Salva la nuova lista inviando al DB solo le differenze (righe nuove/cambiate e righe rimosse).
  // Prima veniva cancellata e reinserita tutta la tabella a ogni spunta: lento e, se
  // l'inserimento falliva, la lista andava persa.
  const saveShoppingList = async (newList) => {
    const list = typeof newList === 'function' ? newList(shoppingRef.current) : newList;
    setShoppingList(list);

    const synced = syncedShoppingRef.current;
    const nextIds = new Set(list.map((i) => i.id));
    const removedIds = [...synced.keys()].filter((id) => !nextIds.has(id));
    const changedRows = list
      .map(shoppingToDb)
      .filter((row) => synced.get(row.id) !== rowKey(row));

    try {
      if (changedRows.length > 0) {
        const { error } = await supabase.from('shopping_list').upsert(changedRows);
        if (error) throw error;
        changedRows.forEach((row) => synced.set(row.id, rowKey(row)));
      }
      if (removedIds.length > 0) {
        const { error } = await supabase.from('shopping_list').delete().in('id', removedIds);
        if (error) throw error;
        removedIds.forEach((id) => synced.delete(id));
      }
    } catch (err) {
      reportWriteError('lista della spesa', err);
    }
  };

  return {
    recipes,
    shoppingList,
    appConfig,
    isLoading,
    errorNotice,
    saveRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    resetToSampleData,
    saveShoppingList
  };
};

// Un'unica istanza condivisa da tutta l'app: un solo caricamento iniziale e un solo
// canale realtime, invece di uno per ogni componente che usava il hook.
const StorageContext = createContext(null);

export const StorageProvider = ({ children }) => {
  const value = useStorageState();
  return React.createElement(StorageContext.Provider, { value }, children);
};

export const useStorage = () => {
  const ctx = useContext(StorageContext);
  if (!ctx) throw new Error('useStorage deve essere usato dentro <StorageProvider>');
  return ctx;
};
