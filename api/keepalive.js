// Funzione serverless Vercel chiamata ogni giorno dal cron definito in vercel.json.
// Fa un paio di letture leggere sul database: Supabase (piano gratuito) mette in pausa
// i progetti senza attività per 7 giorni, e queste richieste contano come attività.

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://zixtgbhyekjinfnddaes.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_mdIvxcjrd57npaUNKY2JlQ_7Bv_IoIm';

const ping = async (table) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  return { table, status: res.status, ok: res.ok };
};

export default async function handler(req, res) {
  // Se è impostata CRON_SECRET su Vercel, accetta solo le chiamate del cron
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  try {
    const results = await Promise.all([ping('recipes'), ping('shopping_list')]);
    const ok = results.every((r) => r.ok);
    return res.status(ok ? 200 : 502).json({ ok, at: new Date().toISOString(), results });
  } catch (err) {
    return res.status(502).json({ ok: false, error: String(err) });
  }
}
