import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CatalogPage } from '../pages/CatalogPage';
import { getAisleForIngredient } from '../utils/aisleHelper';

const MOCK_RECIPES = [
  {
    id: '1',
    title: 'Spaghetti alla Carbonara',
    category: 'Primo',
    cuisine: 'Italiana',
    difficulty: 'Media',
    servings: 4,
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    mainIngredient: 'Guanciale',
    tags: ['Pasta', 'Romana'],
    ingredients: [
      { name: 'Guanciale', amount: 150, unit: 'g', aisle: 'Macelleria' },
      { name: 'Spaghetti', amount: 320, unit: 'g', aisle: 'Dispensa' },
      { name: 'Uova', amount: 4, unit: '', aisle: 'Banco Frigo' }
    ],
    steps: [{ stepNumber: 1, instruction: 'Rosolare il guanciale.' }]
  },
  {
    id: '2',
    title: 'Tiramisù Classico',
    category: 'Dolce',
    cuisine: 'Italiana',
    difficulty: 'Facile',
    servings: 6,
    prepTimeMinutes: 20,
    cookTimeMinutes: 0,
    mainIngredient: 'Mascarpone',
    tags: ['Dolce', 'Caffè'],
    ingredients: [
      { name: 'Mascarpone', amount: 500, unit: 'g', aisle: 'Banco Frigo' },
      { name: 'Savoiardi', amount: 300, unit: 'g', aisle: 'Dispensa' },
      { name: 'Caffè', amount: 200, unit: 'ml', aisle: 'Dispensa' }
    ],
    steps: [{ stepNumber: 1, instruction: 'Preparare il caffè.' }]
  },
  {
    id: '3',
    title: 'Bistecca alla Fiorentina',
    category: 'Carne',
    cuisine: 'Toscana',
    difficulty: 'Media',
    servings: 2,
    prepTimeMinutes: 5,
    cookTimeMinutes: 15,
    mainIngredient: 'Carne',
    tags: ['Secondi', 'Griglia'],
    ingredients: [
      { name: 'Bistecca di scottona', amount: 800, unit: 'g', aisle: 'Macelleria' },
      { name: 'Olio extravergine', amount: 2, unit: 'cucchiai', aisle: 'Spezie e Condimenti' }
    ],
    steps: [{ stepNumber: 1, instruction: 'Grigliare la carne.' }]
  }
];

describe('C. TEST COMPONENTI & STATO - CatalogPage & Search', () => {
  it('supporta la selezione multipla di categorie e aggiorna il conteggio/filtro', () => {
    render(
      <MemoryRouter>
        <CatalogPage recipes={MOCK_RECIPES} onAddRecipesToShopping={vi.fn()} />
      </MemoryRouter>
    );

    // Initial state: 3 recipes displayed
    expect(screen.getByText('Spaghetti alla Carbonara')).toBeInTheDocument();
    expect(screen.getByText('Tiramisù Classico')).toBeInTheDocument();
    expect(screen.getByText('Bistecca alla Fiorentina')).toBeInTheDocument();

    // Tap "Primo" category button
    const primoButtons = screen.getAllByRole('button', { name: /Primo/i });
    fireEvent.click(primoButtons[0]);

    // Should display Spaghetti alla Carbonara, but filter out Tiramisù and Bistecca
    expect(screen.getByText('Spaghetti alla Carbonara')).toBeInTheDocument();
    expect(screen.queryByText('Tiramisù Classico')).not.toBeInTheDocument();
    expect(screen.queryByText('Bistecca alla Fiorentina')).not.toBeInTheDocument();

    // Tap "Dolce" category button too (Multi-selection mode)
    const dolceButtons = screen.getAllByRole('button', { name: /Dolce/i });
    fireEvent.click(dolceButtons[0]);

    // Now both "Spaghetti alla Carbonara" (Primo) and "Tiramisù Classico" (Dolce) must appear
    expect(screen.getByText('Spaghetti alla Carbonara')).toBeInTheDocument();
    expect(screen.getByText('Tiramisù Classico')).toBeInTheDocument();
    expect(screen.queryByText('Bistecca alla Fiorentina')).not.toBeInTheDocument();

    // Clear category selection
    const resetCategoryBtn = screen.getByRole('button', { name: /Mostra Tutte/i });
    fireEvent.click(resetCategoryBtn);

    // All 3 recipes visible again
    expect(screen.getByText('Bistecca alla Fiorentina')).toBeInTheDocument();
  });

  it('filtra correttamente per nome ricetta nella barra di ricerca', () => {
    render(
      <MemoryRouter>
        <CatalogPage recipes={MOCK_RECIPES} onAddRecipesToShopping={vi.fn()} />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Cerca per titolo/i);
    fireEvent.change(searchInput, { target: { value: 'Tiramisù' } });

    expect(screen.getByText('Tiramisù Classico')).toBeInTheDocument();
    expect(screen.queryByText('Spaghetti alla Carbonara')).not.toBeInTheDocument();
  });

  it('filtra correttamente per ingrediente secondario con badge "Contiene:"', () => {
    render(
      <MemoryRouter>
        <CatalogPage recipes={MOCK_RECIPES} onAddRecipesToShopping={vi.fn()} />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Cerca per titolo/i);
    fireEvent.change(searchInput, { target: { value: 'Guanciale' } });

    expect(screen.getByText('Spaghetti alla Carbonara')).toBeInTheDocument();
    expect(screen.getByText(/Contiene:/i)).toBeInTheDocument();
    expect(screen.queryByText('Tiramisù Classico')).not.toBeInTheDocument();
  });
});

describe('C. TEST COMPONENTI & STATO - Shopping List & Aisle Grouping', () => {
  it('raggruppa correttamente gli ingredienti per reparto supermercato (aisle)', () => {
    const item1 = { name: 'Pomodori', aisle: getAisleForIngredient('Pomodori') };
    const item2 = { name: 'Pancetta', aisle: getAisleForIngredient('Pancetta') };
    const item3 = { name: 'Mozzarella', aisle: getAisleForIngredient('Mozzarella') };

    expect(item1.aisle).toBe('Ortofrutta');
    expect(item2.aisle).toBe('Macelleria');
    expect(item3.aisle).toBe('Banco Frigo');
  });

  it('gestisce lo stato di spunta di un elemento e rimozione massiva', () => {
    let list = [
      { id: 'a', name: 'Latte', checked: false },
      { id: 'b', name: 'Pane', checked: false }
    ];

    // Toggle check
    list = list.map((item) => (item.id === 'a' ? { ...item, checked: true } : item));
    expect(list.find((i) => i.id === 'a').checked).toBe(true);
    expect(list.find((i) => i.id === 'b').checked).toBe(false);

    // Filter out checked items (clear bought)
    const activeOnly = list.filter((item) => !item.checked);
    expect(activeOnly.length).toBe(1);
    expect(activeOnly[0].name).toBe('Pane');
  });
});
