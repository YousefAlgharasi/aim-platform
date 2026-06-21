'use client';
// P11-011: Next.js app-router error boundary component (error.tsx pattern)
// Use this as `error.tsx` in any admin route segment that needs page-level error handling.
// Never exposes raw error messages or stack traces.
import { useEffect } from 'react';

type Props = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
};

export function AdminPageErrorBoundary({ error, reset }: Props) {
  useEffect(() => {
    // Log to monitoring service — never log to console in production
    // console.error omitted intentionally: no stack traces in UI
  }, [error]);

  return (
    <div
      className="aim-page-error"
      role="alert"
      aria-live="assertive"
      aria-label="Page error"
    >
      <div className="aim-page-error-icon" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="14" fill="var(--error-soft)" />
          <path
            d="M24 14L34 32H14L24 14Z"
            stroke="var(--color-error-600)" strokeWidth="2"
            fill="none" strokeLinejoin="round"
          />
          <line x1="24" y1="22" x2="24" y2="27"
            stroke="var(--color-error-600)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24" cy="30" r="1.5" fill="var(--color-error-600)" />
        </svg>
      </div>
      <h2 className="aim-page-error-title">Something went wrong</h2>
      <p className="aim-page-error-desc">
        An unexpected error occurred while loading this page.
        Try again, or contact support if the problem persists.
      </p>
      {error.digest && (
        <p className="aim-page-error-digest" aria-label={`Error reference ${error.digest}`}>
          Ref: {error.digest}
        </p>
      )}
      <button
        type="button"
        className="aim-page-error-retry"
        onClick={reset}
      >
        Try again
      </button>
      <style>{`
        .aim-page-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-12);
          padding: var(--space-48) var(--space-24);
          text-align: center;
          max-width: 480px;
          margin-inline: auto;
        }
        .aim-page-error-title {
          margin: 0;
          font-size: 19px;
          font-weight: var(--weight-semibold);
          color: var(--text-primary);
        }
        .aim-page-error-desc {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 20px;
        }
        .aim-page-error-digest {
          margin: 0;
          font-size: 12px;
          color: var(--text-muted);
          font-family: ui-monospace, monospace;
        }
        .aim-page-error-retry {
          display: inline-flex;
          align-items: center;
          height: var(--size-btn-md);
          padding: 0 var(--space-20);
          border-radius: var(--radius-md);
          border: none;
          background: var(--color-primary-500);
          color: var(--text-on-primary);
          font-family: inherit;
          font-size: 14px;
          font-weight: var(--weight-semibold);
          cursor: pointer;
          margin-block-start: var(--space-4);
          transition: background var(--duration-fast) var(--ease-standard);
        }
        .aim-page-error-retry:hover { background: var(--color-primary-600); }
        .aim-page-error-retry:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
      `}</style>
    </div>
  );
}
