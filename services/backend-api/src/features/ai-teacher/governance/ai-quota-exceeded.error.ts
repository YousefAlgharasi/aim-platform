/**
 * P18-fix: Wire input safety/cost-quota gating into the live AI Teacher
 * pipeline. Thrown by `AiTeacherOrchestratorService` when
 * `AiCostQuotaService.checkQuota()` denies a turn before any provider
 * call is made. Callers translate this into a safe, generic rejection —
 * never the student's spend amount or budget figures.
 */
export class AiQuotaExceededError extends Error {
  readonly quotaPeriod: 'daily' | 'monthly';

  constructor(quotaPeriod: 'daily' | 'monthly') {
    super(
      quotaPeriod === 'daily'
        ? 'You have reached today\'s AI Teacher usage limit. Please try again tomorrow.'
        : 'You have reached this month\'s AI Teacher usage limit.',
    );
    this.name = 'AiQuotaExceededError';
    this.quotaPeriod = quotaPeriod;
  }
}
