import React, { useState, useMemo } from 'react';
import { RecipeGrid } from '../components/recipes/RecipeGrid';
import { RecipeFilters } from '../components/recipes/RecipeFilters';
import { Button } from '../components/ui/Button';
import { ShoppingBag, CheckSquare, Square, PlusCircle, Sparkles, X, Clock, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Modal } from '../components/ui/Modal';

export const MACRO_CATEGORIES = [
  { name: 'Antipasto', icon: '🥗' },
  { name: 'Primo', icon: '🍝' },
  { name: 'Piatto Unico', icon: '🍲' },
  { name: 'Carne', icon: '🥩' },
  { name: 'Pesce', icon: '🐟' },
  { name: 'Contorno', icon: '🥬' },
  { name: 'Dolce', icon: '🍰' },
  { name: 'Altro', icon: '📦' }
];

export const CatalogPage = ({ recipes = [], onAddRecipesToShopping }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [maxTime, setMaxTime] = useState('');

  // Modal prompt state for linked recipes import
  const [pendingShoppingImport, setPendingShoppingImport] = useState(null);

  // Extract unique cuisines & tags
  const cuisines = useMemo(() => {
    const set = new Set();
    recipes.forEach((r) => {
      if (r.cuisine) set.add(r.cuisine);
    });
    return Array.from(set);
  }, [recipes]);

  const allTags = useMemo(() => {
    const set = new Set();
    recipes.forEach((r) => {
      (r.tags || []).forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [recipes]);

  // Calculate counts per macro-category
  const categoryCounts = useMemo(() => {
    const counts = {};
    recipes.forEach((r) => {
      const cat = r.category || 'Altro';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [recipes]);

  // Multi-Category Toggle
  const toggleCategory = (catName) => {
    setSelectedCategories((prev) =>
      prev.includes(catName)
        ? prev.filter((c) => c !== catName)
        : [...prev, catName]
    );
  };

  const clearCategories = () => {
    setSelectedCategories([]);
  };

  // Extended Full-Text Filter Logic (Supports multiple selected categories)
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const q = searchQuery.trim().toLowerCase();

      if (q) {
        const titleMatch = r.title.toLowerCase().includes(q);
        const mainIngMatch = (r.mainIngredient || '').toLowerCase().includes(q);
        const tagsMatch = (r.tags || []).some((t) => t.toLowerCase().includes(q));
        const ingMatch = (r.ingredients || []).some((i) =>
          i.name.toLowerCase().includes(q)
        );
        if (!titleMatch && !mainIngMatch && !tagsMatch && !ingMatch) return false;
      }

      // Macro Categories (Multi-select)
      if (selectedCategories.length > 0 && !selectedCategories.includes(r.category)) {
        return false;
      }

      // Cuisine
      if (selectedCuisine && r.cuisine !== selectedCuisine) return false;
      // Difficulty
      if (selectedDifficulty && r.difficulty !== selectedDifficulty) return false;
      // Tag
      if (selectedTag && !(r.tags || []).includes(selectedTag)) return false;
      // Max Time
      if (maxTime) {
        const totalTime = (r.prepTimeMinutes || 0) + (r.cookTimeMinutes || 0);
        if (totalTime > Number(maxTime)) return false;
      }

      return true;
    });
  }, [
    recipes,
    searchQuery,
    selectedCategories,
    selectedCuisine,
    selectedDifficulty,
    selectedTag,
    maxTime
  ]);

  // Helper to determine if search query matched an ingredient name (and not the title)
  const getMatchedIngredientName = (recipe) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || recipe.title.toLowerCase().includes(q)) return null;

    const matchedIng = (recipe.ingredients || []).find((ing) =>
      ing.name.toLowerCase().includes(q)
    );

    return matchedIng ? matchedIng.name : null;
  };

  // Handle single recipe quick add to shopping
  const handleQuickAddSingle = (recipe) => {
    const hasLinked = Array.isArray(recipe.linkedRecipeIds) && recipe.linkedRecipeIds.length > 0;
    if (hasLinked) {
      setPendingShoppingImport({
        recipeSelections: [{ recipe, servings: recipe.servings }],
        linkedCount: recipe.linkedRecipeIds.length
      });
    } else {
      onAddRecipesToShopping([{ recipe, servings: recipe.servings }], false);
    }
  };

  const confirmShoppingImport = (includeLinked) => {
    if (pendingShoppingImport) {
      onAddRecipesToShopping(
        pendingShoppingImport.recipeSelections,
        includeLinked
      );
      setPendingShoppingImport(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Catalogo Ricette
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Tutte le ricette salvate nel tuo archivio familiare ({filteredRecipes.length} di {recipes.length})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/recipes/new">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Crea Ricetta
            </Button>
          </Link>
        </div>
      </div>

      {/* Macro-Categories Interactive Grid (Multi-Select) */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Sfoglia per Categoria {selectedCategories.length > 0 && `(${selectedCategories.length} selezionate)`}
          </h2>
          {selectedCategories.length > 0 && (
            <button
              onClick={clearCategories}
              className="text-xs text-amber-700 font-semibold hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Mostra Tutte ({recipes.length})
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {MACRO_CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat.name);
            const count = categoryCounts[cat.name] || 0;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => toggleCategory(cat.name)}
                className={`
                  flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all select-none
                  ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm scale-105 font-bold ring-2 ring-amber-400'
                      : 'bg-stone-50 text-stone-700 border-stone-200/80 hover:bg-amber-50 hover:border-amber-300'
                  }
                `}
              >
                <span className="text-xl sm:text-2xl mb-1">{cat.icon}</span>
                <span className="text-[11px] sm:text-xs font-semibold truncate max-w-full leading-tight">
                  {cat.name}
                </span>
                <span
                  className={`text-[9px] mt-0.5 font-bold px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-amber-800 text-white' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar & Filters */}
      <RecipeFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
        onClearCategories={clearCategories}
        selectedCuisine={selectedCuisine}
        setSelectedCuisine={setSelectedCuisine}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
        categories={MACRO_CATEGORIES.map((c) => c.name)}
        cuisines={cuisines}
      />

      {/* Secondary Pill Filters for Tags & Max Time */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {/* Max Time Filter */}
        <div className="flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Tempo max:</span>
          <select
            value={maxTime}
            onChange={(e) => setMaxTime(e.target.value)}
            className="bg-transparent font-bold text-amber-800 focus:outline-none"
          >
            <option value="">Tutti</option>
            <option value="15">≤ 15 min</option>
            <option value="30">≤ 30 min</option>
            <option value="60">≤ 60 min (1h)</option>
            <option value="120">≤ 120 min (2h)</option>
          </select>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-xs text-stone-400 flex items-center gap-1 ml-2">
              <Tag className="w-3.5 h-3.5" /> Tag:
            </span>
            {allTags.slice(0, 6).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={`
                  px-2.5 py-1 text-xs font-medium rounded-lg transition-all
                  ${
                    selectedTag === tag
                      ? 'bg-amber-700 text-white font-bold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }
                `}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Grid */}
      <RecipeGrid
        recipes={filteredRecipes}
        onAddToShopping={handleQuickAddSingle}
        allRecipes={recipes}
        getMatchedIngredientName={getMatchedIngredientName}
      />

      {/* Prompt Modal for Linked Base Recipes Import */}
      <Modal
        isOpen={!!pendingShoppingImport}
        onClose={() => setPendingShoppingImport(null)}
        title="Importazione Preparazioni Base"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-700 leading-relaxed">
            La ricetta selezionata ha delle <strong>preparazioni base collegate</strong> (es. sfoglia o brodo).
          </p>
          <p className="text-sm font-semibold text-stone-800">
            Desideri importare nella lista della spesa anche gli ingredienti delle preparazioni base collegate?
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => confirmShoppingImport(false)}
            >
              No, solo la ricetta principale
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => confirmShoppingImport(true)}
            >
              Sì, includi anche le basi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
