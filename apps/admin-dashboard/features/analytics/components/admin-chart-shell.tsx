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
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
        {description && <p className="text-xs text-[var(--text-secondary)]">{description}</p>}
      </div>
      <div className="min-h-[220px] flex items-center justify-center" role="img" aria-label={title}>
        {isEmpty ? <p className="text-sm text-[var(--text-muted)]">{emptyLabel}</p> : children}
      </div>
    </div>
  );
}
