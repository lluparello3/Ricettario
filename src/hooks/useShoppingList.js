import { useStorage } from './useStorage';
import { scaleAmount } from '../utils/recipeScaler';
import {
  areUnitsCompatible,
  convertToBaseUnit,
  formatSmartMetric,
  getUnitCategory,
  normalizeUnitString
} from '../utils/unitConverter';
import { getAisleForIngredient } from '../utils/aisleHelper';

export const useShoppingList = () => {
  const { shoppingList, saveShoppingList } = useStorage();

  /**
   * recipeSelections: array of { recipe, servings }
   * includeLinked: boolean - whether to include linked base preparation recipes
   */
  const addRecipesToShoppingList = (recipeSelections, allRecipes = [], includeLinked = false) => {
    const recipesToProcess = [];
    const processedIds = new Set();

    const addRecipeRecursive = (recipe, targetServings) => {
      if (!recipe || processedIds.has(recipe.id)) return;
      processedIds.add(recipe.id);
      recipesToProcess.push({ recipe, servings: targetServings });

      if (includeLinked && Array.isArray(recipe.linkedRecipeIds)) {
        recipe.linkedRecipeIds.forEach((linkedId) => {
          const linkedRecipe = allRecipes.find((r) => r.id === linkedId);
          if (linkedRecipe) {
            addRecipeRecursive(linkedRecipe, targetServings);
          }
        });
      }
    };

    recipeSelections.forEach(({ recipe, servings }) => {
      addRecipeRecursive(recipe, servings || recipe.servings);
    });

    const incomingItems = [];
    recipesToProcess.forEach(({ recipe, servings }) => {
      if (!recipe.ingredients) return;
      recipe.ingredients.forEach((ing) => {
        const scaledAmt = scaleAmount(
          ing.amount,
          recipe.servings,
          servings,
          ing.isScalable !== false
        );
        incomingItems.push({
          name: ing.name.trim(),
          amount: scaledAmt,
          unit: (ing.unit || '').trim(),
          aisle: ing.aisle || getAisleForIngredient(ing.name, null),
          recipeTitle: recipe.title
        });
      });
    });

    const currentList = [...shoppingList];

    incomingItems.forEach((incoming) => {
      const normName = incoming.name.toLowerCase();

      let existingGroup = currentList.find(
        (item) => item.name.trim().toLowerCase() === normName
      );

      if (!existingGroup) {
        existingGroup = {
          id: crypto.randomUUID(),
          name: incoming.name,
          checked: false,
          aisle: incoming.aisle || getAisleForIngredient(incoming.name, null),
          recipeSources: [incoming.recipeTitle],
          quantities: []
        };
        currentList.push(existingGroup);
      } else {
        if (!existingGroup.recipeSources.includes(incoming.recipeTitle)) {
          existingGroup.recipeSources.push(incoming.recipeTitle);
        }
      }

      const cat = getUnitCategory(incoming.unit);

      if (incoming.amount == null || isNaN(incoming.amount)) {
        const hasQb = existingGroup.quantities.some(
          (q) => q.unit.toLowerCase() === (incoming.unit || 'q.b.').toLowerCase()
        );
        if (!hasQb) {
          existingGroup.quantities.push({
            amount: null,
            unit: incoming.unit || 'q.b.',
            category: 'other'
          });
        }
      } else if (cat !== 'other') {
        const compatibleQtyIndex = existingGroup.quantities.findIndex((q) =>
          areUnitsCompatible(q.unit, incoming.unit)
        );

        if (compatibleQtyIndex >= 0) {
          const currentQty = existingGroup.quantities[compatibleQtyIndex];
          const currentBase = convertToBaseUnit(currentQty.amount, currentQty.unit);
          const incomingBase = convertToBaseUnit(incoming.amount, incoming.unit);
          const totalBase = currentBase + incomingBase;

          const smart = formatSmartMetric(totalBase, cat);
          existingGroup.quantities[compatibleQtyIndex] = {
            amount: smart.amount,
            unit: smart.unit,
            category: cat
          };
        } else {
          const baseAmt = convertToBaseUnit(incoming.amount, incoming.unit);
          const smart = formatSmartMetric(baseAmt, cat);
          existingGroup.quantities.push({
            amount: smart.amount,
            unit: smart.unit,
            category: cat
          });
        }
      } else {
        const sameUnitIndex = existingGroup.quantities.findIndex(
          (q) => normalizeUnitString(q.unit) === normalizeUnitString(incoming.unit)
        );
        if (sameUnitIndex >= 0) {
          const currentQty = existingGroup.quantities[sameUnitIndex];
          const sumAmt = Math.round(((currentQty.amount || 0) + incoming.amount) * 10) / 10;
          existingGroup.quantities[sameUnitIndex] = {
            ...currentQty,
            amount: sumAmt
          };
        } else {
          existingGroup.quantities.push({
            amount: incoming.amount,
            unit: incoming.unit,
            category: 'other'
          });
        }
      }
    });

    saveShoppingList(currentList);
  };

  const addExtraItem = (name, amount = null, unit = '') => {
    if (!name || !name.trim()) return;
    const normName = name.trim();
    const currentList = [...shoppingList];
    const cat = getUnitCategory(unit);

    let existingGroup = currentList.find(
      (item) => item.name.trim().toLowerCase() === normName.toLowerCase()
    );

    if (!existingGroup) {
      existingGroup = {
        id: crypto.randomUUID(),
        name: normName,
        checked: false,
        aisle: getAisleForIngredient(normName, null),
        recipeSources: ['Extra / Manuale'],
        quantities: [
          {
            amount: amount != null && !isNaN(amount) ? Number(amount) : null,
            unit: unit || '',
            category: cat
          }
        ]
      };
      currentList.push(existingGroup);
    } else {
      existingGroup.quantities.push({
        amount: amount != null && !isNaN(amount) ? Number(amount) : null,
        unit: unit || '',
        category: cat
      });
    }

    saveShoppingList(currentList);
  };

  const toggleItemCheck = (id) => {
    saveShoppingList(
      shoppingList.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const batchMarkBought = (itemIds) => {
    const idSet = new Set(itemIds);
    saveShoppingList(
      shoppingList.map((item) =>
        idSet.has(item.id) ? { ...item, checked: true } : item
      )
    );
  };

  const batchRemove = (itemIds) => {
    const idSet = new Set(itemIds);
    saveShoppingList(shoppingList.filter((item) => !idSet.has(item.id)));
  };

  const removeItem = (id) => {
    saveShoppingList(shoppingList.filter((item) => item.id !== id));
  };

  const clearCheckedItems = () => {
    saveShoppingList(shoppingList.filter((item) => !item.checked));
  };

  const clearAll = () => {
    saveShoppingList([]);
  };

  const getFormattedShoppingText = () => {
    if (shoppingList.length === 0) return 'Lista della spesa vuota.';

    let text = '🛒 *LISTA DELLA SPESA - RICETTARIO DI FAMIGLIA*\n\n';
    
    const unchecked = shoppingList.filter((item) => !item.checked);
    const checked = shoppingList.filter((item) => item.checked);

    if (unchecked.length > 0) {
      text += '*Da Comprare:*\n';
      unchecked.forEach((item) => {
        const qtyStr = item.quantities
          .map((q) => (q.amount != null ? `${q.amount} ${q.unit}`.trim() : q.unit))
          .join(' + ');
        text += `• ${item.name}${qtyStr ? `: ${qtyStr}` : ''}\n`;
      });
    }

    if (checked.length > 0) {
      text += '\n*Già presi:*\n';
      checked.forEach((item) => {
        const qtyStr = item.quantities
          .map((q) => (q.amount != null ? `${q.amount} ${q.unit}`.trim() : q.unit))
          .join(' + ');
        text += `✓ ~${item.name}${qtyStr ? `: ${qtyStr}` : ''}~\n`;
      });
    }

    return text;
  };

  const copyListToClipboard = async () => {
    const text = getFormattedShoppingText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  };

  return {
    shoppingList,
    addRecipesToShoppingList,
    addExtraItem,
    toggleItemCheck,
    batchMarkBought,
    batchRemove,
    removeItem,
    clearCheckedItems,
    clearAll,
    copyListToClipboard,
    getFormattedShoppingText
  };
};
