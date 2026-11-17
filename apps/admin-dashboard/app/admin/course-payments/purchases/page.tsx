// Coupon purchases from the landing page. A visitor (with or without an account) pays into one of your wallets and
// uploads the receipt. Approving issues them a single-use coupon code for that course; rejecting needs a note.
'use client';

import React, { useCallback, useEffect, useState } from 'react';

import {
  CouponPurchase,
  coursePaymentsApi,
  formatDate,
  formatMoney,
  PaymentStatus,
  purchaseReceiptUrl,
} from '../../../../features/course-payments/api';
import { StatusBadge } from '../../../../features/course-payments/course-payments-styles';
import { OperationsLoadingSpinner, OperationsErrorCard } from '../../../../shared/components/operations';

const TABS: ReadonlyArray<{ value: PaymentStatus | 'all'; label: string }> = [
  { value: 'pending', label: 'Waiting for review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

export default function CouponPurchasesPage() {
  const [tab, setTab] = useState<PaymentStatus | 'all'>('pending');
  const [items, setItems] = useState<CouponPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setItems(await coursePaymentsApi.listPurchases(tab === 'all' ? undefined : tab));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load purchases.');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function review(item: CouponPurchase, action: 'approve' | 'reject') {
    const note = (notes[item.id] ?? '').trim();
    if (action === 'reject' && !note) {
      setRowError((prev) => ({ ...prev, [item.id]: 'Write a note so the buyer knows why it was rejected.' }));
      return;
    }
    setBusy(item.id);
    setRowError((prev) => ({ ...prev, [item.id]: '' }));
    try {
      if (action === 'approve') {
        const done = await coursePaymentsApi.approvePurchase(item.id, note || undefined);
        setMessage(`Approved — coupon ${done.couponCode} was issued to ${item.buyerName}. They can see it on their purchase page; you can also send it to ${item.buyerContact}.`);
      } else {
        await coursePaymentsApi.rejectPurchase(item.id, note);
        setMessage('Rejected — the buyer will see your note.');
      }
      await load();
    } catch (err) {
      setRowError((prev) => ({ ...prev, [item.id]: err instanceof Error ? err.message : 'Action failed.' }));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="cp-page">
      <header className="cp-header">
        <p className="cp-eyebrow">Billing & Subscriptions</p>
        <h1 className="cp-title">Coupon purchases</h1>
        <p className="cp-meta">
          Visitors pay into your wallet from the landing page and upload the receipt. Check it against your wallet, then approve
          to issue their coupon code. Money only counts as revenue after you approve.
        </p>
      </header>

      <div className="cp-tabs" role="group" aria-label="Filter purchases">
        {TABS.map((t) => (
          <button key={t.value} type="button" className="cp-tab" aria-pressed={tab === t.value} onClick={() => { setTab(t.value); setMessage(null); }}>
            {t.label}
          </button>
        ))}
      </div>

      {message && <div className="cp-success" role="status">{message}</div>}

      {loading ? (
        <OperationsLoadingSpinner message="Loading purchases..." />
      ) : loadError ? (
        <OperationsErrorCard message={loadError} onRetry={load} />
      ) : items.length === 0 ? (
        <div className="cp-empty">{tab === 'pending' ? 'No coupon purchases are waiting for review.' : 'Nothing here yet.'}</div>
      ) : (
        <div className="cp-list">
          {items.map((item) => (
            <article key={item.id} className="cp-card" aria-label={`Purchase by ${item.buyerName}`}>
              <div className="cp-row">
                <button type="button" onClick={() => setPreview(purchaseReceiptUrl(item.id))} style={{ padding: 0, border: 0, background: 'none' }} aria-label="View receipt">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="cp-thumb" src={purchaseReceiptUrl(item.id)} alt="Payment receipt" />
                </button>
                <div className="cp-grow">
                  <div className="cp-actions">
                    <span className="cp-strong">{item.buyerName}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <span className="cp-muted">Contact: {item.buyerContact}{item.buyerUserId ? ' (has an account)' : ' (guest)'}</span>
                  <span>Course: <span className="cp-strong">{item.courseTitle}</span></span>
                  <span>
                    Amount: <span className="cp-strong">{formatMoney(item.amount, item.currency)}</span>
                    {item.discountAmount > 0 && <> <span className="cp-strike">{formatMoney(item.originalAmount, item.currency)}</span></>}
                  </span>
                  <span>Wallet: <span className="cp-strong">{item.walletName}</span></span>
                  <span>Transaction no.: <span className="cp-strong cp-mono">{item.transactionNumber}</span></span>
                  <span className="cp-muted">Submitted {formatDate(item.createdAt)}</span>
                  {item.status === 'approved' && item.couponCode && (
                    <span>Coupon: <span className="cp-strong cp-mono">{item.couponCode}</span></span>
                  )}
                  {item.adminNote && item.status !== 'pending' && <span>Note: {item.adminNote}</span>}
                </div>
              </div>

              {item.status === 'pending' && (
                <>
                  <div className="cp-field">
                    <label className="cp-label" htmlFor={`note-${item.id}`}>Note to buyer (required to reject)</label>
                    <textarea id={`note-${item.id}`} className="cp-textarea" value={notes[item.id] ?? ''} maxLength={500}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      placeholder="e.g. The amount on the receipt doesn't match the course price." disabled={busy === item.id} />
                  </div>
                  {rowError[item.id] && <div className="cp-error" role="alert">{rowError[item.id]}</div>}
                  <div className="cp-actions">
                    <button type="button" className="cp-btn cp-btn--success" disabled={busy === item.id} onClick={() => review(item, 'approve')}>
                      {busy === item.id ? 'Saving...' : 'Approve & issue coupon'}
                    </button>
                    <button type="button" className="cp-btn cp-btn--danger" disabled={busy === item.id} onClick={() => review(item, 'reject')}>Reject</button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}

      {preview && (
        <div className="cp-modal-backdrop" role="dialog" aria-label="Receipt" onClick={() => setPreview(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cp-modal-img" src={preview} alt="Payment receipt full size" />
        </div>
      )}
    </div>
  );
}
