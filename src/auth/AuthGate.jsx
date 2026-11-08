import React, { createContext, useContext, useEffect, useState } from 'react';
import { Utensils, Mail, KeyRound, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { isAllowedEmail } from '../lib/allowedEmails';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const AuthContext = createContext({ session: null, signOut: async () => {} });
export const useAuth = () => useContext(AuthContext);

const LoginScreen = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const clean = email.trim().toLowerCase();
    if (!isAllowedEmail(clean)) {
      setError('Questo indirizzo non è abilitato al ricettario.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('La password deve avere almeno 6 caratteri.');
      return;
    }

    setBusy(true);
    const { error: err } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email: clean, password })
        : await supabase.auth.signUp({ email: clean, password });
    setBusy(false);

    if (!err) return; // onAuthStateChange apre l'app
    const msg = (err.message || '').toLowerCase();
    if (mode === 'login' && msg.includes('invalid login')) {
      setError('Email o password sbagliate. Prima volta? Tocca "Crea la tua password".');
    } else if (mode === 'signup' && msg.includes('already registered')) {
      setError('Questo account esiste già: usa "Accedi" con la tua password.');
    } else if (msg.includes('email not confirmed')) {
      setError('Account da confermare: scrivi a Lorenzo.');
    } else {
      setError(`Accesso non riuscito: ${err.message}`);
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#faf7f2] px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-5">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-600/20">
            <Utensils className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Ricettario <span className="text-amber-600 font-normal italic">di Famiglia</span>
          </h1>
          <p className="text-sm text-stone-500">
            {isLogin
              ? 'Accedi con la tua email e la tua password.'
              : 'Prima volta: scegli la password che userai per entrare.'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="nome@email.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email"
          />
          <Input
            type="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            placeholder={isLogin ? 'Password' : 'Nuova password (min. 6 caratteri)'}
            icon={KeyRound}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            required
            aria-label="Password"
          />
          <Button type="submit" fullWidth size="lg" disabled={busy || !email || !password}>
            {busy ? 'Un attimo…' : isLogin ? 'Accedi' : 'Crea password ed entra'}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(isLogin ? 'signup' : 'login');
            setError(null);
          }}
          className="w-full text-xs font-semibold text-amber-700 hover:text-amber-800"
        >
          {isLogin ? 'Prima volta? Crea la tua password' : 'Hai già una password? Accedi'}
        </button>
      </div>
    </div>
  );
};

const NotAllowedScreen = ({ email, onSignOut }) => (
  <div className="min-h-[100dvh] flex items-center justify-center bg-[#faf7f2] px-4">
    <div className="w-full max-w-sm bg-white rounded-3xl border border-stone-200/80 p-6 space-y-4 text-center">
      <h1 className="font-serif text-xl font-bold text-stone-900">Accesso non abilitato</h1>
      <p className="text-sm text-stone-500">L'indirizzo {email} non può usare questo ricettario.</p>
      <Button fullWidth onClick={onSignOut}>Esci</Button>
    </div>
  </div>
);

export const AuthGate = ({ children }) => {
  const [session, setSession] = useState(undefined); // undefined = sto controllando

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (mounted) setSession(next ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    try {
      localStorage.removeItem('recipes_data');
      localStorage.removeItem('shopping_list_data');
    } catch (e) {
      /* ignore */
    }
  };

  if (session === undefined) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#faf7f2]">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  if (!session) return <LoginScreen />;

  if (!isAllowedEmail(session.user?.email)) {
    return <NotAllowedScreen email={session.user?.email} onSignOut={signOut} />;
  }

  return <AuthContext.Provider value={{ session, signOut }}>{children}</AuthContext.Provider>;
};
