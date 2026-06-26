import Link from 'next/link';

import { adminAnalyticsNavigationItems } from '../../../lib/admin-analytics-navigation';

const CATEGORY_ICONS: Record<string, string> = {
  'Platform Overview': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4',
  'Learning Reports': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  'Curriculum Reports': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01',
  'Assessment Reports': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  'Notification Reports': 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  'Revenue Reports': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'User Reports': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  'Exports': 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
};

export default function AdminAnalyticsPage() {
  return (
    <section className="an-page">
      <nav className="an-breadcrumb">
        <span className="an-breadcrumb-current">Analytics</span>
      </nav>

      <div className="an-header">
        <div>
          <p className="an-eyebrow">Analytics</p>
          <h1 className="an-title">Analytics & Reports</h1>
          <p className="an-subtitle">Platform dashboards, report categories, and export tracking.</p>
        </div>
      </div>

      <div className="an-grid">
        {adminAnalyticsNavigationItems.map((item) => (
          <Link key={item.href} href={item.href} className="an-card">
            <div className="an-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={CATEGORY_ICONS[item.label] ?? 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} />
              </svg>
            </div>
            <div className="an-card-body">
              <p className="an-card-label">{item.label}</p>
              <p className="an-card-desc">{item.description}</p>
            </div>
            <svg className="an-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
          </Link>
        ))}
      </div>

      <style>{`
        .an-page { display: flex; flex-direction: column; gap: 20px; }
        .an-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
        .an-breadcrumb-current { color: var(--text-secondary); font-weight: 500; }
        .an-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .an-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .an-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .an-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
        .an-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px; }
        .an-card {
          display: flex; align-items: center; gap: 14px; padding: 18px 20px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); text-decoration: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .an-card:hover {
          border-color: var(--color-primary-500);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 8%, transparent);
        }
        .an-card-icon {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px; flex-shrink: 0;
          border-radius: var(--radius-md); background: color-mix(in srgb, var(--color-primary-500) 8%, transparent);
          color: var(--color-primary-500);
        }
        .an-card-body { flex: 1; min-width: 0; }
        .an-card-label { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .an-card-desc { margin: 2px 0 0; font-size: 12px; color: var(--text-secondary); line-height: 1.4; }
        .an-card-arrow { flex-shrink: 0; color: var(--text-muted); transition: transform 0.15s; }
        .an-card:hover .an-card-arrow { transform: translateX(2px); color: var(--color-primary-500); }
        @media (max-width: 640px) {
          .an-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
