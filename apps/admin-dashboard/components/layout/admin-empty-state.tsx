// P11-008: AIM design system empty state component
import type { ReactNode } from 'react';

type Props = {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
};

export function AdminEmptyState({ title, description, action }: Props) {
  return (
    <div className="aim-empty-state" role="status" aria-label={title}>
      <div className="aim-empty-icon" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="12" fill="var(--surface-sunken)" />
          <rect x="12" y="18" width="16" height="2" rx="1" fill="var(--color-neutral-400)" />
          <rect x="16" y="13" width="8" height="2" rx="1" fill="var(--color-neutral-400)" />
          <rect x="14" y="23" width="12" height="2" rx="1" fill="var(--color-neutral-400)" />
        </svg>
      </div>
      <h2 className="aim-empty-title">{title}</h2>
      {description && (
        <p className="aim-empty-description">{description}</p>
      )}
      {action && <div className="aim-empty-action">{action}</div>}
      <style>{`
        .aim-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-12);
          padding: var(--space-48) var(--space-24);
          text-align: center;
        }
        .aim-empty-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .aim-empty-title {
          margin: 0;
          font-size: 17px;
          font-weight: var(--weight-semibold);
          color: var(--text-primary);
          line-height: 24px;
        }
        .aim-empty-description {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 20px;
          max-width: 360px;
        }
        .aim-empty-action {
          margin-block-start: var(--space-4);
        }
      `}</style>
    </div>
  );
}
