import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ShoppingBag,
  Flame,
  Sparkles,
  ArrowRight,
  Clock,
  Utensils
} from 'lucide-react';
import { RecipeCard } from '../components/recipes/RecipeCard';
import { Badge } from '../components/ui/Badge';

export const HomePage = ({ recipes = [], onAddToShopping }) => {
  const navigate = useNavigate();

  // Extract up to 7 random recipes for the Carousel "Ispirazione di Oggi"
  const carouselRecipes = useMemo(() => {
    if (!recipes || recipes.length === 0) return [];
    const shuffled = [...recipes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 7);
  }, [recipes]);

  const recentRecipes = recipes.slice(0, 3);
  const baseRecipes = recipes.filter((r) => r.category === 'Preparazione base');

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

  return (
    <div className="space-y-8 w-full max-w-full overflow-x-hidden">
      {/* Daily Inspiration Carousel Section ("Ispirazione di Oggi") */}
      {carouselRecipes.length > 0 && (
        <section className="space-y-3 w-full max-w-full overflow-hidden">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" /> Ispirazione di Oggi
              </h2>
              <p className="text-xs text-stone-500">
                Idee e ricette consigliate per il tuo menù di oggi
              </p>
            </div>
            <span className="text-xs text-amber-700 font-semibold hidden sm:inline-block">
              Scorri a destra ➔
            </span>
          </div>

          {/* Carousel Scroll Wrapper: strictly confined overflow-x-auto inside max-w-full */}
          <div className="w-full max-w-full overflow-hidden">
            <div className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none py-2 px-0.5 w-full max-w-full">
              {carouselRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                  className="w-56 sm:w-68 shrink-0 snap-start bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group select-none"
                >
                  {/* Image / Fallback Header */}
                  <div className="relative h-32 sm:h-40 w-full bg-stone-100 overflow-hidden">
                    {recipe.imageUrl ? (
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}

                    <div
                      className={`w-full h-full bg-gradient-to-br from-amber-100 via-stone-100 to-amber-50 items-center justify-center ${
                        recipe.imageUrl ? 'hidden' : 'flex'
                      }`}
                    >
                      <span className="text-3xl">👨‍🍳</span>
                    </div>

                    {/* Category Badge */}
                    {recipe.category && (
                      <div className="absolute top-2 left-2 z-10 pointer-events-none">
                        <Badge variant="amber" size="sm">
                          {recipe.category}
                        </Badge>
                      </div>
                    )}

                    {/* Difficulty Badge */}
                    {recipe.difficulty && (
                      <div className="absolute top-2 right-2 z-10 pointer-events-none">
                        <Badge variant={getDifficultyBadgeVariant(recipe.difficulty)} size="sm">
                          {recipe.difficulty}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1 text-sm sm:text-base leading-snug mb-1">
                        {recipe.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-stone-500 line-clamp-1 mb-2.5">
                        {recipe.mainIngredient ? `Con ${recipe.mainIngredient}` : recipe.cuisine || 'Cucina di casa'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-600 font-medium pt-2 border-t border-stone-100">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)}m</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-700 font-bold group-hover:translate-x-0.5 transition-transform">
                        <span>Vedi</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Action Navigation Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 w-full max-w-full">
        <Link
          to="/catalog"
          className="group bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <BookOpen className="w-5.5 h-5.5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 group-hover:text-amber-700 transition-colors text-sm sm:text-base">
                Tutte le Ricette
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-500">{recipes.length} ricette salvate</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>

        <Link
          to="/shopping"
          className="group bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <ShoppingBag className="w-5.5 h-5.5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 group-hover:text-emerald-700 transition-colors text-sm sm:text-base">
                Lista Spesa
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-500">Aggregazione e azioni massive</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>

        <Link
          to="/settings"
          className="group bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Sparkles className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 group-hover:text-amber-700 transition-colors text-sm sm:text-base">
                Backup JSON
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-500">Export & Import senza perdite</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>
      </section>

      {/* Base Preparations Section */}
      {baseRecipes.length > 0 && (
        <section className="space-y-4 w-full max-w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-600" /> Preparazioni Base
              </h2>
              <p className="text-xs text-stone-500">Basi riutilizzabili e collegabili ai tuoi piatti</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {baseRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onAddToShopping={onAddToShopping}
                allRecipes={recipes}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Recipes */}
      <section className="space-y-4 w-full max-w-full">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-600" /> Ultime Ricette Aggiunte
            </h2>
            <p className="text-xs text-stone-500">I tuoi ultimi piatti censiti nel ricettario</p>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            Vedi tutte <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {recentRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onAddToShopping={onAddToShopping}
              allRecipes={recipes}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
