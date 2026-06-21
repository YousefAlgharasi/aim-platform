// P15-058: chart shell — layout/frame only; chart rendering data must come from backend
import type { ReactNode } from 'react';

type Props = {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
  readonly isEmpty?: boolean;
  readonly emptyLabel?: string;
};

export function AdminChartShell({
  title,
  description,
  children,
  isEmpty = false,
  emptyLabel = 'No chart data available yet.',
}: Props) {
  return (
    <div className="aim-chart-shell">
      <div className="aim-chart-shell-header">
        <h2 className="aim-chart-shell-title">{title}</h2>
        {description && <p className="aim-chart-shell-description">{description}</p>}
      </div>
      <div className="aim-chart-shell-body" role="img" aria-label={title}>
        {isEmpty ? <p className="aim-chart-shell-empty">{emptyLabel}</p> : children}
      </div>
      <style>{`
        .aim-chart-shell {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: var(--space-16);
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
        }
        .aim-chart-shell-header { display: flex; flex-direction: column; gap: var(--space-4); }
        .aim-chart-shell-title {
          margin: 0;
          font-size: 16px;
          font-weight: var(--weight-semibold);
          color: var(--text-primary);
        }
        .aim-chart-shell-description {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .aim-chart-shell-body {
          min-height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .aim-chart-shell-empty {
          margin: 0;
          color: var(--text-muted);
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
