import React from 'react';
import { Check, Trash2, Utensils, CheckSquare, Square } from 'lucide-react';

export const ShoppingItemRow = ({
  item,
  onToggleCheck,
  onDelete,
  isSelected = false,
  onToggleSelect
}) => {
  const { id, name, checked, quantities = [], recipeSources = [] } = item;

  const formattedQuantities = quantities
    .map((q) => {
      if (q.amount != null && !isNaN(q.amount)) {
        return `${q.amount} ${q.unit}`.trim();
      }
      return q.unit || 'q.b.';
    })
    .join(' + ');

  return (
    <div
      className={`
        flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all duration-200 gap-2.5 sm:gap-3
        ${
          isSelected
            ? 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-400/50 shadow-xs'
            : checked
            ? 'bg-stone-100/70 border-stone-200/60 opacity-60'
            : 'bg-white border-stone-200 shadow-xs hover:border-amber-300'
        }
      `}
    >
      <div className="flex items-center gap-2.5 sm:gap-3.5 flex-1 min-w-0">
        {/* Selection Checkbox for Multi-Select */}
        {onToggleSelect && (
          <button
            type="button"
            onClick={() => onToggleSelect(id)}
            className="text-amber-600 hover:text-amber-700 shrink-0 p-0.5"
            aria-label={isSelected ? 'Deseleziona elemento' : 'Seleziona elemento'}
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 fill-amber-100 text-amber-600" />
            ) : (
              <Square className="w-5 h-5 text-stone-300 hover:text-stone-400" />
            )}
          </button>
        )}

        {/* Bought / Check Toggle */}
        <button
          type="button"
          onClick={() => onToggleCheck(id)}
          className={`
            w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 active:scale-90
            ${
              checked
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-stone-300 hover:border-amber-500 bg-white'
            }
          `}
          aria-label={checked ? 'Segna come da comprare' : 'Segna come acquistato'}
        >
          {checked && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Item Label & Sources */}
        <div className="min-w-0 flex-1">
          <span
            onClick={() => onToggleSelect && onToggleSelect(id)}
            className={`
              block text-sm sm:text-base font-semibold truncate transition-all cursor-pointer
              ${checked ? 'line-through text-stone-400' : 'text-stone-800'}
            `}
          >
            {name}
          </span>

          {recipeSources.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-0.5 truncate">
              <Utensils className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="truncate">{recipeSources.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quantities Badge & Delete */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {formattedQuantities && (
          <span
            className={`
              px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-bold
              ${
                checked
                  ? 'bg-stone-200 text-stone-500'
                  : 'bg-amber-100 text-amber-900 border border-amber-200/80'
              }
            `}
          >
            {formattedQuantities}
          </span>
        )}

        {/* Individual Delete */}
        <button
          type="button"
          onClick={() => onDelete(id)}
          className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
          title="Rimuovi ingrediente"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
