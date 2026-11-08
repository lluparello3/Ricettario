// Indirizzi che possono entrare nell'app.
// ATTENZIONE: questa lista serve solo a dare un messaggio chiaro nella schermata di accesso.
// La protezione vera è sul database (vedi supabase/auth-setup.sql): se aggiungi o togli
// una persona, aggiorna anche la tabella allowed_emails su Supabase.
export const ALLOWED_EMAILS = [
  'lluparello3@gmail.com',
  'alampresemaya.98@gmail.com'
];

export const isAllowedEmail = (email) =>
  ALLOWED_EMAILS.map((e) => e.toLowerCase()).includes((email || '').trim().toLowerCase());
