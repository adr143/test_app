import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'your-supabase-url';
// const supabaseKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'your-supabase-anon-key';
const supabaseUrl = "https://fwugapivrojysjeqhgei.supabase.co";
const supabaseKey = "sb_publishable_sVA7sCxn_bR8cMb0JmgMdA_JwFUIk5ZZ";

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or ANON KEY is missing!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
