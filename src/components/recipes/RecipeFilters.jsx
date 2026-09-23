import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/Input';

export const RecipeFilters = ({
  searchQuery,
  setSearchQuery,
  selectedCategories = [],
  onToggleCategory,
  onClearCategories,
  selectedCuisine,
  setSelectedCuisine,
  selectedDifficulty,
  setSelectedDifficulty,
  categories = [],
  cuisines = []
}) => {
  const difficulties = ['Facile', 'Media', 'Difficile'];

  const hasActiveFilters =
    searchQuery || (selectedCategories && selectedCategories.length > 0) || selectedCuisine || selectedDifficulty;

  const resetFilters = () => {
    setSearchQuery('');
    if (onClearCategories) onClearCategories();
    setSelectedCuisine('');
    setSelectedDifficulty('');
  };

  return (
    <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs mb-6 space-y-3.5 max-w-full overflow-hidden">
      {/* Search Input */}
      <div className="relative w-full">
        <Input
          placeholder="Cerca per titolo, ingrediente o tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={Search}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills & Dropdowns */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-1.5 max-w-full">
          <button
            type="button"
            onClick={() => onClearCategories && onClearCategories()}
            className={`
              px-2.5 py-1 text-xs font-semibold rounded-xl transition-all select-none
              ${
                selectedCategories.length === 0
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }
            `}
          >
            Tutti
          </button>
          {categories.map((cat) => {
            const isCatSelected = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onToggleCategory && onToggleCategory(cat)}
                className={`
                  px-2.5 py-1 text-xs font-semibold rounded-xl transition-all select-none
                  ${
                    isCatSelected
                      ? 'bg-amber-600 text-white shadow-xs font-bold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }
                `}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Filters Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Cuisine Select */}
          {cuisines.length > 0 && (
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 max-w-[140px]"
            >
              <option value="">Tutte le cucine</option>
              {cuisines.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* Difficulty Select */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 max-w-[140px]"
          >
            <option value="">Tutte le difficoltà</option>
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-amber-700 hover:underline font-semibold px-1 py-1 flex items-center gap-1 shrink-0"
            >
              <X className="w-3.5 h-3.5" /> Azzera
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
