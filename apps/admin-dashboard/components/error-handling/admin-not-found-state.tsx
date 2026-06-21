// P11-011: 404 not-found state for admin detail pages
import type { ReactNode } from 'react';

type Props = {
  readonly resource?: string;
  readonly backAction?: ReactNode;
};

export function AdminNotFoundState({ resource = 'Resource', backAction }: Props) {
  return (
    <div className="aim-not-found" role="status" aria-label={`${resource} not found`}>
      <div className="aim-not-found-icon" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="14" fill="var(--surface-sunken)" />
          <circle cx="22" cy="22" r="8" stroke="var(--color-neutral-400)" strokeWidth="2" fill="none" />
          <line x1="28" y1="28" x2="34" y2="34"
            stroke="var(--color-neutral-400)" strokeWidth="2" strokeLinecap="round" />
          <line x1="19" y1="22" x2="25" y2="22"
            stroke="var(--color-neutral-400)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="aim-not-found-title">{resource} Not Found</h2>
      <p className="aim-not-found-desc">
        The {resource.toLowerCase()} you are looking for does not exist or has been removed.
      </p>
      {backAction && <div className="aim-not-found-action">{backAction}</div>}
      <style>{`
        .aim-not-found {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-12);
          padding: var(--space-48) var(--space-24);
          text-align: center;
        }
        .aim-not-found-title {
          margin: 0;
          font-size: 19px;
          font-weight: var(--weight-semibold);
          color: var(--text-primary);
        }
        .aim-not-found-desc {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 20px;
          max-width: 360px;
        }
        .aim-not-found-action { margin-block-start: var(--space-4); }
      `}</style>
    </div>
  );
}
