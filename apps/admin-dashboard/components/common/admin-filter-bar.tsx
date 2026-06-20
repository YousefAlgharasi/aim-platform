// P11-009: AIM design system filter bar — server-compatible (no client state)
import type { ReactNode } from 'react';

type Props = {
  readonly children: ReactNode;
  readonly label?: string;
};

export function AdminFilterBar({ children, label = 'Filters' }: Props) {
  return (
    <div className="aim-filter-bar" role="search" aria-label={label}>
      {children}
      <style>{`
        .aim-filter-bar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--space-8);
          padding: var(--space-12) var(--space-16);
          background: var(--surface-sunken);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          margin-block-end: var(--space-16);
        }
      `}</style>
    </div>
  );
}
