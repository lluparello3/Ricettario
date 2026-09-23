import { describe, it, expect } from 'vitest';
import { parseRecipeAiJson } from '../pages/RecipeFormPage';

describe('B. TEST IMPORT & PARSING AI - parseRecipeAiJson', () => {
  it('effettua il parsing pulito di una stringa JSON valida', () => {
    const rawJson = JSON.stringify({
      title: 'Tiramisù Tradizionale',
      servings: 6,
      category: 'Dolce',
      cuisine: 'Italiana',
      ingredients: [
        { name: 'Mascarpone', amount: 500, unit: 'g', aisle: 'Banco Frigo' },
        { name: 'Savoiardi', amount: 300, unit: 'g', aisle: 'Dispensa' }
      ],
      steps: [
        'Montare i tuorli con lo zucchero',
        'Aggiungere il mascarpone e amalgamare'
      ]
    });

    const parsed = parseRecipeAiJson(rawJson);
    expect(parsed.title).toBe('Tiramisù Tradizionale');
    expect(parsed.servings).toBe(6);
    expect(parsed.ingredients.length).toBe(2);
    expect(parsed.ingredients[0].name).toBe('Mascarpone');
    expect(parsed.ingredients[0].aisle).toBe('Banco Frigo');
    expect(parsed.steps.length).toBe(2);
    expect(parsed.steps[0].instruction).toBe('Montare i tuorli con lo zucchero');
  });

  it('effettua il parsing di JSON racchiuso tra backtick markdown (```json ... ```)', () => {
    const rawMarkdown = `\`\`\`json
{
  "title": "Carbonara Romana",
  "ingredients": [
    { "name": "Guanciale", "amount": 150, "unit": "g" },
    { "name": "Pecorino", "amount": 100, "unit": "g" }
  ],
  "steps": ["Rosolare il guanciale", "Mantecare la pasta"]
}
\`\`\``;

    const parsed = parseRecipeAiJson(rawMarkdown);
    expect(parsed.title).toBe('Carbonara Romana');
    expect(parsed.ingredients[0].name).toBe('Guanciale');
    expect(parsed.ingredients[0].aisle).toBe('Macelleria');
    expect(parsed.steps[1].instruction).toBe('Mantecare la pasta');
  });

  it('rifiuta o gestisce in modo controllato JSON incompleti o privi di campi obbligatori', () => {
    // Empty text
    expect(() => parseRecipeAiJson('')).toThrow('vuoto');

    // Invalid JSON syntax
    expect(() => parseRecipeAiJson('{ title: "Senza Virgolette" }')).toThrow('JSON valido');

    // Missing title
    expect(() =>
      parseRecipeAiJson(JSON.stringify({ ingredients: ['Pasta'], steps: ['Lessa'] }))
    ).toThrow('title');

    // Missing ingredients
    expect(() =>
      parseRecipeAiJson(JSON.stringify({ title: 'Ricetta', steps: ['Passaggio'] }))
    ).toThrow('ingredients');

    // Missing steps
    expect(() =>
      parseRecipeAiJson(
        JSON.stringify({ title: 'Ricetta', ingredients: [{ name: 'Sale' }] })
      )
    ).toThrow('steps');
  });
});
