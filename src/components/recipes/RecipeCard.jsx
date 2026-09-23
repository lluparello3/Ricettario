import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Link2, ShoppingBag, ChevronRight, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const RecipeCard = ({
  recipe,
  onAddToShopping,
  allRecipes = [],
  matchedIngredientName = null
}) => {
  const navigate = useNavigate();
  const {
    id,
    title,
    imageUrl,
    category,
    cuisine,
    difficulty,
    prepTimeMinutes,
    cookTimeMinutes,
    servings,
    linkedRecipeIds = [],
    tags = []
  } = recipe;

  // Find linked recipes objects
  const linkedRecipes = (linkedRecipeIds || [])
    .map((lId) => allRecipes.find((r) => r.id === lId))
    .filter(Boolean);

  const getDifficultyBadgeVariant = (diff) => {
    switch ((diff || '').toLowerCase()) {
      case 'facile':
        return 'facile';
      case 'media':
        return 'media';
      case 'difficile':
        return 'difficile';
      default:
        return 'stone';
    }
  };

  const handleCardClick = () => {
    navigate(`/recipes/${id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer select-none"
    >
      {/* Recipe Image or Fallback Header */}
      <div className="relative h-48 sm:h-52 w-full bg-stone-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        <div
          className={`w-full h-full bg-gradient-to-br from-amber-100 via-stone-100 to-amber-50 items-center justify-center p-6 ${
            imageUrl ? 'hidden' : 'flex'
          }`}
        >
          <span className="text-4xl">🍳</span>
        </div>

        {/* Category & Cuisine Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          {category && <Badge variant="amber">{category}</Badge>}
          {cuisine && <Badge variant="crema">{cuisine}</Badge>}
        </div>

        {/* Difficulty Badge Top Right */}
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <Badge variant={getDifficultyBadgeVariant(difficulty)}>
            {difficulty || 'Media'}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="text-lg font-serif font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug mb-2">
            {title}
          </h3>

          {/* Matched Ingredient Indicator Badge if search matched an ingredient */}
          {matchedIngredientName && (
            <div className="mb-2.5 inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Contiene: <strong className="underline">{matchedIngredientName}</strong></span>
            </div>
          )}

          {/* Linked Recipes Notification */}
          {linkedRecipes.length > 0 && (
            <div className="mb-3 flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
              <Link2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">
                Base: {linkedRecipes.map((r) => r.title).join(', ')}
              </span>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Meta Info & Quick Actions */}
        <div className="pt-3 border-t border-stone-100 mt-2">
          <div className="flex items-center justify-between text-xs text-stone-600 mb-3 font-medium">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>{(prepTimeMinutes || 0) + (cookTimeMinutes || 0)} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <span>{servings} porz.</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" fullWidth className="text-xs pointer-events-none">
              Vedi Ricetta <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Button>

            {onAddToShopping && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToShopping(recipe);
                }}
                className="w-9 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center transition-all active:scale-95 shrink-0"
                title="Aggiungi ingredienti alla lista spesa"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
