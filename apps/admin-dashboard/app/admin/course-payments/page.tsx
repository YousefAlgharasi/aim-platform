// Course payment review. Students pay with a wallet, then submit the
// transaction number and a receipt screenshot. Approving unlocks the course
// for the student (the course's access days, 30 by default, from approval);
// rejecting requires a note the student sees so they can fix and resubmit.
'use client';

import React, { useCallback, useEffect, useState } from 'react';

import {
  coursePaymentsApi,
  formatDate,
  formatMoney,
  PaymentRequest,
  PaymentStatus,
  receiptUrl,
} from '../../../features/course-payments/api';
import { StatusBadge } from '../../../features/course-payments/course-payments-styles';
import { OperationsLoadingSpinner, OperationsErrorCard } from '../../../shared/components/operations';

const TABS: ReadonlyArray<{ value: PaymentStatus | 'all'; label: string }> = [
  { value: 'pending', label: 'Waiting for review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

export default function CoursePaymentsPage() {
  const [tab, setTab] = useState<PaymentStatus | 'all'>('pending');
  const [items, setItems] = useState<PaymentRequest[]>([]);
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
      setItems(await coursePaymentsApi.listPayments(tab === 'all' ? undefined : tab));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function review(item: PaymentRequest, action: 'approve' | 'reject') {
    const note = (notes[item.id] ?? '').trim();
    if (action === 'reject' && !note) {
      setRowError((prev) => ({ ...prev, [item.id]: 'Write a note so the student knows why it was rejected.' }));
      return;
    }
    setBusy(item.id);
    setRowError((prev) => ({ ...prev, [item.id]: '' }));
    try {
      if (action === 'approve') {
        await coursePaymentsApi.approve(item.id, note || undefined);
        setMessage(`Approved — ${item.studentName ?? item.studentEmail ?? 'the student'} can now open ${item.courseTitle}.`);
      } else {
        await coursePaymentsApi.reject(item.id, note);
        setMessage(`Rejected — the student will see your note.`);
      }
      setItems((prev) => prev.filter((p) => p.id !== item.id || tab === 'all'));
      if (tab === 'all') await load();
    } catch (err) {
      setRowError((prev) => ({ ...prev, [item.id]: err instanceof Error ? err.message : 'Action failed.' }));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="cp-page">
      <header className="cp-header">
        <p className="cp-eyebrow">Course payments</p>
        <h1 className="cp-title">Payments</h1>
        <p className="cp-meta">
          Check the receipt and transaction number against your wallet before approving. Approving opens the course for the
          student right away.
        </p>
      </header>

      <div className="cp-tabs" role="group" aria-label="Filter payments">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            className="cp-tab"
            aria-pressed={tab === t.value}
            onClick={() => { setTab(t.value); setMessage(null); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {message && <div className="cp-success" role="status">{message}</div>}

      {loading ? (
        <OperationsLoadingSpinner message="Loading payments..." />
      ) : loadError ? (
        <OperationsErrorCard message={loadError} onRetry={load} />
      ) : items.length === 0 ? (
        <div className="cp-empty">{tab === 'pending' ? 'No payments are waiting for review.' : 'No payments here yet.'}</div>
      ) : (
        <div className="cp-list">
          {items.map((item) => (
            <article key={item.id} className="cp-card" aria-label={`Payment from ${item.studentEmail ?? item.studentId}`}>
              <div className="cp-row">
                <button type="button" onClick={() => setPreview(receiptUrl(item.id))} style={{ padding: 0, border: 0, background: 'none' }} aria-label="View receipt">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="cp-thumb" src={receiptUrl(item.id)} alt="Payment receipt" />
                </button>

                <div className="cp-grow">
                  <div className="cp-actions">
                    <span className="cp-strong">{item.studentName ?? item.studentEmail ?? item.studentId}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  {item.studentName && <span className="cp-muted">{item.studentEmail}</span>}
                  <span>Course: <span className="cp-strong">{item.courseTitle}</span></span>
                  <span>
                    Amount: <span className="cp-strong">{formatMoney(item.amount, item.currency)}</span>
                    {item.discountAmount > 0 && (
                      <> <span className="cp-strike">{formatMoney(item.originalAmount, item.currency)}</span></>
                    )}
                  </span>
                  <span>Wallet: <span className="cp-strong">{item.walletName}</span></span>
                  <span>Transaction no.: <span className="cp-strong cp-mono">{item.transactionNumber}</span></span>
                  <span className="cp-muted">Submitted {formatDate(item.createdAt)}</span>
                  {item.status !== 'pending' && (
                    <span className="cp-muted">
                      {item.status === 'approved' ? 'Approved' : 'Rejected'} {formatDate(item.reviewedAt)}
                      {item.reviewedByEmail ? ` by ${item.reviewedByEmail}` : ''}
                    </span>
                  )}
                  {item.adminNote && item.status !== 'pending' && <span>Note: {item.adminNote}</span>}
                </div>
              </div>

              {item.status === 'pending' && (
                <>
                  <div className="cp-field">
                    <label className="cp-label" htmlFor={`note-${item.id}`}>Note to student (required to reject)</label>
                    <textarea
                      id={`note-${item.id}`}
                      className="cp-textarea"
                      value={notes[item.id] ?? ''}
                      maxLength={500}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      placeholder="e.g. The amount on the receipt doesn't match the course price."
                      disabled={busy === item.id}
                    />
                  </div>
                  {rowError[item.id] && <div className="cp-error" role="alert">{rowError[item.id]}</div>}
                  <div className="cp-actions">
                    <button type="button" className="cp-btn cp-btn--success" disabled={busy === item.id} onClick={() => review(item, 'approve')}>
                      {busy === item.id ? 'Saving...' : 'Approve & unlock course'}
                    </button>
                    <button type="button" className="cp-btn cp-btn--danger" disabled={busy === item.id} onClick={() => review(item, 'reject')}>
                      Reject
                    </button>
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
