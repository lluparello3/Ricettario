import { describe, it, expect } from 'vitest';
import {
  convertToBaseUnit,
  formatSmartMetric,
  areUnitsCompatible,
  getUnitCategory
} from '../utils/unitConverter';
import { scaleAmount, scaleIngredientsList } from '../utils/recipeScaler';
import { getAisleForIngredient } from '../utils/aisleHelper';

describe('A. TEST UNITARI - unitConverter', () => {
  it('calcola la somma di unità metriche compatibili (g con kg, ml con litri)', () => {
    const amountG = convertToBaseUnit(500, 'g');
    const amountKg = convertToBaseUnit(1, 'kg');
    const totalG = amountG + amountKg;
    const formattedWeight = formatSmartMetric(totalG, 'weight');
    expect(totalG).toBe(1500);
    expect(formattedWeight).toEqual({ amount: 1.5, unit: 'kg' });

    const amountMl = convertToBaseUnit(250, 'ml');
    const amountL = convertToBaseUnit(1, 'l');
    const totalMl = amountMl + amountL;
    const formattedVolume = formatSmartMetric(totalMl, 'volume');
    expect(totalMl).toBe(1250);
    expect(formattedVolume).toEqual({ amount: 1.25, unit: 'l' });
  });

  it('separa correttamente unità incompatibili (es. cucchiai vs grammi)', () => {
    expect(areUnitsCompatible('g', 'kg')).toBe(true);
    expect(areUnitsCompatible('ml', 'l')).toBe(true);
    expect(areUnitsCompatible('g', 'cucchiai')).toBe(false);
    expect(areUnitsCompatible('pizzico', 'ml')).toBe(false);
    expect(areUnitsCompatible('cucchiai', 'cucchiai')).toBe(true);
  });

  it('gestisce correttamente ingredienti qualitativi ("q.b.", null, quantità 0)', () => {
    expect(convertToBaseUnit(0, 'g')).toBe(0);
    expect(convertToBaseUnit(null, 'q.b.')).toBe(0);
    expect(formatSmartMetric(null, 'weight')).toEqual({ amount: null, unit: '' });
    expect(getUnitCategory('q.b.')).toBe('other');
  });
});

describe('A. TEST UNITARI - recipeScaler', () => {
  it('scala correttamente da 4 a 2 porzioni (-50%) e da 4 a 6 porzioni (+50%)', () => {
    // 400g for 4 servings -> 200g for 2 servings
    expect(scaleAmount(400, 4, 2)).toBe(200);
    // 400g for 4 servings -> 600g for 6 servings
    expect(scaleAmount(400, 4, 6)).toBe(600);
    // 5g for 4 servings -> 2.5g for 2 servings
    expect(scaleAmount(5, 4, 2)).toBe(2.5);
  });

  it('mantiene inalterata la dose per ingredienti con isScalable: false', () => {
    expect(scaleAmount(2, 4, 6, false)).toBe(2);
    expect(scaleAmount(100, 4, 2, false)).toBe(100);

    const ingredients = [
      { name: 'Uova', amount: 4, isScalable: true },
      { name: 'Foglie di alloro', amount: 2, isScalable: false }
    ];
    const scaled = scaleIngredientsList(ingredients, 4, 2);
    expect(scaled[0].amount).toBe(2);
    expect(scaled[1].amount).toBe(2);
  });

  it('applica l\'arrotondamento corretto (interi per valori >= 10, max 1 decimale sotto 10)', () => {
    // calculated = 12.3 -> >= 10 rounded to integer 12
    expect(scaleAmount(8.2, 4, 6)).toBe(12);
    // calculated = 3.3333 -> < 10 rounded to 1 decimal place 3.3
    expect(scaleAmount(2.2, 4, 6)).toBe(3.3);
    // calculated = 0.6666 -> < 10 rounded to 1 decimal place 0.7
    expect(scaleAmount(1, 3, 2)).toBe(0.7);
  });
});

describe('A. TEST UNITARI - aisleHelper', () => {
  it('assegna correttamente il reparto per parole chiave tipiche', () => {
    expect(getAisleForIngredient('cipolla rossa')).toBe('Ortofrutta');
    expect(getAisleForIngredient('petto di pollo')).toBe('Macelleria');
    expect(getAisleForIngredient('parmigiano reggiano')).toBe('Banco Frigo');
    expect(getAisleForIngredient('salmone fresco')).toBe('Pescheria');
    expect(getAisleForIngredient('farina 00')).toBe('Dispensa');
    expect(getAisleForIngredient('olio extravergine')).toBe('Spezie e Condimenti');
    expect(getAisleForIngredient('misterioso ingrediente X')).toBe('Altro');
  });

  it('rispetta un reparto già assegnato manualmente se valido', () => {
    expect(getAisleForIngredient('cipolla', 'Banco Frigo')).toBe('Banco Frigo');
  });
});
