import { createClient } from '@supabase/supabase-js';

export const supabaseDailyDigestUrl = "https://cfrkjnphcifbucufrvxu.supabase.co";
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseDailyDigestUrl, supabaseAnonKey);
