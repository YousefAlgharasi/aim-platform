// P11-011: 404 not-found state for admin detail pages
import type { ReactNode } from 'react';

type Props = {
  readonly resource?: string;
  readonly message?: string;
  readonly backAction?: ReactNode;
};

export function AdminNotFoundState({ resource = 'Resource', message, backAction }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 p-12 text-center" role="status" aria-label={`${resource} not found`}>
      <div className="flex items-center justify-center shrink-0" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="14" fill="var(--surface-sunken)" />
          <circle cx="22" cy="22" r="8" stroke="var(--color-neutral-400)" strokeWidth="2" fill="none" />
          <line x1="28" y1="28" x2="34" y2="34" stroke="var(--color-neutral-400)" strokeWidth="2" strokeLinecap="round" />
          <line x1="19" y1="22" x2="25" y2="22" stroke="var(--color-neutral-400)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">{resource} Not Found</h2>
      <p className="text-sm text-[var(--text-secondary)] leading-5 max-w-xs">
        {message ?? `The ${resource.toLowerCase()} you are looking for does not exist or has been removed.`}
      </p>
      {backAction && <div className="mt-1">{backAction}</div>}
    </div>
  );
}
