// Metric Unit Conversion Logic

const WEIGHT_UNITS = {
  g: 1,
  gr: 1,
  grammi: 1,
  kg: 1000,
  chili: 1000,
  chilogrammi: 1000,
  mg: 0.001
};

const VOLUME_UNITS = {
  ml: 1,
  millilitri: 1,
  cl: 10,
  dl: 100,
  l: 1000,
  litri: 1000,
  lt: 1000
};

export const normalizeUnitString = (unitStr) => {
  if (!unitStr) return '';
  return unitStr.trim().toLowerCase();
};

export const getUnitCategory = (unit) => {
  const norm = normalizeUnitString(unit);
  if (WEIGHT_UNITS[norm]) return 'weight';
  if (VOLUME_UNITS[norm]) return 'volume';
  return 'other';
};

export const areUnitsCompatible = (unit1, unit2) => {
  const cat1 = getUnitCategory(unit1);
  const cat2 = getUnitCategory(unit2);
  if (cat1 === 'other' || cat2 === 'other') {
    return normalizeUnitString(unit1) === normalizeUnitString(unit2);
  }
  return cat1 === cat2;
};

// Converts an amount to base unit (grams for weight, ml for volume)
export const convertToBaseUnit = (amount, unit) => {
  if (amount == null || isNaN(amount)) return 0;
  const norm = normalizeUnitString(unit);
  if (WEIGHT_UNITS[norm]) return amount * WEIGHT_UNITS[norm];
  if (VOLUME_UNITS[norm]) return amount * VOLUME_UNITS[norm];
  return amount;
};

// Formats a base value back into a clean readable string (e.g., 1200g -> "1.2 kg", 500g -> "500 g")
export const formatSmartMetric = (baseAmount, category) => {
  if (baseAmount == null || isNaN(baseAmount)) return { amount: null, unit: '' };

  if (category === 'weight') {
    if (baseAmount >= 1000) {
      const kgVal = +(baseAmount / 1000).toFixed(2);
      return { amount: kgVal, unit: 'kg' };
    }
    return { amount: Math.round(baseAmount * 10) / 10, unit: 'g' };
  }

  if (category === 'volume') {
    if (baseAmount >= 1000) {
      const lVal = +(baseAmount / 1000).toFixed(2);
      return { amount: lVal, unit: 'l' };
    }
    return { amount: Math.round(baseAmount * 10) / 10, unit: 'ml' };
  }

  return { amount: Math.round(baseAmount * 10) / 10, unit: '' };
};
