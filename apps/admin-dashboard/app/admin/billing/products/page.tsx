'use client';

import { useState, useEffect } from 'react';
import { backendFetch, backendFetchJson } from '../../../../lib/api/client-api-helpers';

type Product = {
  id: string;
  name: string;
  description: string | null;
  productType: string;
  status: string;
  createdAt: string;
};

const PRODUCT_TYPES = ['course', 'subscription', 'feature', 'addon'];

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState('course');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    backendFetchJson<Product[]>('/admin/billing/manage/products')
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load products.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const product = await backendFetchJson<Product>('/admin/billing/manage/products', {
        method: 'POST',
        body: JSON.stringify({ name: formName.trim(), description: formDesc.trim() || undefined, productType: formType }),
      });
      setItems((prev) => [product, ...prev]);
      setFormName('');
      setFormDesc('');
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="pr-page">
      <div className="pr-header">
        <div>
          <p className="pr-eyebrow">Billing Management</p>
          <h1 className="pr-title">Products</h1>
          <p className="pr-subtitle">Manage billing products. Super admin access required.</p>
        </div>
        <button className="pr-add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Product'}
        </button>
      </div>

      {showForm && (
        <div className="pr-form-card">
          <h2 className="pr-form-title">Create Product</h2>
          <form onSubmit={handleCreate} className="pr-form">
            <div className="pr-form-row">
              <div className="pr-field pr-field--grow">
                <label htmlFor="pr-name" className="pr-label">Name</label>
                <input id="pr-name" type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                  placeholder="Product name" disabled={submitting} className="pr-input" />
              </div>
              <div className="pr-field">
                <label htmlFor="pr-type" className="pr-label">Type</label>
                <select id="pr-type" value={formType} onChange={(e) => setFormType(e.target.value)}
                  disabled={submitting} className="pr-select">
                  {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="pr-field">
              <label htmlFor="pr-desc" className="pr-label">Description (optional)</label>
              <input id="pr-desc" type="text" value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Short description" disabled={submitting} className="pr-input" />
            </div>
            <button type="submit" disabled={submitting || !formName.trim()} className="pr-submit">
              {submitting ? 'Creating…' : 'Create Product'}
            </button>
          </form>
        </div>
      )}

      {error && <div className="admin-error-banner" role="alert">{error}</div>}

      {loading && <div className="pr-empty"><p className="pr-empty-desc">Loading…</p></div>}

      {!loading && !error && items.length === 0 && (
        <div className="pr-empty">
          <p className="pr-empty-title">No products yet</p>
          <p className="pr-empty-desc">Create your first product to get started.</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="pr-table-wrap">
          <table className="pr-table">
            <thead>
              <tr>
                <th className="pr-th">Product ID</th>
                <th className="pr-th">Name</th>
                <th className="pr-th pr-th--type">Type</th>
                <th className="pr-th pr-th--status">Status</th>
                <th className="pr-th pr-th--date">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="pr-row">
                  <td className="pr-td"><code className="pr-id">{p.id.slice(0, 12)}…</code></td>
                  <td className="pr-td">
                    <div>
                      <span className="pr-prod-name">{p.name}</span>
                      {p.description && <p className="pr-prod-desc">{p.description}</p>}
                    </div>
                  </td>
                  <td className="pr-td pr-td--type"><span className="pr-type-pill">{p.productType}</span></td>
                  <td className="pr-td pr-td--status">
                    <span className="pr-status">
                      <span className="pr-status-dot" style={{ background: p.status === 'active' ? 'var(--color-success-500)' : 'var(--text-muted)' }} />
                      {p.status}
                    </span>
                  </td>
                  <td className="pr-td pr-td--date">{fmtDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .pr-page { display: flex; flex-direction: column; gap: 20px; }
        .pr-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
        .pr-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .pr-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .pr-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
        .pr-add-btn {
          height: 38px; padding: 0 18px; border: none; border-radius: var(--radius-md);
          background: var(--color-primary-500); color: white;
          font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; white-space: nowrap;
        }
        .pr-add-btn:hover { background: var(--color-primary-600); }
        .pr-form-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; }
        .pr-form-title { margin: 0 0 16px; font-size: 16px; font-weight: 600; color: var(--text-primary); }
        .pr-form { display: flex; flex-direction: column; gap: 12px; }
        .pr-form-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .pr-field { display: flex; flex-direction: column; gap: 4px; }
        .pr-field--grow { flex: 1; min-width: 200px; }
        .pr-label { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
        .pr-input, .pr-select { height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); color: var(--text-primary); font-size: 14px; font-family: inherit; }
        .pr-input:focus, .pr-select:focus { outline: none; border-color: var(--color-primary-500); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent); }
        .pr-select { min-width: 120px; }
        .pr-submit { align-self: flex-start; height: 38px; padding: 0 18px; border: none; border-radius: var(--radius-md); background: var(--color-primary-500); color: white; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; }
        .pr-submit:hover:not(:disabled) { background: var(--color-primary-600); }
        .pr-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .pr-table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow-x: auto; }
        .pr-table { width: 100%; border-collapse: collapse; min-width: 550px; }
        .pr-th { text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); background: var(--surface-sunken); border-bottom: 1px solid var(--border); }
        .pr-th--type { width: 110px; }
        .pr-th--status { width: 100px; }
        .pr-th--date { width: 100px; }
        .pr-row { transition: background 0.1s; }
        .pr-row:hover { background: color-mix(in srgb, var(--color-primary-500) 3%, transparent); }
        .pr-row:not(:last-child) .pr-td { border-bottom: 1px solid var(--border); }
        .pr-td { padding: 12px 16px; font-size: 14px; color: var(--text-primary); vertical-align: top; }
        .pr-td--type { font-size: 12px; }
        .pr-td--status { font-size: 12px; }
        .pr-td--date { font-size: 12px; color: var(--text-secondary); }
        .pr-id { font-family: monospace; font-size: 11px; padding: 2px 6px; background: var(--surface-sunken); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-secondary); }
        .pr-prod-name { font-weight: 600; }
        .pr-prod-desc { margin: 2px 0 0; font-size: 12px; color: var(--text-secondary); }
        .pr-type-pill { display: inline-block; padding: 2px 8px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: capitalize; }
        .pr-status { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--text-secondary); text-transform: capitalize; }
        .pr-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .pr-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 40px 20px; text-align: center; }
        .pr-empty-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .pr-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
        @media (max-width: 640px) { .pr-form-row { flex-direction: column; } }
      `}</style>
    </section>
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return '--';
  try { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(iso)); } catch { return '--'; }
}
