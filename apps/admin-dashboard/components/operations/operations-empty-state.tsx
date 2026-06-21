// P17-064: Shared empty state for operations pages
'use client';

type Props = {
  readonly message?: string;
};

export function OperationsEmptyState({ message = 'No data available.' }: Props) {
  return (
    <div className="ops-empty" role="status">
      <p className="ops-empty-text">{message}</p>

      <style>{`
        .ops-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-32) 0;
        }

        .ops-empty-text {
          margin: 0;
          font-size: 14px;
          color: var(--text-muted);
          text-align: center;
        }
      `}</style>
    </div>
  );
}
