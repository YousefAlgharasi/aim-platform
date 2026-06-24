import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY =
  process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const SUPABASE_CONFIG_ERROR =
  'Missing Supabase environment variables. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_PUBLISHABLE_KEY to frontend/.env';

function createMissingSupabaseClient() {
  console.error(SUPABASE_CONFIG_ERROR);
  const error = new Error(SUPABASE_CONFIG_ERROR);

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      }),
      signInWithPassword: async () => ({ data: { session: null }, error }),
      signOut: async () => ({ error: null }),
    },
  };
}

const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const supabase = hasSupabaseConfig
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : createMissingSupabaseClient();

export { hasSupabaseConfig, supabase, SUPABASE_CONFIG_ERROR, SUPABASE_URL };
