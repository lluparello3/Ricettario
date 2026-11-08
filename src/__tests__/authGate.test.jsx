import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const auth = vi.hoisted(() => ({
  session: null,
  getSession: vi.fn(async () => ({ data: { session: auth.session } })),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: () => {} } } })),
  signInWithPassword: vi.fn(async () => ({ error: null })),
  signUp: vi.fn(async () => ({ error: null })),
  signOut: vi.fn(async () => ({ error: null }))
}));

vi.mock('../lib/supabaseClient', () => ({ supabase: { auth } }));

import { AuthGate } from '../auth/AuthGate';

const fill = (email, password) => {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } });
  fireEvent.submit(screen.getByLabelText('Email').closest('form'));
};

describe('Accesso al ricettario', () => {
  beforeEach(() => {
    auth.session = null;
    vi.clearAllMocks();
  });

  it('senza sessione mostra il login e non l\'app', async () => {
    render(<AuthGate><div>APP</div></AuthGate>);
    await waitFor(() => screen.getByText('Accedi'));
    expect(screen.queryByText('APP')).toBeNull();
  });

  it('rifiuta un\'email non abilitata senza contattare il server', async () => {
    render(<AuthGate><div>APP</div></AuthGate>);
    await waitFor(() => screen.getByLabelText('Email'));
    fill('estraneo@gmail.com', 'segreta123');
    await waitFor(() => screen.getByText('Questo indirizzo non è abilitato al ricettario.'));
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it('accede con email e password normalizzando l\'email', async () => {
    render(<AuthGate><div>APP</div></AuthGate>);
    await waitFor(() => screen.getByLabelText('Email'));
    fill(' LLuparello3@gmail.com ', 'segreta123');
    await waitFor(() =>
      expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: 'lluparello3@gmail.com', password: 'segreta123' })
    );
  });

  it('la prima volta crea la password per un\'email ammessa', async () => {
    render(<AuthGate><div>APP</div></AuthGate>);
    await waitFor(() => screen.getByText('Prima volta? Crea la tua password'));
    fireEvent.click(screen.getByText('Prima volta? Crea la tua password'));
    fill('alampresemaya.98@gmail.com', 'segreta123');
    await waitFor(() =>
      expect(auth.signUp).toHaveBeenCalledWith({ email: 'alampresemaya.98@gmail.com', password: 'segreta123' })
    );
  });

  it('password sbagliata: messaggio chiaro', async () => {
    auth.signInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid login credentials' } });
    render(<AuthGate><div>APP</div></AuthGate>);
    await waitFor(() => screen.getByLabelText('Email'));
    fill('lluparello3@gmail.com', 'sbagliata');
    await waitFor(() => screen.getByText(/Email o password sbagliate/));
  });

  it('con sessione valida mostra l\'app', async () => {
    auth.session = { user: { email: 'lluparello3@gmail.com' } };
    render(<AuthGate><div>APP</div></AuthGate>);
    await waitFor(() => screen.getByText('APP'));
  });

  it('una sessione di un\'email non in elenco non vede l\'app', async () => {
    auth.session = { user: { email: 'altro@gmail.com' } };
    render(<AuthGate><div>APP</div></AuthGate>);
    await waitFor(() => screen.getByText('Accesso non abilitato'));
    expect(screen.queryByText('APP')).toBeNull();
  });
});
