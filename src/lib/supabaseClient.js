import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://zixtgbhyekjinfnddaes.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_mdIvxcjrd57npaUNKY2JlQ_7Bv_IoIm';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
