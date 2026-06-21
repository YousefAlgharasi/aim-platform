// P11-008: AIM design system page header component
import type { ReactNode } from 'react';

type Props = {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
};

export function AdminPageHeader({ eyebrow, title, description, actions }: Props) {
  return (
    <header className="aim-page-header">
      <div className="aim-page-header-text">
        {eyebrow && (
          <p className="aim-page-eyebrow" aria-hidden="true">
            {eyebrow}
          </p>
        )}
        <h1 className="aim-page-title">{title}</h1>
        {description && (
          <p className="aim-page-description">{description}</p>
        )}
      </div>
      {actions && (
        <div className="aim-page-header-actions">{actions}</div>
      )}
      <style>{`
        .aim-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-16);
          margin-block-end: var(--space-32);
          flex-wrap: wrap;
        }
        .aim-page-header-text {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .aim-page-eyebrow {
          margin: 0;
          font-size: 12px;
          font-weight: var(--weight-semibold);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-primary-600);
        }
        .aim-page-title {
          margin: 0;
          font-size: 23px;
          font-weight: var(--weight-bold);
          line-height: 30px;
          letter-spacing: -0.01em;
          color: var(--text-primary);
        }
        .aim-page-description {
          margin: 0;
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 22px;
        }
        .aim-page-header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          flex-shrink: 0;
        }
      `}</style>
    </header>
  );
}
