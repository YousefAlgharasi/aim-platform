// Course payments overview: the real money. Revenue is counted when an admin
// approves a student's wallet payment; payments still waiting for review are
// shown separately and are not revenue yet. Everything is grouped per currency
// (amounts are never added across currencies).
'use client';

import React, { useCallback, useEffect, useState } from 'react';

import {
  CoursePaymentsOverview,
  CurrencyTotals,
  coursePaymentsApi,
  formatDate,
  formatMoney,
} from '../../../features/course-payments/api';
import { StatusBadge } from '../../../features/course-payments/course-payments-styles';
import { OperationsErrorCard, OperationsLoadingSpinner } from '../../../shared/components/operations';

function Kpi({
  label, value, sub, tone,
}: { label: string; value: string; sub?: string; tone?: 'accent' | 'warn' }) {
  return (
    <div className={`cp-kpi${tone ? ` cp-kpi--${tone}` : ''}`}>
      <span className="cp-kpi-label">{label}</span>
      <span className="cp-kpi-value">{value}</span>
      {sub && <span className="cp-kpi-sub">{sub}</span>}
    </div>
  );
}

function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
}

function CurrencySection({ totals, overview }: { totals: CurrencyTotals; overview: CoursePaymentsOverview }) {
  const c = totals.currency;
  const months = overview.monthly.filter((m) => m.currency === c);
  const maxMonth = Math.max(...months.map((m) => m.revenue), 1);
  const change = totals.revenueLastMonth > 0
    ? Math.round(((totals.revenueMtd - totals.revenueLastMonth) / totals.revenueLastMonth) * 100)
    : null;
  return (
    <section className="cp-card" aria-label={`Revenue in ${c}`}>
      <h2 className="cp-card-title">Revenue in {c}</h2>
      <div className="cp-kpis">
        <Kpi label="Total revenue" value={formatMoney(totals.revenueAllTime, c)} sub={`${totals.approvedTotal} approved payments`} tone="accent" />
        <Kpi
          label="This month"
          value={formatMoney(totals.revenueMtd, c)}
          sub={change === null ? `${totals.approvedThisMonth} approved` : `${change >= 0 ? '+' : ''}${change}% vs last month`}
        />
        <Kpi label="Today" value={formatMoney(totals.revenueToday, c)} />
        <Kpi label="Last month" value={formatMoney(totals.revenueLastMonth, c)} />
        <Kpi
          label="Waiting for review"
          value={formatMoney(totals.pendingAmount, c)}
          sub={`${totals.pendingCount} payment${totals.pendingCount === 1 ? '' : 's'} — not counted yet`}
          tone={totals.pendingCount > 0 ? 'warn' : undefined}
        />
        <Kpi label="Average payment" value={formatMoney(totals.averagePayment, c)} />
        <Kpi label="Discounts given" value={formatMoney(totals.discountsGiven, c)} />
        <Kpi label="Rejected" value={String(totals.rejectedCount)} sub="payments" />
      </div>
      {months.length > 0 && (
        <div>
          <p className="cp-meta">Last months (approved revenue)</p>
          <div className="cp-bars" role="img" aria-label={`Monthly revenue in ${c}`}>
            {months.map((m) => (
              <div key={m.month} className="cp-bar">
                <span className="cp-bar-value">{m.revenue.toLocaleString('en-US')}</span>
                <div className="cp-bar-fill" style={{ height: `${Math.max(2, (m.revenue / maxMonth) * 100)}%` }} />
                <span className="cp-bar-label">{monthLabel(m.month)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function CoursePaymentsOverviewPage() {
  const [data, setData] = useState<CoursePaymentsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await coursePaymentsApi.getOverview());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load the overview.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="cp-page">
      <header className="cp-header">
        <p className="cp-eyebrow">Course payments</p>
        <h1 className="cp-title">Overview</h1>
        <p className="cp-meta">
          Money from course payments. A payment becomes revenue when you approve it; pending and rejected payments are
          never counted as revenue.
        </p>
      </header>

      {loading && <OperationsLoadingSpinner />}
      {!loading && error && <OperationsErrorCard message={error} onRetry={load} />}

      {!loading && !error && data && (
        <>
          {data.currencies.length === 0 ? (
            <div className="cp-empty">No course payments yet. They will show up here as students pay.</div>
          ) : (
            data.currencies.map((t) => <CurrencySection key={t.currency} totals={t} overview={data} />)
          )}

          <section className="cp-card" aria-label="Students and access">
            <h2 className="cp-card-title">Students and access</h2>
            <div className="cp-kpis">
              <Kpi label="Paying students" value={String(data.payingStudents)} tone="accent" />
              <Kpi label="Active courses" value={String(data.access.active)} sub="30-day timer running" />
              <Kpi label="Ending in 7 days" value={String(data.access.expiringWithin7Days)} tone={data.access.expiringWithin7Days > 0 ? 'warn' : undefined} />
              <Kpi label="Finished in time" value={String(data.access.completed)} />
              <Kpi label="Ran out of time" value={String(data.access.failed)} sub="must pay and restart" />
            </div>
          </section>

          <div className="cp-grid">
            <section className="cp-card" aria-label="Revenue by course">
              <h2 className="cp-card-title">Revenue by course</h2>
              {data.byCourse.length === 0 ? (
                <p className="cp-muted">No approved payments yet.</p>
              ) : (
                <table className="cp-table">
                  <thead><tr><th>Course</th><th className="cp-num">Payments</th><th className="cp-num">Revenue</th></tr></thead>
                  <tbody>
                    {data.byCourse.map((c) => (
                      <tr key={`${c.courseId}-${c.currency}`}>
                        <td>{c.title}</td>
                        <td className="cp-num">{c.payments}</td>
                        <td className="cp-num cp-strong">{formatMoney(c.revenue, c.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="cp-card" aria-label="Revenue by wallet">
              <h2 className="cp-card-title">Revenue by wallet</h2>
              {data.byWallet.length === 0 ? (
                <p className="cp-muted">No approved payments yet.</p>
              ) : (
                <table className="cp-table">
                  <thead><tr><th>Wallet</th><th className="cp-num">Payments</th><th className="cp-num">Revenue</th></tr></thead>
                  <tbody>
                    {data.byWallet.map((w) => (
                      <tr key={`${w.walletId}-${w.currency}`}>
                        <td>{w.name}</td>
                        <td className="cp-num">{w.payments}</td>
                        <td className="cp-num cp-strong">{formatMoney(w.revenue, w.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>

          <section className="cp-card" aria-label="Latest payments">
            <div className="cp-row">
              <h2 className="cp-card-title cp-grow">Latest payments</h2>
              <a className="cp-btn cp-btn--ghost" href="/admin/course-payments/requests">Review payments</a>
            </div>
            {data.recent.length === 0 ? (
              <p className="cp-muted">Nothing yet.</p>
            ) : (
              <table className="cp-table">
                <thead>
                  <tr><th>Student</th><th>Course</th><th>Wallet</th><th className="cp-num">Amount</th><th>Status</th><th>Submitted</th></tr>
                </thead>
                <tbody>
                  {data.recent.map((p) => (
                    <tr key={p.id}>
                      <td>{p.studentEmail ?? '—'}</td>
                      <td>{p.courseTitle}</td>
                      <td>{p.walletName}</td>
                      <td className="cp-num">{formatMoney(p.amount, p.currency)}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td className="cp-muted">{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}
