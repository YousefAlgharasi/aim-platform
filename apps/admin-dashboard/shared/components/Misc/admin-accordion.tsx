// Minimal accordion/disclosure built on native <details>/<summary> — no
// external library needed. Used to keep multi-level admin views (e.g. the
// student profile) on a single page instead of spawning more sub-pages.
'use client';

import type { ReactNode } from 'react';

type Props = {
  readonly title: ReactNode;
  readonly summary?: ReactNode;
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
  readonly className?: string;
};

export function AdminAccordion({ title, summary, children, defaultOpen = false, className = '' }: Props) {
  return (
    <details
      className={`bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden ${className}`}
      open={defaultOpen}
    >
      <summary
        className="flex flex-wrap items-center justify-between gap-3 p-4 md:p-5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden"
      >
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <span aria-hidden="true" className="admin-accordion-chevron text-[var(--text-muted)] text-xs">
            &#9656;
          </span>
          <span className="font-semibold text-[var(--text-primary)] text-sm">{title}</span>
        </div>
        {summary && <div className="flex items-center gap-2 shrink-0">{summary}</div>}
      </summary>
      <div className="p-4 md:p-5 pt-0 border-t border-[var(--border)]">{children}</div>
      <style>{`
        details[open] > summary .admin-accordion-chevron { transform: rotate(90deg); display: inline-block; }
        summary .admin-accordion-chevron { display: inline-block; transition: transform 0.15s ease; }
      `}</style>
    </details>
  );
}
