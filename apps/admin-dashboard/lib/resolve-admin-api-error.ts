// P11-011: Utility to resolve a clean, safe error message from AdminApiClientError
// Never exposes backend internals, stack traces, or credentials to the UI.
import { AdminApiClientError } from '../api/admin-api-client-error';

export type AdminApiErrorInfo = {
  readonly status: number | undefined;
  readonly message: string;
  readonly isForbidden: boolean;
  readonly isNotFound: boolean;
  readonly isUnavailable: boolean;
};

/**
 * Converts any caught error into a safe, display-ready error info object.
 * Use this in all admin page fetch catch blocks.
 *
 * @example
 * try {
 *   data = await fetchAdminUsers(token, page, limit);
 * } catch (err) {
 *   errorInfo = resolveAdminApiError(err);
 * }
 */
export function resolveAdminApiError(err: unknown): AdminApiErrorInfo {
  if (err instanceof AdminApiClientError) {
    return {
      status:        err.status,
      message:       safeMessage(err.status, err.message),
      isForbidden:   err.status === 403,
      isNotFound:    err.status === 404,
      isUnavailable: err.status === 503 || err.status === 502,
    };
  }
  return {
    status:        undefined,
    message:       'An unexpected error occurred. Please try again.',
    isForbidden:   false,
    isNotFound:    false,
    isUnavailable: false,
  };
}

function safeMessage(status: number, raw: string): string {
  // Never expose raw backend error details for auth/server errors
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'Your role does not have permission to access this resource.';
  if (status === 404) return 'The requested resource could not be found.';
  if (status >= 500)  return 'The backend service encountered an error. Please try again.';
  // For 4xx validation errors, backend message is safe to show
  return raw || 'An unexpected error occurred.';
}
