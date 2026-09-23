import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  Users,
  Printer,
  ShoppingBag,
  ChefHat,
  Edit,
  Trash2,
  ArrowLeft,
  Link2,
  Utensils
} from 'lucide-react';
import { PortionSelector } from '../components/recipes/PortionSelector';
import { CookingModeModal } from '../components/recipes/CookingModeModal';
import { LinkedRecipesBadge } from '../components/recipes/LinkedRecipesBadge';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { scaleIngredientsList } from '../utils/recipeScaler';

export const RecipeDetailPage = ({ recipes = [], onDeleteRecipe, onAddRecipesToShopping }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const recipe = useMemo(() => recipes.find((r) => r.id === id), [recipes, id]);

  const [currentServings, setCurrentServings] = useState(recipe?.servings || 4);
  const [isCookingModalOpen, setIsCookingModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLinkedShoppingModalOpen, setIsLinkedShoppingModalOpen] = useState(false);

  if (!recipe) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">
          Ricetta non trovata
        </h2>
        <p className="text-stone-500 mb-6">La ricetta richiesta potrebbe essere stata rimossa.</p>
        <Link to="/catalog">
          <Button variant="primary" icon={ArrowLeft}>
            Torna al Catalogo
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate scaled ingredients dynamically
  const scaledIngredients = scaleIngredientsList(
    recipe.ingredients,
    recipe.servings,
    currentServings
  );

  // Find linked base recipes objects
  const linkedRecipes = (recipe.linkedRecipeIds || [])
    .map((lId) => recipes.find((r) => r.id === lId))
    .filter(Boolean);

  // Parse step instructions for mentions like @NomeRicetta
  const renderStepInstruction = (instruction) => {
    if (!instruction) return null;

    // Sort recipes by title length descending so longest matching title is parsed first
    const sortedRecipes = [...recipes].sort((a, b) => b.title.length - a.title.length);

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (sortedRecipes.length === 0) return instruction;

    const pattern = `@(${sortedRecipes.map((r) => escapeRegex(r.title)).join('|')})`;
    const regex = new RegExp(pattern, 'gi');

    const parts = instruction.split(regex);

    return parts.map((part, index) => {
      const matchedRecipe = sortedRecipes.find(
        (r) => r.title.toLowerCase() === part.toLowerCase()
      );

      if (matchedRecipe) {
        return (
          <Link
            key={index}
            to={`/recipes/${matchedRecipe.id}`}
            className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg border border-amber-300/80 transition-colors my-0.5"
          >
            <Link2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            @{matchedRecipe.title}
          </Link>
        );
      }
      return part;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShoppingAddClick = () => {
    if (linkedRecipes.length > 0) {
      setIsLinkedShoppingModalOpen(true);
    } else {
      onAddRecipesToShopping([{ recipe, servings: currentServings }], false);
    }
  };

  const confirmShoppingAdd = (includeLinked) => {
    onAddRecipesToShopping([{ recipe, servings: currentServings }], includeLinked);
    setIsLinkedShoppingModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    onDeleteRecipe(recipe.id);
    setIsDeleteModalOpen(false);
    navigate('/catalog');
  };

  return (
    <article className="printable-recipe max-w-5xl mx-auto space-y-5">
      {/* Top Header Actions (No Print) */}
      <div className="flex items-center justify-between no-print border-b border-stone-200/80 pb-3 gap-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Indietro
        </button>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            icon={Printer}
            className="hidden sm:inline-flex"
          >
            Stampa PDF
          </Button>

          <Link to={`/recipes/${recipe.id}/edit`}>
            <Button variant="secondary" size="sm" icon={Edit}>
              Modifica
            </Button>
          </Link>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            icon={Trash2}
          >
            Elimina
          </Button>
        </div>
      </div>

      {/* Hero Section: Image & Title */}
      <div className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs">
        {recipe.imageUrl && (
          <div className="relative h-48 sm:h-72 md:h-80 w-full bg-stone-100">
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
        )}

        <div className="p-4 sm:p-8 space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {recipe.category && <Badge variant="amber" size="md">{recipe.category}</Badge>}
            {recipe.cuisine && <Badge variant="crema" size="md">{recipe.cuisine}</Badge>}
            {recipe.difficulty && (
              <Badge variant={recipe.difficulty.toLowerCase()} size="md">
                {recipe.difficulty}
              </Badge>
            )}
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 leading-snug sm:leading-tight">
            {recipe.title}
          </h1>

          {/* Linked Base Recipes Badges */}
          {linkedRecipes.length > 0 && (
            <LinkedRecipesBadge linkedRecipes={linkedRecipes} />
          )}

          {/* Quick Details Bar */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-8 pt-3 border-t border-stone-100 text-stone-700 font-medium text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-[10px] text-stone-400 block uppercase font-semibold">Tempo Totale</span>
                <span>{(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)} min</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-orange-600 shrink-0" />
              <div>
                <span className="text-[10px] text-stone-400 block uppercase font-semibold">Ingrediente Principale</span>
                <span>{recipe.mainIngredient || 'Varie'}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] text-stone-400 block uppercase font-semibold">Porzioni Base</span>
                <span>{recipe.servings} Persone</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Bar: Cooking Mode & Add to Shopping (No Print) */}
      <div className="no-print flex flex-col sm:flex-row items-center gap-3 bg-amber-700 text-white p-4 sm:p-5 rounded-2xl shadow-lg">
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-sm sm:text-lg font-serif font-bold flex items-center justify-center sm:justify-start gap-1.5">
            <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" /> Pronto per Cucinare?
          </h3>
          <p className="text-[11px] sm:text-xs text-amber-100">
            Attiva la modalità cottura per mantenere il display acceso e seguire i passaggi.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <Button
            variant="terracotta"
            size="md"
            fullWidth
            onClick={() => setIsCookingModalOpen(true)}
            icon={ChefHat}
            className="cooking-mode-btn"
          >
            Modalità Cottura
          </Button>

          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={handleShoppingAddClick}
            icon={ShoppingBag}
            className="border-white text-white hover:bg-amber-800"
          >
            Aggiungi a Spesa
          </Button>
        </div>
      </div>

      {/* Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
        {/* Ingredients Column */}
        <section className="lg:col-span-4 bg-white p-4 sm:p-6 rounded-3xl border border-stone-200/80 shadow-xs h-fit printable-section">
          {/* Header with Title and Portion Stepper */}
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-stone-100 gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 shrink-0">
              Ingredienti
            </h2>
            <div className="no-print">
              <PortionSelector
                servings={currentServings}
                onChange={setCurrentServings}
              />
            </div>
          </div>

          <p className="text-[11px] text-stone-500 mb-2.5 font-medium no-print">
            Dosi per <strong>{currentServings}</strong> porzioni:
          </p>

          <ul className="space-y-2">
            {scaledIngredients.map((ing) => (
              <li
                key={ing.id || ing.name}
                className="flex items-start justify-between py-1.5 border-b border-stone-100/80 last:border-0 gap-2"
              >
                <span className="text-xs sm:text-sm font-semibold text-stone-800">
                  {ing.name}
                </span>
                <span className="text-xs sm:text-sm font-bold text-amber-700 shrink-0">
                  {ing.amount != null ? `${ing.amount} ${ing.unit}` : ing.unit || 'q.b.'}
                </span>
              </li>
            ))}
          </ul>

          {recipe.notes && (
            <div className="mt-5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-stone-700 text-xs leading-relaxed">
              <span className="font-bold text-amber-900 block mb-1 uppercase tracking-wider text-[10px]">
                Note del Cuoco:
              </span>
              {recipe.notes}
            </div>
          )}
        </section>

        {/* Step-by-Step Instructions Column */}
        <section className="lg:col-span-8 bg-white p-4 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs printable-section">
          <h2 className="text-lg sm:text-2xl font-serif font-bold text-stone-900 mb-5 pb-2.5 border-b border-stone-100">
            Procedimento
          </h2>

          <ol className="space-y-5">
            {(recipe.steps || []).map((step) => (
              <li key={step.stepNumber} className="flex gap-3 items-start">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  {step.stepNumber}
                </div>
                <div className="flex-1 text-xs sm:text-base text-stone-800 leading-relaxed font-sans">
                  {renderStepInstruction(step.instruction)}
                </div>
              </li>
            ))}
          </ol>

          {/* Tags list */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="mt-6 pt-5 border-t border-stone-100 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mr-1">
                Tag:
              </span>
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Cooking Mode Modal */}
      <CookingModeModal
        isOpen={isCookingModalOpen}
        onClose={() => setIsCookingModalOpen(false)}
        recipe={recipe}
      />

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Elimina Ricetta"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-700">
            Sei sicuro di voler eliminare definitivamente <strong>"{recipe.title}"</strong> dal tuo ricettario? L'operazione non è reversibile.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Annulla
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Elimina Definitivemente
            </Button>
          </div>
        </div>
      </Modal>

      {/* Linked Base Recipes Prompt Modal */}
      <Modal
        isOpen={isLinkedShoppingModalOpen}
        onClose={() => setIsLinkedShoppingModalOpen(false)}
        title="Importazione Preparazioni Base"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-700">
            Questa ricetta richiede delle preparazioni base (es. {linkedRecipes.map((r) => r.title).join(', ')}).
          </p>
          <p className="text-sm font-semibold text-stone-800">
            Vuoi includere nella lista della spesa anche gli ingredienti della preparazione base?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => confirmShoppingAdd(false)}
            >
              No, solo questa ricetta
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => confirmShoppingAdd(true)}
            >
              Sì, includi preparazione base
            </Button>
          </div>
        </div>
      </Modal>
    </article>
  );
};
