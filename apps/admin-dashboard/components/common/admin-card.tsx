// P11-009: AIM design system card component
import type { ReactNode } from 'react';

type Props = {
  readonly children: ReactNode;
  readonly title?: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly padding?: 'default' | 'lg' | 'none';
};

export function AdminCard({ children, title, description, actions, padding = 'default' }: Props) {
  const padClass = padding === 'lg' ? 'aim-card--lg' : padding === 'none' ? 'aim-card--none' : '';
  return (
    <div className={`aim-card ${padClass}`}>
      {(title || actions) && (
        <div className="aim-card-header">
          <div className="aim-card-header-text">
            {title && <h2 className="aim-card-title">{title}</h2>}
            {description && <p className="aim-card-description">{description}</p>}
          </div>
          {actions && <div className="aim-card-actions">{actions}</div>}
        </div>
      )}
      <div className="aim-card-body">{children}</div>
      <style>{`
        .aim-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          overflow: hidden;
        }
        .aim-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-12);
          padding: var(--card-padding) var(--card-padding) 0;
          flex-wrap: wrap;
        }
        .aim-card-header-text { display: flex; flex-direction: column; gap: var(--space-4); }
        .aim-card-title {
          margin: 0;
          font-size: 17px;
          font-weight: var(--weight-semibold);
          color: var(--text-primary);
          line-height: 24px;
        }
        .aim-card-description {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
        }
        .aim-card-actions { display: flex; gap: var(--space-8); align-items: center; flex-shrink: 0; }
        .aim-card-body { padding: var(--card-padding); }
        .aim-card--lg .aim-card-body { padding: var(--card-padding-lg); }
        .aim-card--none .aim-card-body { padding: 0; }
      `}</style>
    </div>
  );
}
