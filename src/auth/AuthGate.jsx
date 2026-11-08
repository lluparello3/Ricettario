import React, { createContext, useContext, useEffect, useState } from 'react';
import { Utensils, Mail, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { isAllowedEmail } from '../lib/allowedEmails';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const AuthContext = createContext({ session: null, signOut: async () => {} });
export const useAuth = () => useContext(AuthContext);

const LoginScreen = () => {
  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const sendCode = async (e) => {
    e.preventDefault();
    setError(null);
    const clean = email.trim().toLowerCase();
    if (!isAllowedEmail(clean)) {
      setError('Questo indirizzo non è abilitato al ricettario.');
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: clean,
      options: { emailRedirectTo: window.location.origin }
    });
    setBusy(false);
    if (err) {
      setError(
        err.status === 429
          ? 'Troppe richieste ravvicinate: aspetta qualche minuto e riprova.'
          : `Invio non riuscito: ${err.message}`
      );
      return;
    }
    setEmail(clean);
    setStep('code');
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: 'email'
    });
    setBusy(false);
    if (err) setError('Codice non valido o scaduto. Controlla la mail o richiedine uno nuovo.');
  };

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
            {step === 'email'
              ? 'Inserisci la tua email: ti mandiamo un link per entrare.'
              : `Abbiamo mandato una mail a ${email}. Aprila da questo telefono e tocca "Log In": l'app si apre già collegata.`}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={sendCode} className="space-y-4">
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="nome@email.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              required
              aria-label="Email"
            />
            <Button type="submit" fullWidth size="lg" disabled={busy || !email}>
              {busy ? 'Invio in corso…' : 'Inviami il link'}
            </Button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="space-y-4">
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Codice (se presente nella mail)"
              icon={KeyRound}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
              error={error}
              className="tracking-[0.3em] text-lg"
              required
              aria-label="Codice"
            />
            <Button type="submit" fullWidth size="lg" disabled={busy || code.length < 6}>
              {busy ? 'Verifica…' : 'Entra'}
            </Button>
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setCode('');
                setError(null);
              }}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Cambia email o rimanda la mail
            </button>
          </form>
        )}
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
