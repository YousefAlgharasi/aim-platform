// P17-064: Shared error card with retry for operations pages
'use client';

type Props = {
  readonly message: string;
  readonly onRetry?: () => void;
};

export function OperationsErrorCard({ message, onRetry }: Props) {
  return (
    <div className="ops-error" role="alert" aria-live="assertive">
      <p className="ops-error-message">{message}</p>
      {onRetry && (
        <button className="ops-error-retry" type="button" onClick={onRetry}>
          Retry
        </button>
      )}

      <style>{`
        .ops-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-12);
          padding: var(--space-24);
          background: var(--error-soft);
          border: 1px solid var(--color-error-200);
          border-radius: var(--radius-lg);
          text-align: center;
        }

        .ops-error-message {
          margin: 0;
          font-size: 14px;
          color: var(--color-error-700);
        }

        .ops-error-retry {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: var(--size-btn-sm);
          padding: 0 var(--space-16);
          border: 1px solid var(--color-error-300);
          border-radius: var(--radius-md);
          background: var(--surface);
          color: var(--color-error-700);
          font-size: 13px;
          font-weight: var(--weight-semibold);
          font-family: inherit;
          cursor: pointer;
          transition: background var(--duration-fast) var(--ease-standard);
        }

        .ops-error-retry:hover {
          background: var(--color-error-50);
        }

        .ops-error-retry:focus-visible {
          outline: none;
          box-shadow: var(--shadow-focus);
        }
      `}</style>
    </div>
  );
}
