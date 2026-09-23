import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Sun, CheckCircle2, Circle, Clock, Scale } from 'lucide-react';
import { useWakeLock } from '../../hooks/useWakeLock';
import { PortionSelector } from './PortionSelector';
import { scaleIngredientsList } from '../../utils/recipeScaler';

export const CookingModeModal = ({ isOpen, onClose, recipe }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [currentServings, setCurrentServings] = useState(recipe?.servings || 4);
  const { isActive, requestWakeLock, releaseWakeLock } = useWakeLock();
  const isPushedRef = useRef(false);

  useEffect(() => {
    if (recipe) {
      setCurrentServings(recipe.servings);
    }
  }, [recipe]);

  useEffect(() => {
    if (isOpen) {
      requestWakeLock();
      setCurrentStepIndex(0);
      setCompletedSteps(new Set());
      document.body.style.overflow = 'hidden';

      // Push history state to handle smartphone native back button
      window.history.pushState({ modalOpen: true }, '');
      isPushedRef.current = true;

      const handlePopState = () => {
        isPushedRef.current = false;
        onClose();
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        document.body.style.overflow = 'unset';
        releaseWakeLock();
        window.removeEventListener('popstate', handlePopState);
        if (isPushedRef.current && window.history.state?.modalOpen) {
          isPushedRef.current = false;
          window.history.back();
        }
      };
    }
  }, [isOpen, requestWakeLock, releaseWakeLock, onClose]);

  if (!isOpen || !recipe) return null;

  const steps = recipe.steps || [];
  const currentStep = steps[currentStepIndex];
  const scaledIngredients = scaleIngredientsList(recipe.ingredients, recipe.servings, currentServings);

  const toggleStepCompletion = (stepNum) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNum)) {
        next.delete(stepNum);
      } else {
        next.add(stepNum);
      }
      return next;
    });
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full bg-stone-900 text-stone-100 flex flex-col no-print overflow-hidden z-50">
      {/* Top Header */}
      <header className="px-3 sm:px-4 py-2.5 bg-stone-800/90 border-b border-stone-700/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-amber-600/30 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
            👨‍🍳
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-base font-serif font-bold text-white truncate">
              {recipe.title}
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)}m
              </span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">
                Passo {currentStepIndex + 1} di {steps.length}
              </span>
            </div>
          </div>
        </div>

        {/* Wake Lock Status Indicator & Close */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className={`
              flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border transition-all
              ${
                isActive
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                  : 'bg-stone-800 text-stone-400 border-stone-700'
              }
            `}
          >
            <Sun className={`w-3 h-3 ${isActive ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">
              {isActive ? 'Schermo attivo' : 'Standby'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors shrink-0"
            aria-label="Esci dalla modalità cottura"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Ingredients Quick View Sidebar */}
        <aside className="w-full md:w-80 bg-stone-800/60 border-b md:border-b-0 md:border-r border-stone-700/60 p-3 sm:p-4 overflow-y-auto max-h-[25vh] md:max-h-full shrink-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-[11px] sm:text-xs font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Scale className="w-3.5 h-3.5 text-amber-500" /> Ingredienti
            </h3>
            <PortionSelector
              servings={currentServings}
              onChange={setCurrentServings}
            />
          </div>

          <ul className="space-y-1 text-xs">
            {scaledIngredients.map((ing) => (
              <li
                key={ing.id || ing.name}
                className="flex items-start justify-between py-1 px-2 rounded-lg bg-stone-800/80 border border-stone-700/50 gap-2"
              >
                <span className="text-stone-200 font-medium truncate">{ing.name}</span>
                <span className="text-amber-400 font-bold shrink-0">
                  {ing.amount != null ? `${ing.amount} ${ing.unit}` : ing.unit || 'q.b.'}
                </span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Step Display Area */}
        <main className="flex-1 flex flex-col justify-between p-3 sm:p-6 overflow-y-auto bg-gradient-to-b from-stone-900 to-stone-950 min-h-0 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {currentStep ? (
            <div className="max-w-2xl mx-auto w-full my-auto space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold">
                  Passaggio {currentStep.stepNumber}
                </span>

                <button
                  type="button"
                  onClick={() => toggleStepCompletion(currentStep.stepNumber)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all
                    ${
                      completedSteps.has(currentStep.stepNumber)
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700 border border-stone-700'
                    }
                  `}
                >
                  {completedSteps.has(currentStep.stepNumber) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Fatto
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" /> Segna Fatto
                    </>
                  )}
                </button>
              </div>

              {/* High Contrast Step Instruction */}
              <div className="text-lg sm:text-2xl md:text-3xl font-sans font-medium text-stone-100 leading-relaxed tracking-wide p-4 sm:p-6 rounded-2xl bg-stone-800/40 border border-stone-700/40 shadow-inner max-h-[45vh] overflow-y-auto">
                {currentStep.instruction}
              </div>
            </div>
          ) : (
            <div className="text-center my-auto text-stone-400 text-sm">Nessun passaggio disponibile.</div>
          )}

          {/* Bottom Prev / Next Nav */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-800 max-w-2xl mx-auto w-full shrink-0 gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-1 px-3 sm:px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-200 font-semibold text-xs sm:text-sm transition-colors min-h-[40px]"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Indietro
            </button>

            {/* Step Dots */}
            <div className="hidden sm:flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`
                    h-2 rounded-full transition-all
                    ${
                      idx === currentStepIndex
                        ? 'bg-amber-500 w-5'
                        : completedSteps.has(steps[idx].stepNumber)
                        ? 'bg-emerald-500 w-2'
                        : 'bg-stone-700 w-2 hover:bg-stone-600'
                    }
                  `}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentStepIndex === steps.length - 1}
              className="flex items-center gap-1 px-4 sm:px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-30 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20 transition-all min-h-[40px]"
            >
              Avanti <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
