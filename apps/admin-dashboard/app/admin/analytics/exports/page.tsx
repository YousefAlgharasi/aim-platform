import { ExportsClient } from './exports-client';

export default function AdminAnalyticsExportsPage() {
  return (
    <section className="ex-page">
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
        .ex-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .ex-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .ex-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .ex-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
      `}</style>
    </section>
  );
}
