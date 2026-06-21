// P17-064: Shared loading spinner for operations pages
'use client';

type Props = {
  readonly message?: string;
};

export function OperationsLoadingSpinner({ message = 'Loading...' }: Props) {
  return (
    <div className="ops-loading" role="status" aria-live="polite">
      <span className="ops-loading-spinner" aria-hidden="true" />
      <span className="ops-loading-text">{message}</span>

      <style>{`
        .ops-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-12);
          padding: var(--space-32) 0;
        }

        @keyframes ops-spin { to { transform: rotate(360deg); } }

        .ops-loading-spinner {
          display: inline-block;
          width: 28px;
          height: 28px;
          border: 3px solid var(--border);
          border-block-start-color: var(--color-primary-500);
          border-radius: 50%;
          animation: ops-spin 0.7s linear infinite;
        }

        .ops-loading-text {
          font-size: 14px;
          color: var(--text-muted);
        }

        @media (prefers-reduced-motion: reduce) {
          .ops-loading-spinner { animation: none; }
        }
      `}</style>
    </div>
  );
}
