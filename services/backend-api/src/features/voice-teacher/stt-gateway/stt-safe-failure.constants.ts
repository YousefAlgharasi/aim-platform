/**
 * P9-045: Add STT Safe Failure Handling — constants.
 * Fixed, student-facing fallback message used whenever the STT Gateway
 * does not return a success response (provider error, timeout, or
 * low-confidence downgrade from P9-043), per the "STT provider failure"
 * category in docs/phase-9/voice-error-policy.md. This text is the only
 * thing ever shown to the student on STT failure; no provider error
 * text, status code, response body, or internal error category is ever
 * substituted in its place.
 */
export const STT_SAFE_FALLBACK_MESSAGE =
  "Couldn't process that recording, please try again.";
