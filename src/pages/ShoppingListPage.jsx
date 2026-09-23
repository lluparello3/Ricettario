import React, { useState, useMemo } from 'react';
import { useShoppingList } from '../hooks/useShoppingList';
import { ShoppingItemRow } from '../components/shopping/ShoppingItemRow';
import { AddExtraItemModal } from '../components/shopping/AddExtraItemModal';
import { Button } from '../components/ui/Button';
import { AISLES, getAisleForIngredient } from '../utils/aisleHelper';
import {
  ShoppingBag,
  Plus,
  Copy,
  Trash2,
  CheckCircle2,
  Check,
  CheckSquare,
  Square,
  X
} from 'lucide-react';

export const ShoppingListPage = () => {
  const {
    shoppingList,
    addExtraItem,
    toggleItemCheck,
    batchMarkBought,
    batchRemove,
    removeItem,
    clearCheckedItems,
    clearAll,
    copyListToClipboard
  } = useShoppingList();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState(new Set());

  const uncheckedItems = useMemo(() => {
    return shoppingList.filter((item) => !item.checked);
  }, [shoppingList]);

  const checkedItems = useMemo(() => {
    return shoppingList.filter((item) => item.checked);
  }, [shoppingList]);

  // Group unchecked items by supermarket aisle
  const groupedUncheckedItems = useMemo(() => {
    const map = new Map();
    AISLES.forEach((aisle) => {
      map.set(aisle.key, []);
    });

    uncheckedItems.forEach((item) => {
      // Find item aisle or classify automatically
      const aisleKey = getAisleForIngredient(item.name, item.quantities?.[0]?.aisle || item.aisle);
      const existing = map.get(aisleKey) || [];
      existing.push(item);
      map.set(aisleKey, existing);
    });

    return map;
  }, [uncheckedItems]);

  // Toggle single item selection for batch actions
  const handleToggleSelect = (id) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle Select All Unchecked Items across entire list
  const areAllUncheckedSelected =
    uncheckedItems.length > 0 &&
    uncheckedItems.every((item) => selectedItemIds.has(item.id));

  const handleSelectAllUnchecked = () => {
    if (areAllUncheckedSelected) {
      setSelectedItemIds((prev) => {
        const next = new Set(prev);
        uncheckedItems.forEach((item) => next.delete(item.id));
        return next;
      });
    } else {
      setSelectedItemIds((prev) => {
        const next = new Set(prev);
        uncheckedItems.forEach((item) => next.add(item.id));
        return next;
      });
    }
  };

  // Toggle Select All items inside a specific supermarket aisle
  const handleSelectAisleItems = (aisleItems) => {
    const allAisleSelected = aisleItems.every((item) => selectedItemIds.has(item.id));
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      aisleItems.forEach((item) => {
        if (allAisleSelected) next.delete(item.id);
        else next.add(item.id);
      });
      return next;
    });
  };

  // Batch action handlers
  const handleBatchMarkBought = () => {
    if (selectedItemIds.size === 0) return;
    batchMarkBought(Array.from(selectedItemIds));
    setSelectedItemIds(new Set());
  };

  const handleBatchRemove = () => {
    if (selectedItemIds.size === 0) return;
    batchRemove(Array.from(selectedItemIds));
    setSelectedItemIds(new Set());
  };

  const handleDeselectAll = () => {
    setSelectedItemIds(new Set());
  };

  const handleCopy = async () => {
    const success = await copyListToClipboard();
    if (success) {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600 shrink-0" /> Lista della Spesa
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {shoppingList.length === 0
              ? 'La tua lista della spesa è vuota.'
              : `${uncheckedItems.length} da acquistare, ${checkedItems.length} completati`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={Plus}
          >
            Aggiungi Extra
          </Button>

          {shoppingList.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              icon={copiedSuccess ? Check : Copy}
            >
              {copiedSuccess ? 'Copiato!' : 'Copia Spesa'}
            </Button>
          )}
        </div>
      </div>

      {/* Contextual Bulk Action Bar when items are selected */}
      {selectedItemIds.size > 0 && (
        <div className="sticky top-16 z-30 bg-stone-900 text-white p-3 sm:p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-fade-in border border-stone-800">
          <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-900 font-bold flex items-center justify-center text-xs">
              {selectedItemIds.size}
            </span>
            <span>selezionati</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="salvia"
              size="sm"
              onClick={handleBatchMarkBought}
              icon={CheckCircle2}
            >
              Segna come Acquistati
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={handleBatchRemove}
              icon={Trash2}
            >
              Rimuovi
            </Button>

            <button
              onClick={handleDeselectAll}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title="Deseleziona tutti"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main List Area */}
      {shoppingList.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/60 border-2 border-dashed border-stone-200 rounded-3xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-800 mb-1">
            Nessun ingrediente in lista
          </h3>
          <p className="text-sm text-stone-500 max-w-sm mx-auto mb-6">
            Aggiungi ricette dal catalogo per aggregare automaticamente gli ingredienti necessari oppure inserisci prodotti manuali.
          </p>
          <Button variant="primary" size="md" onClick={() => setIsAddModalOpen(true)} icon={Plus}>
            Aggiungi Prodotto Manuale
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Da Comprare Header Toolbar */}
          {uncheckedItems.length > 0 && (
            <div className="flex items-center justify-between px-1 gap-2 flex-wrap border-b border-stone-200/80 pb-2">
              <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Prodotti Da Acquistare ({uncheckedItems.length})
              </h2>

              <button
                type="button"
                onClick={handleSelectAllUnchecked}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1 rounded-xl border border-amber-200/80 transition-colors"
              >
                {areAllUncheckedSelected ? (
                  <>
                    <CheckSquare className="w-4 h-4 text-amber-600" /> Deseleziona Tutti
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 text-amber-600" /> Seleziona Tutti
                  </>
                )}
              </button>
            </div>
          )}

          {/* Grouped Aisle Sections */}
          {AISLES.map((aisle) => {
            const aisleItems = groupedUncheckedItems.get(aisle.key) || [];
            if (aisleItems.length === 0) return null;

            const isAllAisleSelected = aisleItems.every((item) =>
              selectedItemIds.has(item.id)
            );

            return (
              <section
                key={aisle.key}
                className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-3"
              >
                {/* Aisle Department Header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{aisle.icon}</span>
                    <h3 className="text-base font-serif font-bold text-stone-900">
                      {aisle.label}
                    </h3>
                    <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                      {aisleItems.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectAisleItems(aisleItems)}
                    className="text-xs text-amber-800 font-semibold hover:underline flex items-center gap-1"
                  >
                    {isAllAisleSelected ? 'Deseleziona reparto' : 'Seleziona reparto'}
                  </button>
                </div>

                {/* Items List inside Aisle */}
                <div className="space-y-2">
                  {aisleItems.map((item) => (
                    <ShoppingItemRow
                      key={item.id}
                      item={item}
                      onToggleCheck={toggleItemCheck}
                      onDelete={removeItem}
                      isSelected={selectedItemIds.has(item.id)}
                      onToggleSelect={handleToggleSelect}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          {/* Già Presi Section */}
          {checkedItems.length > 0 && (
            <section className="space-y-3 pt-4 border-t border-stone-200/80">
              <div className="flex items-center justify-between px-1 gap-2">
                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Prodotti Acquistati ({checkedItems.length})
                </h2>
                <button
                  onClick={clearCheckedItems}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Rimuovi spuntati
                </button>
              </div>

              <div className="space-y-2">
                {checkedItems.map((item) => (
                  <ShoppingItemRow
                    key={item.id}
                    item={item}
                    onToggleCheck={toggleItemCheck}
                    onDelete={removeItem}
                    isSelected={selectedItemIds.has(item.id)}
                    onToggleSelect={handleToggleSelect}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Bottom Actions */}
          <div className="pt-6 border-t border-stone-200/80 flex items-center justify-between gap-4">
            <button
              onClick={clearAll}
              className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" /> Svuota tutta la spesa
            </button>

            <span className="text-xs text-stone-400">
              Ricettario di Famiglia PWA
            </span>
          </div>
        </div>
      )}

      {/* Add Extra Item Modal */}
      <AddExtraItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addExtraItem}
      />
    </div>
  );
};
