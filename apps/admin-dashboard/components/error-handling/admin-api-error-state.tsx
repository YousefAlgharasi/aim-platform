// P11-011: Full-page API error state with optional retry
// Never exposes stack traces or backend internals to the UI.
import type { ReactNode } from 'react';

type Props = {
  readonly status?: number;
  readonly message?: string;
  readonly retryAction?: ReactNode; // server action button or Link
};

function titleFor(status?: number): string {
  if (status === 403) return 'Access Forbidden';
  if (status === 404) return 'Not Found';
  if (status === 503 || status === 502) return 'Service Unavailable';
  return 'Something Went Wrong';
}

function descFor(status?: number, message?: string): string {
  if (status === 403) return 'Your role does not have permission to view this resource.';
  if (status === 404) return 'The requested resource could not be found.';
  if (status === 503 || status === 502) return 'The backend service is temporarily unavailable. Try again in a moment.';
  if (message) return message;
  return 'An unexpected error occurred. Please try again or contact support.';
}

export function AdminApiErrorState({ status, message, retryAction }: Props) {
  const isPermission = status === 403;
  return (
    <div
      className="aim-api-error"
      role="alert"
      aria-live="assertive"
      aria-label={titleFor(status)}
    >
      <div className="aim-api-error-icon" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect
            width="48" height="48" rx="14"
            fill={isPermission ? 'var(--warning-soft)' : 'var(--error-soft)'}
          />
          <circle
            cx="24" cy="24" r="10"
            stroke={isPermission ? 'var(--color-warning-600)' : 'var(--color-error-600)'}
            strokeWidth="2" fill="none"
          />
          <line x1="24" y1="19" x2="24" y2="25"
            stroke={isPermission ? 'var(--color-warning-600)' : 'var(--color-error-600)'}
            strokeWidth="2" strokeLinecap="round"
          />
          <circle
            cx="24" cy="29" r="1.5"
            fill={isPermission ? 'var(--color-warning-600)' : 'var(--color-error-600)'}
          />
        </svg>
      </div>
      <h2 className="aim-api-error-title">{titleFor(status)}</h2>
      <p className="aim-api-error-desc">{descFor(status, message)}</p>
      {status && (
        <p className="aim-api-error-code" aria-label={`Error status ${status}`}>
          Status {status}
        </p>
      )}
      {retryAction && (
        <div className="aim-api-error-action">{retryAction}</div>
      )}
      <style>{`
        .aim-api-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-12);
          padding: var(--space-48) var(--space-24);
          text-align: center;
          max-width: 480px;
          margin-inline: auto;
        }
        .aim-api-error-title {
          margin: 0;
          font-size: 19px;
          font-weight: var(--weight-semibold);
          color: var(--text-primary);
        }
        .aim-api-error-desc {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 20px;
        }
        .aim-api-error-code {
          margin: 0;
          font-size: 12px;
          color: var(--text-muted);
          font-variant-numeric: tabular-nums;
        }
        .aim-api-error-action { margin-block-start: var(--space-4); }
      `}</style>
    </div>
  );
}
