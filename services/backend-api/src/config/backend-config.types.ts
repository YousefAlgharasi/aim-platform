export type BackendNodeEnv = 'development' | 'test' | 'staging' | 'production';

export interface BackendConfig {
  readonly nodeEnv: BackendNodeEnv;
  readonly port: number;
  readonly supabase: {
    readonly url: string;
    readonly anonKey: string;
    readonly serviceRoleKey: string;
    readonly jwtSecret: string;
  };
  readonly database: {
    readonly url: string;
  };
  readonly aimEngine: {
    readonly url: string;
  };
  readonly aiProvider: {
    readonly apiKey: string;
    readonly model: string;
  };
  readonly cors: {
    readonly origins: readonly string[];
  };
}
