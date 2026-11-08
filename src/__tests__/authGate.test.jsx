import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const auth = vi.hoisted(() => ({
  session: null,
  getSession: vi.fn(async () => ({ data: { session: auth.session } })),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: () => {} } } })),
  signInWithOtp: vi.fn(async () => ({ error: null })),
  verifyOtp: vi.fn(async () => ({ error: null })),
  signOut: vi.fn(async () => ({ error: null }))
}));

vi.mock('../lib/supabaseClient', () => ({ supabase: { auth } }));

import { AuthGate } from '../auth/AuthGate';

describe('Accesso al ricettario', () => {
  beforeEach(() => {
    auth.session = null;
    vi.clearAllMocks();
  });

  it('senza sessione mostra il login e non l\'app', async () => {
    render(<AuthGate><div>APP</div></AuthGate>);
    await waitFor(() => screen.getByText('Inviami il link'));
    expect(screen.queryByText('APP')).toBeNull();
  });

  it('rifiuta un\'email non abilitata senza contattare il server', async () => {
    render(<AuthGate><div>APP</div></AuthGate>);
    await waitFor(() => screen.getByLabelText('Email'));
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'estraneo@gmail.com' } });
    fireEvent.submit(screen.getByLabelText('Email').closest('form'));
    await waitFor(() => screen.getByText('Questo indirizzo non è abilitato al ricettario.'));
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it('per un\'email abilitata invia il codice e chiede di inserirlo', async () => {
    render(<AuthGate><div>APP</div></AuthGate>);
    await waitFor(() => screen.getByLabelText('Email'));
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: ' LLuparello3@gmail.com ' } });
    fireEvent.submit(screen.getByLabelText('Email').closest('form'));
    await waitFor(() => screen.getByLabelText('Codice'));
    expect(auth.signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'lluparello3@gmail.com' })
    );
    fireEvent.change(screen.getByLabelText('Codice'), { target: { value: '123456' } });
    fireEvent.submit(screen.getByLabelText('Codice').closest('form'));
    await waitFor(() =>
      expect(auth.verifyOtp).toHaveBeenCalledWith({ email: 'lluparello3@gmail.com', token: '123456', type: 'email' })
    );
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
