import type { ReactNode } from 'react';

export default function AdminAnalyticsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <section className="anl-layout">
      <nav className="anl-nav" aria-label="Analytics navigation">
        <ul className="anl-nav-list" role="list">
          <li><a href="/admin/analytics" className="anl-nav-link">Overview</a></li>
          <li><a href="/admin/analytics/reports/learning" className="anl-nav-link">Learning</a></li>
          <li><a href="/admin/analytics/reports/curriculum" className="anl-nav-link">Curriculum</a></li>
          <li><a href="/admin/analytics/reports/assessment" className="anl-nav-link">Assessment</a></li>
          <li><a href="/admin/analytics/reports/notifications" className="anl-nav-link">Notifications</a></li>
          <li><a href="/admin/analytics/reports/revenue" className="anl-nav-link">Revenue</a></li>
          <li><a href="/admin/analytics/reports/users" className="anl-nav-link">Users</a></li>
          <li><a href="/admin/analytics/exports" className="anl-nav-link">Exports</a></li>
        </ul>
      </nav>

      <div className="anl-content">{children}</div>

      <style>{`
        .anl-layout {
          display: flex;
          flex-direction: column;
          gap: var(--space-24, 24px);
        }

        .anl-nav {
          border-bottom: 1px solid var(--border);
          padding-bottom: var(--space-8, 8px);
          overflow-x: auto;
        }

        .anl-nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          gap: var(--space-4, 4px);
          flex-wrap: nowrap;
        }

        .anl-nav-link {
          display: inline-flex;
          align-items: center;
          min-height: var(--touch-target, 44px);
          padding: var(--space-8, 8px) var(--space-12, 12px);
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: var(--weight-medium, 500);
          color: var(--text-secondary);
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .anl-nav-link:hover {
          background: var(--state-hover, rgba(0,0,0,0.04));
          color: var(--text-primary);
        }

        .anl-nav-link:focus-visible {
          outline: none;
          box-shadow: var(--shadow-focus, 0 0 0 2px var(--color-primary-500));
        }

        .anl-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-24, 24px);
        }

        @media (max-width: 640px) {
          .anl-nav { padding-inline-start: var(--space-4, 4px); }
        }
      `}</style>
    </section>
  );
}
