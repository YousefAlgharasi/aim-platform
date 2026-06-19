/**
 * P8-066: Add AI Response Safety Filter (Group G — AI Teacher Backend
 * Pipeline). Fixed detection patterns and the single, fixed, student-safe
 * fallback text used whenever an AI Teacher response is rejected by the
 * safety filter, before it is ever persisted or displayed.
 *
 * `LEARNING_AUTHORITY_VIOLATION_PATTERNS` catches an AI Teacher response
 * that states a mastery/level/weakness/difficulty/recommendation/
 * review-schedule value — AI Teacher must only explain/guide/hint/tutor,
 * never compute or state a learning-decision value; AIM Engine remains
 * the sole authority for those values (docs/phase-8/no-aim-replacement-rule.md).
 *
 * `SECRET_LEAK_PATTERNS` catches a response that echoes back something
 * shaped like a provider API key or bearer token, which must never reach
 * a student (docs/phase-8/privacy-policy.md).
 */
export const AI_RESPONSE_SAFE_FALLBACK_MESSAGE =
  "AI Teacher can't share that response, please rephrase your question.";

export const LEARNING_AUTHORITY_VIOLATION_PATTERNS: RegExp[] = [
  /\bmastery\b/i,
  /\blevel\b/i,
  /\bweakness(es)?\b/i,
  /\bdifficulty\b/i,
  /\brecommendation(s)?\b/i,
  /\breview[\s-]?schedule\b/i,
];

export const SECRET_LEAK_PATTERNS: RegExp[] = [/\bsk-[a-zA-Z0-9]{10,}\b/, /\bBearer\s+[a-zA-Z0-9._-]{10,}\b/i];

export const UNSAFE_CONTENT_PATTERNS: RegExp[] = [
  /\bkill\s+yourself\b/i,
  /\bsuicide\b/i,
  /\bself[\s-]?harm\b/i,
];
