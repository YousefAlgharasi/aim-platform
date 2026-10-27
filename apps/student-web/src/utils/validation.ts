import { t } from '../i18n';

// Shared client-side field validators. These only improve UX; the backend
// (class-validator DTOs) remains the authority. Each returns an error message,
// or undefined when the value is valid.

export type FieldErrors<K extends string = string> = Partial<Record<K, string>>;

/** Mirrors the backend's @MinLength(8) on register/reset-password. */
export const PASSWORD_MIN = 8;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRequired(value: string, message: string): string | undefined {
  return value.trim() ? undefined : message;
}

export function validateEmail(value: string): string | undefined {
  const v = value.trim();
  if (!v) return t('Email address is required.');
  return EMAIL_RE.test(v) ? undefined : t('Enter a valid email address.');
}

export function validateNewPassword(value: string): string | undefined {
  if (!value) return t('Password is required.');
  return value.length >= PASSWORD_MIN ? undefined : t('Password must be at least 8 characters.');
}

export function validateConfirm(password: string, confirm: string): string | undefined {
  if (!confirm) return t('Please confirm your password.');
  return password === confirm ? undefined : t('Passwords do not match.');
}

export function validateMaxLength(value: string, max: number, message: string): string | undefined {
  return value.trim().length > max ? message : undefined;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

/** Drops undefined entries so `hasErrors`/state stay clean. */
export function collectErrors<K extends string>(entries: Record<K, string | undefined>): FieldErrors<K> {
  const out: FieldErrors<K> = {};
  (Object.keys(entries) as K[]).forEach((k) => {
    if (entries[k]) out[k] = entries[k];
  });
  return out;
}

/** Moves focus to the first invalid field, in the given DOM-id order. */
export function focusFirstInvalid(order: Array<[field: string, elementId: string]>, errors: FieldErrors) {
  const hit = order.find(([field]) => errors[field]);
  if (hit) document.getElementById(hit[1])?.focus();
}

/**
 * Turns a class-validator message ("email must be an email") into localized text.
 * Raw backend strings are English-only, so they are never shown directly.
 */
export function localizeValidationMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('must be an email')) return t('Enter a valid email address.');
  if (m.includes('should not be empty')) return t('This field is required.');
  const longer = m.match(/longer than or equal to (\d+) characters/);
  if (longer) return t('Must be at least {min} characters.', { min: longer[1] });
  const shorter = m.match(/shorter than or equal to (\d+) characters/);
  if (shorter) return t('Must be {max} characters or fewer.', { max: shorter[1] });
  return t('This value is not valid.');
}

/**
 * Maps backend validation errors to fields. The API returns `details` as the
 * class-validator message strings, e.g. "email must be an email".
 * Returns only fields it could attribute; the caller shows the rest as a banner.
 */
export function mapApiFieldErrors<K extends string>(err: unknown, fields: readonly K[]): FieldErrors<K> {
  const details = (err as { details?: unknown } | null)?.details;
  const out: FieldErrors<K> = {};
  if (!Array.isArray(details)) return out;
  for (const item of details) {
    if (typeof item !== 'string') continue;
    const field = fields.find((f) => item.startsWith(`${f} `));
    if (field && !out[field]) out[field] = localizeValidationMessage(item);
  }
  return out;
}
