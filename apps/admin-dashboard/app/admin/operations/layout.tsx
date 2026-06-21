// P17-064: Operations section layout
import type { ReactNode } from 'react';

export default function OperationsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <section className="ops-layout">
      <nav className="ops-nav" aria-label="Operations navigation">
        <ul className="ops-nav-list" role="list">
          <li><a href="/admin/operations" className="ops-nav-link">Overview</a></li>
          <li><a href="/admin/operations/dashboard" className="ops-nav-link">Dashboard</a></li>
          <li><a href="/admin/operations/support-tickets" className="ops-nav-link">Support Tickets</a></li>
          <li><a href="/admin/operations/feedback" className="ops-nav-link">Feedback</a></li>
          <li><a href="/admin/operations/incidents" className="ops-nav-link">Incidents</a></li>
          <li><a href="/admin/operations/maintenance" className="ops-nav-link">Maintenance</a></li>
          <li><a href="/admin/operations/release-notes" className="ops-nav-link">Release Notes</a></li>
          <li><a href="/admin/operations/feature-flags" className="ops-nav-link">Feature Flags</a></li>
        </ul>
      </nav>

      <div className="ops-content">{children}</div>

      <style>{`
        .ops-layout {
          display: flex;
          flex-direction: column;
          gap: var(--space-24);
        }

        .ops-nav {
          border-bottom: 1px solid var(--border);
          padding-bottom: var(--space-8);
          overflow-x: auto;
        }

        .ops-nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          gap: var(--space-4);
          flex-wrap: nowrap;
        }

        .ops-nav-link {
          display: inline-flex;
          align-items: center;
          min-height: var(--touch-target);
          padding: var(--space-8) var(--space-12);
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: var(--weight-medium);
          color: var(--text-secondary);
          text-decoration: none;
          white-space: nowrap;
          transition: background var(--duration-fast) var(--ease-standard),
                      color var(--duration-fast) var(--ease-standard);
        }

        .ops-nav-link:hover {
          background: var(--state-hover);
          color: var(--text-primary);
        }

        .ops-nav-link:focus-visible {
          outline: none;
          box-shadow: var(--shadow-focus);
        }

        .ops-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-24);
        }

        @media (max-width: 640px) {
          .ops-nav { padding-inline-start: var(--space-4); }
        }
      `}</style>
    </section>
  );
}
