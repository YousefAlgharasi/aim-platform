interface AppConfig {
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config: AppConfig = {
  apiBaseUrl: requireEnv('REACT_APP_API_BASE_URL'),
  supabaseUrl: requireEnv('REACT_APP_SUPABASE_URL'),
  supabaseAnonKey: requireEnv('REACT_APP_SUPABASE_ANON_KEY'),
};
