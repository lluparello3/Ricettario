import React from 'react';
import { Link } from 'react-router-dom';
import { Link2 } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const LinkedRecipesBadge = ({ linkedRecipes = [], onSelectRecipe }) => {
  if (!linkedRecipes || linkedRecipes.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 my-2">
      <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
        <Link2 className="w-3.5 h-3.5 text-amber-600" /> Preparazione base:
      </span>
      {linkedRecipes.map((recipe) => (
        <span key={recipe.id || recipe.title}>
          {onSelectRecipe ? (
            <Badge
              variant="amber"
              size="sm"
              onClick={() => onSelectRecipe(recipe)}
              className="cursor-pointer hover:underline"
            >
              @{recipe.title}
            </Badge>
          ) : (
            <Link to={`/recipes/${recipe.id}`}>
              <Badge variant="amber" size="sm" className="hover:underline">
                @{recipe.title}
              </Badge>
            </Link>
          )}
        </span>
      ))}
    </div>
  );
};
