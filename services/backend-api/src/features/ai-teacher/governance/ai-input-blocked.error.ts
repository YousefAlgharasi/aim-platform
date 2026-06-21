/**
 * P18-fix: Wire input safety/cost-quota gating into the live AI Teacher
 * pipeline. Thrown by `AiTeacherOrchestratorService` when
 * `AiTeacherSafetyService.checkInput()` blocks a student message before
 * any provider call is made. Callers translate this into a safe,
 * generic rejection — never the moderation category or any provider
 * detail.
 */
export class AiInputBlockedError extends Error {
  constructor() {
    super('Your message could not be sent. Please rephrase and try again.');
    this.name = 'AiInputBlockedError';
  }
}
