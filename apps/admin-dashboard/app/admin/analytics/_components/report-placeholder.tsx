import Link from 'next/link';

type Props = {
  readonly title: string;
  readonly description: string;
  readonly taskId: string;
};

export function ReportPlaceholder({ title, description, taskId }: Props) {
  return (
    <section className="rph-page">
      <nav className="rph-breadcrumb">
        <Link href="/admin/analytics" className="rph-breadcrumb-link">Analytics</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
        <span className="rph-breadcrumb-current">{title}</span>
      </nav>

      <div className="rph-header">
        <div>
          <p className="rph-eyebrow">Analytics</p>
          <h1 className="rph-title">{title}</h1>
          <p className="rph-subtitle">{description}</p>
        </div>
      </div>

      <div className="rph-notice">
        <div className="rph-notice-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
        </div>
        <div>
          <p className="rph-notice-title">Coming soon</p>
          <p className="rph-notice-desc">This report category is reserved and will be implemented in task {taskId}. Report definitions and run capabilities will appear here once the backend service is ready.</p>
          <Link href="/admin/analytics" className="rph-notice-link">
            Back to Analytics
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
          </Link>
        </div>
      </div>

      <style>{`
        .rph-page { display: flex; flex-direction: column; gap: 20px; }
        .rph-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
        .rph-breadcrumb-link { color: var(--text-link); text-decoration: none; }
        .rph-breadcrumb-link:hover { text-decoration: underline; }
        .rph-breadcrumb-current { color: var(--text-secondary); font-weight: 500; }
        .rph-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .rph-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .rph-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .rph-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
        .rph-notice {
          display: flex; gap: 14px; padding: 20px;
          background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
        }
        .rph-notice-icon { color: var(--color-primary-500); flex-shrink: 0; margin-top: 2px; }
        .rph-notice-title { margin: 0 0 4px; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .rph-notice-desc { margin: 0 0 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
        .rph-notice-link {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 13px; font-weight: 600; color: var(--color-primary-500); text-decoration: none;
        }
        .rph-notice-link:hover { text-decoration: underline; }
        @media (max-width: 640px) {
          .rph-notice { flex-direction: column; gap: 10px; }
        }
      `}</style>
    </section>
  );
}
