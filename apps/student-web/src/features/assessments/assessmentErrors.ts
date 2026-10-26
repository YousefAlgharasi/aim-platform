import { getErrorMessage } from '../../api/client';
import { t } from '../../i18n';

// Some assessment endpoints throw plain Nest exceptions whose message is the
// code itself (e.g. ConflictException('MAX_ATTEMPTS_REACHED')); map those to text.
const FRIENDLY: Record<string, string> = {
  MAX_ATTEMPTS_REACHED: "You've used all your attempts for this assessment.",
  DEADLINE_CLOSED: 'The deadline for this assessment has passed.',
  DEADLINE_NOT_OPEN: "This assessment isn't open yet.",
  DEADLINE_BLOCKS_SUBMISSION: 'The deadline prevents submission at this time.',
  ATTEMPT_NOT_IN_PROGRESS: 'This attempt is no longer in progress.',
  ATTEMPT_NOT_RESUMABLE: 'This attempt can no longer be continued.',
  ATTEMPT_ALREADY_SUBMITTED: 'This attempt has already been submitted.',
  ATTEMPT_EXPIRED: 'The time limit for this attempt has passed.',
  QUESTION_NOT_IN_ASSESSMENT: 'This question is not part of the assessment.',
  NO_QUESTIONS_FOUND: "This assessment doesn't have any questions yet.",
};

function codeOf(err: unknown): string | undefined {
  return (err as { code?: string } | null)?.code;
}

function messageOf(err: unknown): string | undefined {
  const m = (err as { message?: unknown } | null)?.message;
  return typeof m === 'string' ? m : undefined;
}

export function isErrorCode(err: unknown, code: string): boolean {
  return codeOf(err) === code || messageOf(err) === code;
}

export function assessmentErrorMessage(err: unknown, fallback: string): string {
  const code = codeOf(err);
  const message = messageOf(err);
  if (message && FRIENDLY[message]) return t(FRIENDLY[message]);
  if (code && FRIENDLY[code] && (!message || message === code)) return t(FRIENDLY[code]);
  return getErrorMessage(err, fallback);
}
