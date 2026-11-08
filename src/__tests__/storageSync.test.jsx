import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';

// Finto client Supabase: registra ogni operazione inviata al "database"
const calls = [];
const db = {
  recipes: [{ id: 'r1', title: 'Carbonara', ingredients: [], steps: [] }],
  shopping_list: [
    { id: 's1', ingredient_name: 'Uova', amount: 4, unit: '', checked: false },
    { id: 's2', ingredient_name: 'Guanciale', amount: 150, unit: 'g', checked: false }
  ]
};

const query = (table) => {
  const q = {
    _op: 'select',
    select: () => q,
    order: () => Promise.resolve({ data: db[table], error: null }),
    upsert: (rows) => {
      calls.push({ table, op: 'upsert', rows });
      return Promise.resolve({ error: null });
    },
    insert: (rows) => {
      calls.push({ table, op: 'insert', rows });
      return Promise.resolve({ error: null });
    },
    delete: () => ({
      in: (_c, ids) => {
        calls.push({ table, op: 'delete', ids });
        return Promise.resolve({ error: null });
      },
      neq: () => {
        calls.push({ table, op: 'deleteAll' });
        return Promise.resolve({ error: null });
      },
      eq: (_c, id) => {
        calls.push({ table, op: 'delete', ids: [id] });
        return Promise.resolve({ error: null });
      }
    })
  };
  return q;
};

vi.mock('../lib/supabaseClient', () => {
  const channel = { on: () => channel, subscribe: () => channel };
  return {
    supabase: {
      from: (t) => query(t),
      channel: () => channel,
      removeChannel: () => {}
    }
  };
});

import { StorageProvider, useStorage } from '../hooks/useStorage';
import { useShoppingList } from '../hooks/useShoppingList';

let api;
const Probe = () => {
  api = { storage: useStorage(), shopping: useShoppingList() };
  return <div>{api.storage.isLoading ? 'loading' : `items:${api.storage.shoppingList.length}`}</div>;
};

describe('Sincronizzazione con il database', () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it('carica i dati una volta sola e condivide lo stato tra i hook', async () => {
    render(<StorageProvider><Probe /></StorageProvider>);
    await waitFor(() => screen.getByText('items:2'));
    expect(api.shopping.shoppingList).toBe(api.storage.shoppingList);
  });

  it('spuntare un elemento invia solo quella riga, senza svuotare la tabella', async () => {
    render(<StorageProvider><Probe /></StorageProvider>);
    await waitFor(() => screen.getByText('items:2'));

    await act(async () => api.shopping.toggleItemCheck('s1'));

    expect(calls.some((c) => c.op === 'deleteAll')).toBe(false);
    const upserts = calls.filter((c) => c.op === 'upsert');
    expect(upserts).toHaveLength(1);
    expect(upserts[0].rows.map((r) => r.id)).toEqual(['s1']);
    expect(upserts[0].rows[0].checked).toBe(true);
  });

  it('rimuovere un elemento cancella solo il suo id', async () => {
    render(<StorageProvider><Probe /></StorageProvider>);
    await waitFor(() => screen.getByText('items:2'));

    await act(async () => api.shopping.removeItem('s2'));

    expect(calls).toEqual([{ table: 'shopping_list', op: 'delete', ids: ['s2'] }]);
  });

  it('aggiungere una ricetta già in lista aggiorna la riga esistente', async () => {
    render(<StorageProvider><Probe /></StorageProvider>);
    await waitFor(() => screen.getByText('items:2'));

    const recipe = {
      id: 'r1',
      title: 'Carbonara',
      servings: 4,
      ingredients: [{ name: 'Guanciale', amount: 100, unit: 'g' }]
    };
    await act(async () => api.shopping.addRecipesToShoppingList([{ recipe, servings: 4 }], [recipe]));

    const upserts = calls.filter((c) => c.op === 'upsert');
    expect(upserts).toHaveLength(1);
    expect(upserts[0].rows).toHaveLength(1);
    expect(upserts[0].rows[0]).toMatchObject({ id: 's2', amount: 250, unit: 'g' });
  });
});
