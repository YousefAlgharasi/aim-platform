// Shared styles for the course payments admin pages (cp- prefix).

export function CoursePaymentsStyles() {
  return (
    <style>{`
      .cp-page { display: flex; flex-direction: column; gap: var(--space-24); }
      .cp-header { display: flex; flex-direction: column; gap: var(--space-4); }
      .cp-eyebrow { margin: 0; font-size: 12px; font-weight: var(--weight-semibold); text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
      .cp-title { margin: 0; font-size: 24px; font-weight: var(--weight-bold); color: var(--text-primary); }
      .cp-meta { margin: 0; font-size: 14px; color: var(--text-secondary); }

      .cp-tabs { display: flex; gap: var(--space-8); flex-wrap: wrap; }
      .cp-tab { height: 34px; padding: 0 var(--space-16); border: 1px solid var(--border); border-radius: 999px; background: var(--surface); color: var(--text-secondary); font: inherit; font-size: 13px; font-weight: var(--weight-semibold); cursor: pointer; }
      .cp-tab[aria-pressed="true"] { background: var(--color-primary-500); border-color: var(--color-primary-500); color: var(--text-on-primary); }

      .cp-card { padding: var(--space-20); border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); display: flex; flex-direction: column; gap: var(--space-16); }
      .cp-card-title { margin: 0; font-size: 16px; font-weight: var(--weight-semibold); color: var(--text-primary); }
      .cp-list { display: flex; flex-direction: column; gap: var(--space-12); }
      .cp-grid { display: grid; gap: var(--space-16); grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
      .cp-row { display: flex; gap: var(--space-16); align-items: flex-start; flex-wrap: wrap; }
      .cp-grow { flex: 1 1 240px; min-width: 0; display: flex; flex-direction: column; gap: var(--space-4); }
      .cp-strong { font-weight: var(--weight-semibold); color: var(--text-primary); }
      .cp-muted { color: var(--text-muted); font-size: 13px; }
      .cp-mono { font-family: monospace; }
      .cp-strike { text-decoration: line-through; color: var(--text-muted); }

      .cp-fields { display: grid; gap: var(--space-12); grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
      .cp-field { display: flex; flex-direction: column; gap: var(--space-4); }
      .cp-label { font-size: 12px; font-weight: var(--weight-semibold); color: var(--text-secondary); }
      .cp-input, .cp-select, .cp-textarea { padding: 0 var(--space-12); border: 1px solid var(--border); border-radius: var(--radius-md); font: inherit; font-size: 14px; background: var(--surface); color: var(--text-primary); }
      .cp-input, .cp-select { height: var(--size-btn-md); }
      .cp-textarea { padding: var(--space-8) var(--space-12); min-height: 72px; resize: vertical; }
      .cp-input:focus, .cp-select:focus, .cp-textarea:focus { outline: none; box-shadow: var(--shadow-focus); }

      .cp-actions { display: flex; gap: var(--space-8); flex-wrap: wrap; align-items: center; }
      .cp-btn { height: var(--size-btn-md); padding: 0 var(--space-16); border: 1px solid transparent; border-radius: var(--radius-md); font: inherit; font-size: 14px; font-weight: var(--weight-semibold); cursor: pointer; background: var(--color-primary-500); color: var(--text-on-primary); }
      .cp-btn:hover:not(:disabled) { background: var(--color-primary-600); }
      .cp-btn--success { background: var(--color-success-600, #16a34a); }
      .cp-btn--success:hover:not(:disabled) { background: var(--color-success-700, #15803d); }
      .cp-btn--danger { background: var(--color-error-600, #dc2626); }
      .cp-btn--danger:hover:not(:disabled) { background: var(--color-error-700, #b91c1c); }
      .cp-btn--ghost { background: transparent; border-color: var(--border); color: var(--text-primary); }
      .cp-btn--ghost:hover:not(:disabled) { background: var(--surface-sunken, rgba(0,0,0,0.04)); }
      .cp-btn:disabled { background: var(--disabled-bg); color: var(--disabled-fg); cursor: not-allowed; border-color: transparent; }
      .cp-btn:focus-visible, .cp-tab:focus-visible { outline: none; box-shadow: var(--shadow-focus); }

      .cp-badge { display: inline-flex; align-items: center; height: 22px; padding: 0 var(--space-8); border-radius: 999px; font-size: 12px; font-weight: var(--weight-semibold); }
      .cp-badge--pending, .cp-badge--expired { background: var(--warning-soft, #fef3c7); color: var(--color-warning-700, #b45309); }
      .cp-badge--approved, .cp-badge--completed, .cp-badge--active { background: var(--success-soft); color: var(--color-success-700); }
      .cp-badge--rejected, .cp-badge--failed, .cp-badge--revoked { background: var(--error-soft); color: var(--color-error-700); }
      .cp-badge--free { background: var(--surface-sunken, #f1f5f9); color: var(--text-secondary); }

      .cp-thumb { width: 96px; height: 96px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--surface-sunken, #f8fafc); cursor: zoom-in; }
      .cp-logo { width: 48px; height: 48px; object-fit: contain; border-radius: var(--radius-md); border: 1px solid var(--border); background: #fff; }
      .cp-qr { width: 120px; height: 120px; object-fit: contain; border-radius: var(--radius-md); border: 1px solid var(--border); background: #fff; }
      .cp-placeholder { display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 12px; }

      .cp-error { padding: var(--space-12) var(--space-16); background: var(--error-soft); border: 1px solid var(--color-error-200); border-radius: var(--radius-md); font-size: 13px; color: var(--color-error-700); }
      .cp-success { padding: var(--space-12) var(--space-16); background: var(--success-soft); border: 1px solid var(--color-success-200); border-radius: var(--radius-md); font-size: 13px; color: var(--color-success-700); }
      .cp-empty { padding: var(--space-32); text-align: center; color: var(--text-muted); border: 1px dashed var(--border); border-radius: var(--radius-lg); }

      .cp-table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); }
      .cp-table { width: 100%; border-collapse: collapse; font-size: 14px; }
      .cp-table th { text-align: start; padding: var(--space-12) var(--space-16); font-size: 12px; font-weight: var(--weight-semibold); color: var(--text-secondary); border-bottom: 1px solid var(--border); white-space: nowrap; }
      .cp-table td { padding: var(--space-12) var(--space-16); border-bottom: 1px solid var(--border); color: var(--text-primary); vertical-align: top; }
      .cp-table tr:last-child td { border-bottom: none; }

      .cp-modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: var(--space-24); }
      .cp-modal-img { max-width: min(92vw, 900px); max-height: 88vh; border-radius: var(--radius-lg); background: #fff; }
    `}</style>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    pending: 'Pending', approved: 'Approved', rejected: 'Rejected',
    active: 'Active', completed: 'Completed', failed: 'Failed', revoked: 'Revoked', expired: 'Expired', free: 'Free',
  };
  return <span className={`cp-badge cp-badge--${status}`}>{labels[status] ?? status}</span>;
}
