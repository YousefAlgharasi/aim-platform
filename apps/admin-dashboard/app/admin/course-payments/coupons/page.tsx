// Coupons: every code that exists (bought on the landing page or created here). Create codes yourself to sell or give away.
// A code is single-use and works for one course; once redeemed the student keeps that course for good.
'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { Coupon, CouponStatus, CoursePrice, coursePaymentsApi, formatDate } from '../../../../features/course-payments/api';
import { OperationsLoadingSpinner, OperationsErrorCard } from '../../../../shared/components/operations';

const FILTERS: ReadonlyArray<{ value: CouponStatus | 'all'; label: string }> = [
  { value: 'issued', label: 'Unused' },
  { value: 'redeemed', label: 'Redeemed' },
  { value: 'void', label: 'Cancelled' },
  { value: 'all', label: 'All' },
];
const LABEL: Record<CouponStatus, string> = { issued: 'Unused', redeemed: 'Redeemed', void: 'Cancelled' };

export default function CouponsPage() {
  const [filter, setFilter] = useState<CouponStatus | 'all'>('issued');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [courses, setCourses] = useState<CoursePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState('');
  const [count, setCount] = useState('1');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [fresh, setFresh] = useState<Coupon[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [c, p] = await Promise.all([coursePaymentsApi.listCoupons(filter === 'all' ? undefined : filter), coursePaymentsApi.listPrices()]);
      setCoupons(c);
      setCourses(p);
      setCourseId((cur) => cur || p[0]?.courseId || '');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load coupons.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function generate() {
    setBusy(true);
    setMessage(null);
    try {
      const made = await coursePaymentsApi.generateCoupons(courseId, Number(count), note.trim() || undefined);
      setFresh(made);
      setMessage({ ok: true, text: `Created ${made.length} coupon${made.length === 1 ? '' : 's'}. Copy them below.` });
      await load();
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Failed to create coupons.' });
    } finally {
      setBusy(false);
    }
  }

  async function cancel(c: Coupon) {
    if (!window.confirm(`Cancel coupon ${c.code}? It will stop working.`)) return;
    try {
      await coursePaymentsApi.voidCoupon(c.id);
      await load();
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Failed to cancel.' });
    }
  }

  return (
    <div className="cp-page">
      <header className="cp-header">
        <p className="cp-eyebrow">Billing & Subscriptions</p>
        <h1 className="cp-title">Coupons</h1>
        <p className="cp-meta">
          A coupon is a single-use code for one course. The student enters it when they start the course and then keeps it for good —
          no deadline. Coupons bought on the landing page appear here after you approve the purchase.
        </p>
      </header>

      <section className="cp-card" aria-label="Create coupons">
        <h2 className="cp-card-title">Create coupons</h2>
        <div className="cp-actions" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="cp-field">
            <label className="cp-label" htmlFor="cc-course">Course</label>
            <select id="cc-course" className="cp-select" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => <option key={c.courseId} value={c.courseId}>{c.courseTitle}</option>)}
            </select>
          </div>
          <div className="cp-field">
            <label className="cp-label" htmlFor="cc-count">How many (1–200)</label>
            <input id="cc-count" className="cp-input" type="number" min="1" max="200" value={count} onChange={(e) => setCount(e.target.value)} style={{ width: 110 }} />
          </div>
          <div className="cp-field">
            <label className="cp-label" htmlFor="cc-note">Note (only you see it)</label>
            <input id="cc-note" className="cp-input" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Sold on WhatsApp to Ahmed" />
          </div>
          <button type="button" className="cp-btn" disabled={busy || !courseId} onClick={generate}>{busy ? 'Creating...' : 'Create'}</button>
        </div>
        {message && <div className={message.ok ? 'cp-success' : 'cp-error'} role="status">{message.text}</div>}
        {fresh.length > 0 && (
          <textarea className="cp-textarea" readOnly rows={Math.min(8, fresh.length + 1)} value={fresh.map((c) => `${c.code}  —  ${c.courseTitle}`).join('\n')} onFocus={(e) => e.currentTarget.select()} style={{ fontFamily: 'monospace' }} />
        )}
      </section>

      <div className="cp-tabs" role="group" aria-label="Filter coupons">
        {FILTERS.map((f) => (
          <button key={f.value} type="button" className="cp-tab" aria-pressed={filter === f.value} onClick={() => setFilter(f.value)}>{f.label}</button>
        ))}
      </div>

      {loading ? (
        <OperationsLoadingSpinner message="Loading coupons..." />
      ) : loadError ? (
        <OperationsErrorCard message={loadError} onRetry={load} />
      ) : coupons.length === 0 ? (
        <div className="cp-empty">No coupons here yet.</div>
      ) : (
        <div className="cp-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="cp-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Code', 'Course', 'Status', 'Source', 'Bought by / note', 'Used by', 'Created', ''].map((h) => <th key={h} style={{ textAlign: 'start', padding: '8px 10px', fontSize: 12, opacity: 0.7 }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 10px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{c.code}</td>
                  <td style={{ padding: '8px 10px' }}>{c.courseTitle}</td>
                  <td style={{ padding: '8px 10px' }}>{LABEL[c.status]}</td>
                  <td style={{ padding: '8px 10px' }}>{c.source === 'purchase' ? 'Landing page' : 'Created by you'}</td>
                  <td style={{ padding: '8px 10px' }}>{c.buyerName ?? c.note ?? '—'}</td>
                  <td style={{ padding: '8px 10px' }}>{c.redeemedByName ? `${c.redeemedByName}${c.redeemedAt ? ` · ${formatDate(c.redeemedAt)}` : ''}` : '—'}</td>
                  <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{formatDate(c.createdAt)}</td>
                  <td style={{ padding: '8px 10px' }}>{c.status === 'issued' && <button type="button" className="cp-btn cp-btn--danger" onClick={() => cancel(c)}>Cancel</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
