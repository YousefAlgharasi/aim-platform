'use client';

import { useState, useEffect } from 'react';
import { backendFetchJson } from '../../../../lib/api/client-api-helpers';

type Coupon = {
  id: string;
  name: string;
  discountType: string;
  discountValue: number;
  currency: string | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
  validFrom: string;
  validUntil: string | null;
  status: string;
  createdAt: string;
};

const STATUS_DOT: Record<string, string> = {
  active: 'var(--color-success-500)',
  expired: 'var(--text-muted)',
  disabled: 'var(--color-error-500)',
};

export default function AdminCouponsPage() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    backendFetchJson<Coupon[]>('/admin/billing/manage/coupons')
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load coupons.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="co-page">
      <div className="co-header">
        <div>
          <p className="co-eyebrow">Billing Management</p>
          <h1 className="co-title">Coupons</h1>
          <p className="co-subtitle">View active coupons and promotion codes. Super admin access required.</p>
        </div>
      </div>

      {error && <div className="admin-error-banner" role="alert">{error}</div>}

      {loading && <div className="co-empty"><p className="co-empty-desc">Loading…</p></div>}

      {!loading && !error && items.length === 0 && (
        <div className="co-empty">
          <p className="co-empty-title">No coupons</p>
          <p className="co-empty-desc">No active coupons found. Coupons are managed through the database or payment provider.</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="co-table-wrap">
          <table className="co-table">
            <thead>
              <tr>
                <th className="co-th">Coupon ID</th>
                <th className="co-th">Name</th>
                <th className="co-th co-th--disc">Discount</th>
                <th className="co-th co-th--usage">Redeemed</th>
                <th className="co-th co-th--status">Status</th>
                <th className="co-th co-th--date">Valid From</th>
                <th className="co-th co-th--date">Valid Until</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="co-row">
                  <td className="co-td"><code className="co-id">{c.id.slice(0, 12)}…</code></td>
                  <td className="co-td"><span className="co-coupon-name">{c.name}</span></td>
                  <td className="co-td co-td--disc">
                    {c.discountType === 'percentage'
                      ? `${c.discountValue}%`
                      : `${c.currency ?? ''} ${(c.discountValue / 100).toFixed(2)}`}
                  </td>
                  <td className="co-td co-td--usage">
                    {c.timesRedeemed}{c.maxRedemptions !== null ? ` / ${c.maxRedemptions}` : ''}
                  </td>
                  <td className="co-td">
                    <span className="co-status">
                      <span className="co-status-dot" style={{ background: STATUS_DOT[c.status] ?? 'var(--text-muted)' }} />
                      {c.status}
                    </span>
                  </td>
                  <td className="co-td co-td--date">{fmtDate(c.validFrom)}</td>
                  <td className="co-td co-td--date">{fmtDate(c.validUntil)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .co-page { display: flex; flex-direction: column; gap: 20px; }
        .co-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .co-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .co-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .co-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
        .co-table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow-x: auto; }
        .co-table { width: 100%; border-collapse: collapse; min-width: 650px; }
        .co-th { text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); background: var(--surface-sunken); border-bottom: 1px solid var(--border); }
        .co-th--disc { width: 100px; }
        .co-th--usage { width: 100px; }
        .co-th--status { width: 90px; }
        .co-th--date { width: 100px; }
        .co-row { transition: background 0.1s; }
        .co-row:hover { background: color-mix(in srgb, var(--color-primary-500) 3%, transparent); }
        .co-row:not(:last-child) .co-td { border-bottom: 1px solid var(--border); }
        .co-td { padding: 12px 16px; font-size: 14px; color: var(--text-primary); vertical-align: middle; }
        .co-td--disc { font-weight: 600; }
        .co-td--usage { font-size: 12px; color: var(--text-secondary); }
        .co-td--date { font-size: 12px; color: var(--text-secondary); }
        .co-id { font-family: monospace; font-size: 11px; padding: 2px 6px; background: var(--surface-sunken); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-secondary); }
        .co-coupon-name { font-weight: 600; }
        .co-status { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--text-secondary); text-transform: capitalize; }
        .co-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .co-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 40px 20px; text-align: center; }
        .co-empty-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .co-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
        @media (max-width: 640px) { .co-th--date, .co-td--date { display: none; } }
      `}</style>
    </section>
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return '--';
  try { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(iso)); } catch { return '--'; }
}
