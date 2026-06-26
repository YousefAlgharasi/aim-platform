import Link from 'next/link';

const ASSET_TYPES = [
  { name: 'Text', desc: 'Rich text content blocks for lesson material' },
  { name: 'Image', desc: 'Photos, diagrams, and illustrations' },
  { name: 'Video', desc: 'Instructional and practice videos' },
  { name: 'Audio', desc: 'Listening exercises and pronunciation samples' },
  { name: 'Exercise', desc: 'Interactive practice activities' },
  { name: 'Vocabulary', desc: 'Word lists and definitions' },
];

export default function AdminAssetsContentPage() {
  return (
    <section className="as-page">
      <nav className="as-breadcrumb">
        <Link href="/admin/content" className="as-breadcrumb-link">Content</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
        <span className="as-breadcrumb-current">Assets</span>
      </nav>

      <div className="as-header">
        <div>
          <p className="as-eyebrow">Curriculum</p>
          <h1 className="as-title">Assets</h1>
          <p className="as-subtitle">Content blocks and media assets are managed per lesson.</p>
        </div>
      </div>

      <div className="as-info-card">
        <div className="as-info-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
        </div>
        <div>
          <p className="as-info-title">Lesson-based asset management</p>
          <p className="as-info-desc">Assets (text, images, videos, audio, exercises, and vocabulary) are attached as content blocks within each lesson. Navigate to a lesson to manage its content blocks.</p>
          <Link href="/admin/content/lessons" className="as-info-link">
            Go to Lessons
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
          </Link>
        </div>
      </div>

      <h2 className="as-section-title">Supported Content Block Types</h2>
      <div className="as-grid">
        {ASSET_TYPES.map((t) => (
          <div key={t.name} className="as-type-card">
            <span className="as-type-dot" />
            <div>
              <p className="as-type-name">{t.name}</p>
              <p className="as-type-desc">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .as-page { display: flex; flex-direction: column; gap: 20px; }
        .as-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
        .as-breadcrumb-link { color: var(--text-link); text-decoration: none; }
        .as-breadcrumb-link:hover { text-decoration: underline; }
        .as-breadcrumb-current { color: var(--text-secondary); font-weight: 500; }
        .as-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .as-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .as-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .as-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
        .as-info-card {
          display: flex; gap: 14px; padding: 20px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg);
        }
        .as-info-icon { color: var(--color-primary-500); flex-shrink: 0; margin-top: 2px; }
        .as-info-title { margin: 0 0 4px; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .as-info-desc { margin: 0 0 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
        .as-info-link {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 13px; font-weight: 600; color: var(--color-primary-500);
          text-decoration: none;
        }
        .as-info-link:hover { text-decoration: underline; }
        .as-section-title { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary); }
        .as-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
        .as-type-card {
          display: flex; align-items: flex-start; gap: 10px; padding: 14px 16px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-md);
        }
        .as-type-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px;
          background: var(--color-primary-500);
        }
        .as-type-name { margin: 0; font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .as-type-desc { margin: 2px 0 0; font-size: 12px; color: var(--text-secondary); }
        @media (max-width: 640px) {
          .as-grid { grid-template-columns: 1fr; }
          .as-info-card { flex-direction: column; gap: 10px; }
        }
      `}</style>
    </section>
  );
}
