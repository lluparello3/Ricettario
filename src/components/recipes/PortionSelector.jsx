import React from 'react';
import { Minus, Plus, Users } from 'lucide-react';

export const PortionSelector = ({ servings, onChange, min = 1, max = 50 }) => {
  const handleDecrement = () => {
    if (servings > min) onChange(servings - 1);
  };

  const handleIncrement = () => {
    if (servings < max) onChange(servings + 1);
  };

  return (
    <div className="inline-flex items-center gap-1 bg-amber-50/90 border border-amber-200/80 rounded-xl p-1 shadow-2xs shrink-0">
      <div className="hidden sm:flex items-center gap-1 px-1.5 text-stone-700 font-semibold text-xs">
        <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Porzioni:</span>
      </div>

      <div className="flex items-center gap-0.5 bg-white rounded-lg border border-amber-200 px-1 py-0.5">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={servings <= min}
          className="w-7 h-7 rounded-md flex items-center justify-center text-stone-700 hover:bg-amber-100 disabled:opacity-30 transition-colors active:scale-90"
          aria-label="Riduci porzioni"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <span className="w-7 text-center font-bold text-stone-900 text-sm select-none">
          {servings}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={servings >= max}
          className="w-7 h-7 rounded-md flex items-center justify-center text-stone-700 hover:bg-amber-100 disabled:opacity-30 transition-colors active:scale-90"
          aria-label="Aumenta porzioni"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
