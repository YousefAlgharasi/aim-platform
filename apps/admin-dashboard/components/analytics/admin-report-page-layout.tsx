// P15-058: shared report page layout — header, boundary note, and content slot
import type { ReactNode } from 'react';

type Props = {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly boundaryNote?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
};

export function AdminReportPageLayout({
  eyebrow = 'Admin — Analytics',
  title,
  description,
  boundaryNote,
  actions,
  children,
}: Props) {
  return (
    <section className="admin-curriculum-page" dir="auto">
      <header className="admin-page-header">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="hero-copy">{description}</p>}
        {actions && <div className="aim-report-page-actions">{actions}</div>}
      </header>

      {boundaryNote && (
        <div className="admin-boundary-note">
          <strong>Backend authority:</strong> {boundaryNote}
        </div>
      )}

      <div className="aim-report-page-body">{children}</div>

      <style>{`
        .aim-report-page-actions {
          display: flex;
          gap: var(--space-8);
          flex-wrap: wrap;
          margin-block-start: var(--space-12);
        }
        .aim-report-page-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
        }
      `}</style>
    </section>
  );
}
