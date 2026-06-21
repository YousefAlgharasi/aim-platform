// P18-047: Create AI Safety Status API
// Student-safe response shape exposing only that AI Teacher interactions in
// a session are currently unrestricted ('ok') or have been limited by the
// response safety filter ('limited') — never the raw reason_category
// taxonomy, message text, or any mastery/level/weakness/difficulty/
// recommendation/review-schedule value.

export interface AiTeacherSafetyStatusResult {
  readonly sessionId: string;
  readonly status: 'ok' | 'limited';
  readonly lastCheckedAt: string | null;
}
