'use client';

import { useState, useEffect } from 'react';
import { backendFetchJson } from '../../../../lib/api/client-api-helpers';

type Plan = {
  id: string;
  name: string;
  description: string | null;
  priceId: string;
  planType: string;
  status: string;
  features: Record<string, unknown>;
  createdAt: string;
};

const PLAN_TYPES = ['free', 'basic', 'premium', 'enterprise'];

export default function AdminPlansPage() {
  const [items, setItems] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriceId, setFormPriceId] = useState('');
  const [formType, setFormType] = useState('basic');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    backendFetchJson<Plan[]>('/admin/billing/manage/plans')
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load plans.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formPriceId.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const plan = await backendFetchJson<Plan>('/admin/billing/manage/plans', {
        method: 'POST',
        body: JSON.stringify({ name: formName.trim(), description: formDesc.trim() || undefined, priceId: formPriceId.trim(), planType: formType }),
      });
      setItems((prev) => [plan, ...prev]);
      setFormName('');
      setFormDesc('');
      setFormPriceId('');
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plan.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="pl-page">
      <div className="pl-header">
        <div>
          <p className="pl-eyebrow">Billing Management</p>
          <h1 className="pl-title">Plans</h1>
          <p className="pl-subtitle">Manage subscription plans. Super admin access required.</p>
        </div>
        <button className="pl-add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Plan'}
        </button>
      </div>

      {showForm && (
        <div className="pl-form-card">
          <h2 className="pl-form-title">Create Plan</h2>
          <form onSubmit={handleCreate} className="pl-form">
            <div className="pl-form-row">
              <div className="pl-field pl-field--grow">
                <label htmlFor="pl-name" className="pl-label">Name</label>
                <input id="pl-name" type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                  placeholder="Plan name" disabled={submitting} className="pl-input" />
              </div>
              <div className="pl-field">
                <label htmlFor="pl-type" className="pl-label">Type</label>
                <select id="pl-type" value={formType} onChange={(e) => setFormType(e.target.value)}
                  disabled={submitting} className="pl-select">
                  {PLAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="pl-field">
              <label htmlFor="pl-price" className="pl-label">Price ID</label>
              <input id="pl-price" type="text" value={formPriceId} onChange={(e) => setFormPriceId(e.target.value)}
                placeholder="Paste the price ID" disabled={submitting} className="pl-input" />
            </div>
            <div className="pl-field">
              <label htmlFor="pl-desc" className="pl-label">Description (optional)</label>
              <input id="pl-desc" type="text" value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Short description" disabled={submitting} className="pl-input" />
            </div>
            <button type="submit" disabled={submitting || !formName.trim() || !formPriceId.trim()} className="pl-submit">
              {submitting ? 'Creating…' : 'Create Plan'}
            </button>
          </form>
        </div>
      )}

      {error && <div className="admin-error-banner" role="alert">{error}</div>}

      {loading && <div className="pl-empty"><p className="pl-empty-desc">Loading…</p></div>}

      {!loading && !error && items.length === 0 && (
        <div className="pl-empty">
          <p className="pl-empty-title">No plans yet</p>
          <p className="pl-empty-desc">Create a product and price first, then create a plan linked to a price.</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="pl-table-wrap">
          <table className="pl-table">
            <thead>
              <tr>
                <th className="pl-th">Plan ID</th>
                <th className="pl-th">Name</th>
                <th className="pl-th pl-th--type">Type</th>
                <th className="pl-th pl-th--price">Price ID</th>
                <th className="pl-th pl-th--status">Status</th>
                <th className="pl-th pl-th--date">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="pl-row">
                  <td className="pl-td"><code className="pl-id">{p.id.slice(0, 12)}…</code></td>
                  <td className="pl-td">
                    <div>
                      <span className="pl-plan-name">{p.name}</span>
                      {p.description && <p className="pl-plan-desc">{p.description}</p>}
                    </div>
                  </td>
                  <td className="pl-td pl-td--type"><span className="pl-type-pill">{p.planType}</span></td>
                  <td className="pl-td pl-td--price"><code className="pl-id">{p.priceId.slice(0, 8)}…</code></td>
                  <td className="pl-td pl-td--status">
                    <span className="pl-status">
                      <span className="pl-status-dot" style={{ background: p.status === 'active' ? 'var(--color-success-500)' : 'var(--text-muted)' }} />
                      {p.status}
                    </span>
                  </td>
                  <td className="pl-td pl-td--date">{fmtDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .pl-page { display: flex; flex-direction: column; gap: 20px; }
        .pl-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
        .pl-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .pl-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .pl-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
        .pl-add-btn { height: 38px; padding: 0 18px; border: none; border-radius: var(--radius-md); background: var(--color-primary-500); color: white; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; white-space: nowrap; }
        .pl-add-btn:hover { background: var(--color-primary-600); }
        .pl-form-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; }
        .pl-form-title { margin: 0 0 16px; font-size: 16px; font-weight: 600; color: var(--text-primary); }
        .pl-form { display: flex; flex-direction: column; gap: 12px; }
        .pl-form-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .pl-field { display: flex; flex-direction: column; gap: 4px; }
        .pl-field--grow { flex: 1; min-width: 200px; }
        .pl-label { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
        .pl-input, .pl-select { height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); color: var(--text-primary); font-size: 14px; font-family: inherit; }
        .pl-input:focus, .pl-select:focus { outline: none; border-color: var(--color-primary-500); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent); }
        .pl-select { min-width: 120px; }
        .pl-submit { align-self: flex-start; height: 38px; padding: 0 18px; border: none; border-radius: var(--radius-md); background: var(--color-primary-500); color: white; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; }
        .pl-submit:hover:not(:disabled) { background: var(--color-primary-600); }
        .pl-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .pl-table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow-x: auto; }
        .pl-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .pl-th { text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); background: var(--surface-sunken); border-bottom: 1px solid var(--border); }
        .pl-th--type { width: 100px; }
        .pl-th--price { width: 100px; }
        .pl-th--status { width: 90px; }
        .pl-th--date { width: 100px; }
        .pl-row { transition: background 0.1s; }
        .pl-row:hover { background: color-mix(in srgb, var(--color-primary-500) 3%, transparent); }
        .pl-row:not(:last-child) .pl-td { border-bottom: 1px solid var(--border); }
        .pl-td { padding: 12px 16px; font-size: 14px; color: var(--text-primary); vertical-align: top; }
        .pl-td--type { font-size: 12px; }
        .pl-td--price { font-size: 12px; }
        .pl-td--status { font-size: 12px; }
        .pl-td--date { font-size: 12px; color: var(--text-secondary); }
        .pl-id { font-family: monospace; font-size: 11px; padding: 2px 6px; background: var(--surface-sunken); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-secondary); }
        .pl-plan-name { font-weight: 600; }
        .pl-plan-desc { margin: 2px 0 0; font-size: 12px; color: var(--text-secondary); }
        .pl-type-pill { display: inline-block; padding: 2px 8px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: capitalize; }
        .pl-status { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--text-secondary); text-transform: capitalize; }
        .pl-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .pl-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 40px 20px; text-align: center; }
        .pl-empty-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .pl-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
        @media (max-width: 640px) { .pl-form-row { flex-direction: column; } }
      `}</style>
    </section>
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return '--';
  try { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(iso)); } catch { return '--'; }
}
