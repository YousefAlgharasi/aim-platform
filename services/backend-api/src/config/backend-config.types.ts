export type BackendNodeEnv = 'development' | 'test' | 'staging' | 'production';

export interface BackendConfig {
  readonly nodeEnv: BackendNodeEnv;
  readonly port: number;
  readonly supabase: {
    readonly url: string;
    readonly anonKey: string;
    readonly serviceRoleKey: string;
    readonly jwtSecret: string;
    readonly jwtIssuer: string;
    readonly jwtAudience: string;
  };
  readonly database: {
    readonly url: string;
  };
  readonly aimEngine: {
    readonly url: string;
    /** P5-044 — Phase 5 adapter settings (from P5-008 policy). */
    /** Backend service token sent in Authorization header to AIM Engine. */
    readonly serviceToken: string;
    /** Hard timeout per single analysis call attempt (ms). Default 5000. */
    readonly analysisTimeoutMs: number;
    /** Hard timeout for health probe calls (ms). Default 3000. */
    readonly healthTimeoutMs: number;
    /** Total per-call budget including all retries (ms). Default 12000. */
    readonly totalBudgetMs: number;
    /** Maximum call attempts: 1 initial + N-1 retries. Default 3. */
    readonly maxRetryAttempts: number;
  };
  readonly aiProvider: {
    readonly apiKey: string;
    readonly model: string;
  };
  /** P9-039 — STT provider settings for Group E's STT Gateway. */
  readonly sttProvider: {
    readonly apiKey: string;
    readonly model: string;
  };
  readonly cors: {
    readonly origins: readonly string[];
  };
}
