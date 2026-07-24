'use client';
// P11-011: Next.js app-router error boundary component (error.tsx pattern)
import { useEffect } from 'react';

type Props = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
};

export function AdminPageErrorBoundary({ error, reset }: Props) {
  useEffect(() => {
    // Log to monitoring service — never log raw stack traces to console in production
  }, [error]);

  return (
    <div
      className="flex flex-col items-center gap-3 p-12 text-center max-w-md mx-auto"
      role="alert"
      aria-live="assertive"
      aria-label="Page error"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--error-soft)]" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
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
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">Something went wrong</h2>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        An unexpected error occurred while loading this page.
        Try again, or contact support if the problem persists.
      </p>
      {error.digest && (
        <p className="text-xs text-[var(--text-muted)] font-mono" aria-label={`Error reference ${error.digest}`}>
          Ref: {error.digest}
        </p>
      )}
      <button
        type="button"
        className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-[var(--color-primary-500)] text-white text-sm font-semibold hover:bg-[var(--color-primary-600)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] cursor-pointer"
        onClick={reset}
      >
        Try again
      </button>
    </div>
  );
}
