import Link from 'next/link';
import { ExportsClient } from './exports-client';

export default function AdminAnalyticsExportsPage() {
  return (
    <section className="ex-page">
      <nav className="ex-breadcrumb">
        <Link href="/admin/analytics" className="ex-breadcrumb-link">Analytics</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
        <span className="ex-breadcrumb-current">Exports</span>
      </nav>

      <div className="ex-header">
        <div>
          <p className="ex-eyebrow">Analytics</p>
          <h1 className="ex-title">Exports</h1>
          <p className="ex-subtitle">Request and track exports of completed report runs.</p>
        </div>
      </div>

      <ExportsClient />

      <style>{`
        .ex-page { display: flex; flex-direction: column; gap: 20px; }
        .ex-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
        .ex-breadcrumb-link { color: var(--text-link); text-decoration: none; }
        .ex-breadcrumb-link:hover { text-decoration: underline; }
        .ex-breadcrumb-current { color: var(--text-secondary); font-weight: 500; }
        .ex-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .ex-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .ex-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .ex-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
      `}</style>
    </section>
  );
}
