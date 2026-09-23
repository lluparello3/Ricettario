import { useState, useEffect, useCallback } from 'react';
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

export const useStorage = () => {
  const [recipes, setRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [appConfig, setAppConfigState] = useState({ theme: 'light', defaultServings: 4 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);

  // Sync to localStorage as offline fallback
  const syncLocalRecipes = (data) => {
    try {
      localStorage.setItem(LOCAL_KEYS.RECIPES, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage error syncing recipes', e);
    }
  };

  const syncLocalShopping = (data) => {
    try {
      localStorage.setItem(LOCAL_KEYS.SHOPPING, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage error syncing shopping list', e);
    }
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
        // Table is empty: insert seed initial recipes into Supabase
        const seedRows = INITIAL_RECIPES.map(recipeToDb);
        const { data: inserted, error: seedErr } = await supabase
          .from('recipes')
          .insert(seedRows)
          .select();

        if (seedErr) {
          console.error('Error seeding recipes to Supabase', seedErr);
          setRecipes(INITIAL_RECIPES);
          syncLocalRecipes(INITIAL_RECIPES);
        } else {
          const parsed = (inserted || []).map(recipeFromDb).filter(Boolean);
          setRecipes(parsed);
          syncLocalRecipes(parsed);
        }
      } else {
        const parsed = data.map(recipeFromDb).filter(Boolean);
        setRecipes(parsed);
        syncLocalRecipes(parsed);
      }
    } catch (err) {
      console.error('Fetch recipes failed, loading offline fallback:', err);
      setErrorNotice('Modalità offline: consultazione locale attiva.');
      try {
        const local = localStorage.getItem(LOCAL_KEYS.RECIPES);
        if (local) setRecipes(JSON.parse(local));
        else setRecipes(INITIAL_RECIPES);
      } catch (e) {
        setRecipes(INITIAL_RECIPES);
      }
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
      setShoppingList(parsed);
      syncLocalShopping(parsed);
    } catch (err) {
      console.error('Fetch shopping list failed, loading offline fallback:', err);
      try {
        const local = localStorage.getItem(LOCAL_KEYS.SHOPPING);
        if (local) setShoppingList(JSON.parse(local));
      } catch (e) {
        setShoppingList([]);
      }
    }
  }, []);

  // Initial Fetch & Realtime Subscriptions
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      setIsLoading(true);
      await Promise.all([fetchRecipes(), fetchShoppingList()]);
      if (isMounted) setIsLoading(false);
    };

    fetchInitialData();

    // Genera topic univoci per evitare conflitti con canali già esistenti
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
          console.warn('Realtime recipes channel error, fallback su polling/locale');
        }
      });

    const shoppingChannel = supabase
      .channel(`shopping_realtime_${channelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shopping_list' },
        (payload) => {
          if (!isMounted) return;
          if (payload.eventType === 'INSERT') {
            setShoppingList((prev) => {
              const exists = prev.some((i) => i.id === payload.new.id);
              return exists ? prev : [...prev, shoppingFromDb(payload.new)];
            });
          } else if (payload.eventType === 'UPDATE') {
            setShoppingList((prev) =>
              prev.map((i) => (i.id === payload.new.id ? shoppingFromDb(payload.new) : i))
            );
          } else if (payload.eventType === 'DELETE') {
            setShoppingList((prev) => prev.filter((i) => i.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // 3. Cleanup rigoroso allo smontaggio del componente
    return () => {
      isMounted = false;
      supabase.removeChannel(recipesChannel);
      supabase.removeChannel(shoppingChannel);
    };
  }, [fetchRecipes, fetchShoppingList]);

  // RECIPES CRUD OPERATIONS
  const addRecipe = async (recipe) => {
    const newRecipe = {
      ...recipe,
      id: recipe.id || crypto.randomUUID()
    };
    const dbRow = recipeToDb(newRecipe);

    setRecipes((prev) => [newRecipe, ...prev]);

    try {
      const { error } = await supabase.from('recipes').insert([dbRow]);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase addRecipe error:', err);
      setErrorNotice('Errore salvataggio ricetta su Supabase');
    }
    return newRecipe;
  };

  const updateRecipe = async (id, updatedFields) => {
    let targetRecipe;
    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          targetRecipe = { ...r, ...updatedFields };
          return targetRecipe;
        }
        return r;
      })
    );

    if (targetRecipe) {
      try {
        const dbRow = recipeToDb(targetRecipe);
        const { error } = await supabase
          .from('recipes')
          .update(dbRow)
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Supabase updateRecipe error:', err);
        setErrorNotice('Errore aggiornamento ricetta su Supabase');
      }
    }
  };

  const deleteRecipe = async (id) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    try {
      const { error } = await supabase.from('recipes').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase deleteRecipe error:', err);
    }
  };

  const saveRecipes = async (newList) => {
    const list = typeof newList === 'function' ? newList(recipes) : newList;
    setRecipes(list);
    syncLocalRecipes(list);

    try {
      const dbRows = list.map(recipeToDb);
      const { error } = await supabase.from('recipes').upsert(dbRows);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase saveRecipes error:', err);
    }
  };

  const resetToSampleData = async () => {
    setRecipes(INITIAL_RECIPES);
    syncLocalRecipes(INITIAL_RECIPES);
    try {
      await supabase.from('recipes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const seedRows = INITIAL_RECIPES.map(recipeToDb);
      await supabase.from('recipes').insert(seedRows);
    } catch (err) {
      console.error('Reset to sample data error:', err);
    }
  };

  // SHOPPING LIST CRUD OPERATIONS
  const addShoppingItem = async (item) => {
    const newItem = {
      ...item,
      id: item.id || crypto.randomUUID()
    };
    const dbRow = shoppingToDb(newItem);

    setShoppingList((prev) => [...prev, newItem]);

    try {
      const { error } = await supabase.from('shopping_list').insert([dbRow]);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase addShoppingItem error:', err);
    }
    return newItem;
  };

  const toggleShoppingItem = async (id, checked) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked } : item))
    );

    try {
      const { error } = await supabase
        .from('shopping_list')
        .update({ checked })
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase toggleShoppingItem error:', err);
    }
  };

  const deleteShoppingItem = async (id) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id));
    try {
      const { error } = await supabase.from('shopping_list').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase deleteShoppingItem error:', err);
    }
  };

  const clearBoughtItems = async () => {
    const checkedIds = shoppingList.filter((i) => i.checked).map((i) => i.id);
    setShoppingList((prev) => prev.filter((item) => !item.checked));

    if (checkedIds.length > 0) {
      try {
        const { error } = await supabase
          .from('shopping_list')
          .delete()
          .in('id', checkedIds);
        if (error) throw error;
      } catch (err) {
        console.error('Supabase clearBoughtItems error:', err);
      }
    }
  };

  const batchDeleteShoppingItems = async (ids) => {
    const idSet = new Set(ids);
    setShoppingList((prev) => prev.filter((item) => !idSet.has(item.id)));

    try {
      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .in('id', ids);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase batchDeleteShoppingItems error:', err);
    }
  };

  const batchMarkBoughtItems = async (ids) => {
    const idSet = new Set(ids);
    setShoppingList((prev) =>
      prev.map((item) => (idSet.has(item.id) ? { ...item, checked: true } : item))
    );

    try {
      const { error } = await supabase
        .from('shopping_list')
        .update({ checked: true })
        .in('id', ids);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase batchMarkBoughtItems error:', err);
    }
  };

  const saveShoppingList = async (newList) => {
    const list = typeof newList === 'function' ? newList(shoppingList) : newList;
    setShoppingList(list);
    syncLocalShopping(list);

    try {
      await supabase.from('shopping_list').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (list.length > 0) {
        const dbRows = list.map(shoppingToDb);
        const { error } = await supabase.from('shopping_list').insert(dbRows);
        if (error) throw error;
      }
    } catch (err) {
      console.error('Supabase saveShoppingList error:', err);
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
    saveShoppingList,
    addShoppingItem,
    toggleShoppingItem,
    deleteShoppingItem,
    clearBoughtItems,
    batchDeleteShoppingItems,
    batchMarkBoughtItems
  };
};
