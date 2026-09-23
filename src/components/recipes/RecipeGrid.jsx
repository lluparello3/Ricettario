import React from 'react';
import { RecipeCard } from './RecipeCard';
import { UtensilsCrossed } from 'lucide-react';

export const RecipeGrid = ({
  recipes = [],
  onAddToShopping,
  allRecipes = [],
  getMatchedIngredientName
}) => {
  if (!recipes || recipes.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white/60 border-2 border-dashed border-stone-200 rounded-3xl my-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-serif font-bold text-stone-800 mb-1">
          Nessuna ricetta trovata
        </h3>
        <p className="text-sm text-stone-500 max-w-sm mx-auto">
          Prova a modificare i filtri di ricerca o aggiungi una nuova ricetta al tuo ricettario di famiglia.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onAddToShopping={onAddToShopping}
          allRecipes={allRecipes}
          matchedIngredientName={
            getMatchedIngredientName ? getMatchedIngredientName(recipe) : null
          }
        />
      ))}
    </div>
  );
};
