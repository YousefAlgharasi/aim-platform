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
    /**
     * Chat-completions endpoint URL. Defaults to OpenAI's endpoint; set
     * AI_PROVIDER_BASE_URL to point at any other OpenAI-compatible
     * provider (e.g. Groq) without a code change.
     */
    readonly baseUrl: string;
  };
  /** P9-039 — STT provider settings for Group E's STT Gateway. */
  readonly sttProvider: {
    readonly apiKey: string;
    readonly model: string;
    /** Transcription endpoint URL. Defaults to Groq's free Whisper endpoint. */
    readonly baseUrl: string;
  };
  /** P9-059 — TTS provider settings for Group G's TTS Gateway. */
  readonly ttsProvider: {
    readonly apiKey: string;
    readonly model: string;
    /** Speech-synthesis submission endpoint URL (e.g. tts.ai's POST /v1/tts/). */
    readonly baseUrl: string;
    /** Voice ID required by tts.ai's synthesis request (e.g. "af_bella"). */
    readonly voice: string;
    /**
     * Polling endpoint for tts.ai's async job result (GET .../v1/speech/results/?uuid=...).
     * Defaults to the tts.ai results endpoint derived from `baseUrl`'s origin.
     */
    readonly resultsUrl: string;
  };
  readonly cors: {
    readonly origins: readonly string[];
  };
  /** P19-006 — Placement retake cooldown, configurable per environment. */
  readonly placement: {
    /** Hours a student must wait after a completed attempt before retaking. Default 24. */
    readonly retakeCooldownHours: number;
  };
}
