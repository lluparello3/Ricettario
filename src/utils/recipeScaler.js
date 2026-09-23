/**
 * Proportional portion recalculation logic.
 * Formula: dose_calcolata = (dose_base / porzioni_base) * nuove_porzioni
 * Rounding rule: Integer if >= 10, max 1 decimal if < 10.
 */

export const scaleAmount = (baseAmount, baseServings, targetServings, isScalable = true) => {
  if (baseAmount == null || isNaN(baseAmount) || !isScalable) {
    return baseAmount;
  }
  if (!baseServings || baseServings <= 0 || !targetServings || targetServings <= 0) {
    return baseAmount;
  }

  const calculated = (Number(baseAmount) / Number(baseServings)) * Number(targetServings);

  if (calculated >= 10) {
    return Math.round(calculated);
  } else {
    return Math.round(calculated * 10) / 10;
  }
};

export const scaleIngredientsList = (ingredients, baseServings, targetServings) => {
  if (!ingredients || !Array.isArray(ingredients)) return [];
  return ingredients.map((ing) => ({
    ...ing,
    amount: scaleAmount(ing.amount, baseServings, targetServings, ing.isScalable !== false)
  }));
};
