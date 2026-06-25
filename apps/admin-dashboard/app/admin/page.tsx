'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { backendFetch } from '../../lib/api/client-api-helpers';

type DashboardStats = {
  users: { total: number; students: number; admins: number; active: number; newThisMonth: number };
  content: { courses: number; lessons: number; questions: number; skills: number };
  assessments: { total: number; attempts: number; avgScore: number | null };
  activity: { aiSessions: number; voiceSessions: number; learningSessionsToday: number };
  billing: { activeSubscriptions: number; trialingSubscriptions: number; canceledSubscriptions: number; totalSubscriptions: number; totalRevenue: number; revenueThisMonth: number; currency: string; paidInvoices: number; overdueInvoices: number };
  operations: { openTickets: number; activeIncidents: number; pendingFeedback: number };
};

/* ── Tiny SVG icons (inline, no library) ── */
function Icon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
const ICON = {
  users: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  revenue: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  active: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  trending: 'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941',
  subscription: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
  warning: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
};

/* ── Donut chart (pure SVG) ── */
function DonutChart({ segments, size = 140, thickness = 20 }: {
  segments: { value: number; color: string; label: string }[];
  size?: number; thickness?: number;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const r = (size - thickness) / 2;
  const c = Math.PI * 2 * r;
  let offset = 0;

  return (
    <div className="dash-donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border, #e5e5e5)" strokeWidth={thickness} />
        {total > 0 && segments.filter(s => s.value > 0).map((seg, i) => {
          const pct = seg.value / total;
          const dash = c * pct;
          const el = (
            <circle
              key={i}
              cx={size / 2} cy={size / 2} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          );
          offset += dash;
          return el;
        })}
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: '22px', fontWeight: 800, fill: 'var(--text-primary, #111)' }}>
          {total.toLocaleString()}
        </text>
      </svg>
      <div className="dash-donut-legend">
        {segments.map((seg, i) => (
          <div key={i} className="dash-legend-item">
            <span className="dash-legend-dot" style={{ background: seg.color }} />
            <span className="dash-legend-label">{seg.label}</span>
            <span className="dash-legend-val">{seg.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Horizontal bar ── */
function HBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="dash-hbar">
      <div className="dash-hbar-head">
        <span className="dash-hbar-label">{label}</span>
        <span className="dash-hbar-val">{value.toLocaleString()}</span>
      </div>
      <div className="dash-hbar-track">
        <div className="dash-hbar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/* ── Score gauge (half-circle) ── */
function ScoreGauge({ score, label }: { score: number | null; label: string }) {
  const pct = score !== null ? Math.min(score, 100) : 0;
  const r = 60;
  const c = Math.PI * r;
  const dash = (pct / 100) * c;
  const gaugeColor = score === null ? 'var(--text-muted)' : score >= 70 ? 'var(--color-success-500, #22c55e)' : score >= 50 ? 'var(--color-warning-500, #f59e0b)' : 'var(--color-error-500, #ef4444)';

  return (
    <div className="dash-gauge">
      <svg width="140" height="80" viewBox="0 0 140 80">
        <path d={`M 10 75 A ${r} ${r} 0 0 1 130 75`} fill="none" stroke="var(--border, #e5e5e5)" strokeWidth="10" strokeLinecap="round" />
        {score !== null && (
          <path d={`M 10 75 A ${r} ${r} 0 0 1 130 75`} fill="none" stroke={gaugeColor} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`} />
        )}
        <text x="70" y="68" textAnchor="middle" style={{ fontSize: '24px', fontWeight: 800, fill: 'var(--text-primary, #111)' }}>
          {score !== null ? `${score}%` : '--'}
        </text>
      </svg>
      <p className="dash-gauge-label">{label}</p>
    </div>
  );
}

/* ── KPI card with icon ── */
function KpiCard({ icon, label, value, sub, accent, href }: {
  icon: string; label: string; value: string | number; sub?: string; accent: string; href?: string;
}) {
  const card = (
    <div className={`dash-kpi dash-kpi--${accent}`}>
      <div className="dash-kpi-icon-wrap">
        <Icon d={icon} size={22} />
      </div>
      <div className="dash-kpi-body">
        <p className="dash-kpi-value">{value}</p>
        <p className="dash-kpi-label">{label}</p>
        {sub && <p className="dash-kpi-sub">{sub}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href} className="dash-kpi-anchor">{card}</Link> : card;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await backendFetch('/admin/stats');
      if (!res.ok) throw new Error(`Backend error ${res.status}`);
      const json = await res.json();
      const raw = json?.data ?? json;
      const defaultBilling = { activeSubscriptions: 0, trialingSubscriptions: 0, canceledSubscriptions: 0, totalSubscriptions: 0, totalRevenue: 0, revenueThisMonth: 0, currency: 'USD', paidInvoices: 0, overdueInvoices: 0 };
      setStats({ ...raw, billing: { ...defaultBilling, ...raw.billing } });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="dash">
      <header className="dash-header">
        <div>
          <h1 className="dash-title">{greeting}</h1>
          <p className="dash-date">{dateStr}</p>
        </div>
        <button className="dash-refresh" type="button" onClick={() => { setLoading(true); fetchStats(); }} disabled={loading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </header>

      {error && <div className="dash-error" role="alert">{error}</div>}

      {loading && !stats ? (
        <div className="dash-loading-grid">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="dash-skeleton" />)}
        </div>
      ) : stats ? (
        <>
          {/* ── TOP KPI ROW ── */}
          <div className="dash-kpi-row">
            <KpiCard icon={ICON.users} label="Total Users" value={stats.users.total.toLocaleString()} href="/admin/users" accent="primary" />
            <KpiCard icon={ICON.active} label="Active Users" value={stats.users.active.toLocaleString()} sub={`${stats.users.total > 0 ? Math.round((stats.users.active / stats.users.total) * 100) : 0}% of total`} accent="success" />
            <KpiCard icon={ICON.revenue} label="Total Revenue" value={`$${(stats.billing.totalRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} accent="emerald" />
            <KpiCard icon={ICON.trending} label="Revenue This Month" value={`$${(stats.billing.revenueThisMonth / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} accent="blue" />
          </div>

          {/* ── CHARTS ROW ── */}
          <div className="dash-charts-row">
            {/* User breakdown donut */}
            <div className="dash-card">
              <h3 className="dash-card-title">User Breakdown</h3>
              <DonutChart segments={[
                { value: stats.users.students, color: 'var(--color-primary-500, #6366f1)', label: 'Students' },
                { value: stats.users.admins, color: 'var(--color-info-500, #3b82f6)', label: 'Admins' },
                { value: Math.max(0, stats.users.total - stats.users.students - stats.users.admins), color: 'var(--color-neutral-300, #d4d4d4)', label: 'Other' },
              ]} />
            </div>

            {/* Subscription breakdown donut */}
            <div className="dash-card">
              <h3 className="dash-card-title">Subscriptions</h3>
              <DonutChart segments={[
                { value: stats.billing.activeSubscriptions, color: 'var(--color-success-500, #22c55e)', label: 'Active' },
                { value: stats.billing.trialingSubscriptions, color: 'var(--color-info-500, #3b82f6)', label: 'Trialing' },
                { value: stats.billing.canceledSubscriptions, color: 'var(--color-warning-500, #f59e0b)', label: 'Canceled' },
                { value: Math.max(0, stats.billing.totalSubscriptions - stats.billing.activeSubscriptions - stats.billing.trialingSubscriptions - stats.billing.canceledSubscriptions), color: 'var(--color-neutral-300, #d4d4d4)', label: 'Other' },
              ]} />
            </div>

            {/* Avg score gauge */}
            <div className="dash-card dash-card--center">
              <h3 className="dash-card-title">Assessment Performance</h3>
              <ScoreGauge score={stats.assessments.avgScore} label="Average Score" />
              <div className="dash-card-stats-row">
                <div className="dash-mini-stat">
                  <span className="dash-mini-val">{stats.assessments.total.toLocaleString()}</span>
                  <span className="dash-mini-label">Assessments</span>
                </div>
                <div className="dash-mini-stat">
                  <span className="dash-mini-val">{stats.assessments.attempts.toLocaleString()}</span>
                  <span className="dash-mini-label">Attempts</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── CONTENT & ACTIVITY ── */}
          <div className="dash-charts-row">
            {/* Content bar chart */}
            <div className="dash-card">
              <h3 className="dash-card-title">Content Library</h3>
              <div className="dash-hbar-list">
                {(() => {
                  const contentMax = Math.max(stats.content.courses, stats.content.lessons, stats.content.questions, stats.content.skills, 1);
                  return (<>
                    <HBar label="Courses" value={stats.content.courses} max={contentMax} color="var(--color-primary-500, #6366f1)" />
                    <HBar label="Lessons" value={stats.content.lessons} max={contentMax} color="var(--color-info-500, #3b82f6)" />
                    <HBar label="Questions" value={stats.content.questions} max={contentMax} color="var(--color-success-500, #22c55e)" />
                    <HBar label="Skills" value={stats.content.skills} max={contentMax} color="var(--color-warning-500, #f59e0b)" />
                  </>);
                })()}
              </div>
            </div>

            {/* AI & Learning activity */}
            <div className="dash-card">
              <h3 className="dash-card-title">AI & Learning Activity</h3>
              <div className="dash-hbar-list">
                {(() => {
                  const actMax = Math.max(stats.activity.aiSessions, stats.activity.voiceSessions, stats.activity.learningSessionsToday, 1);
                  return (<>
                    <HBar label="AI Chat Sessions" value={stats.activity.aiSessions} max={actMax} color="var(--color-primary-500, #6366f1)" />
                    <HBar label="Voice Sessions" value={stats.activity.voiceSessions} max={actMax} color="var(--color-info-500, #3b82f6)" />
                    <HBar label="Sessions Today" value={stats.activity.learningSessionsToday} max={actMax} color="var(--color-success-500, #22c55e)" />
                  </>);
                })()}
              </div>
            </div>

            {/* Operations status */}
            <div className="dash-card">
              <h3 className="dash-card-title">Operations Status</h3>
              <div className="dash-ops-list">
                <Link href="/admin/operations/support-tickets" className="dash-ops-item">
                  <span className={`dash-ops-dot ${stats.operations.openTickets > 0 ? 'dash-ops-dot--warn' : 'dash-ops-dot--ok'}`} />
                  <span className="dash-ops-label">Open Tickets</span>
                  <span className="dash-ops-val">{stats.operations.openTickets}</span>
                </Link>
                <Link href="/admin/operations/incidents" className="dash-ops-item">
                  <span className={`dash-ops-dot ${stats.operations.activeIncidents > 0 ? 'dash-ops-dot--error' : 'dash-ops-dot--ok'}`} />
                  <span className="dash-ops-label">Active Incidents</span>
                  <span className="dash-ops-val">{stats.operations.activeIncidents}</span>
                </Link>
                <Link href="/admin/operations/feedback" className="dash-ops-item">
                  <span className={`dash-ops-dot ${stats.operations.pendingFeedback > 0 ? 'dash-ops-dot--info' : 'dash-ops-dot--ok'}`} />
                  <span className="dash-ops-label">Pending Feedback</span>
                  <span className="dash-ops-val">{stats.operations.pendingFeedback}</span>
                </Link>
                <div className="dash-ops-item">
                  <span className="dash-ops-dot dash-ops-dot--ok" />
                  <span className="dash-ops-label">Paid Invoices</span>
                  <span className="dash-ops-val">{stats.billing.paidInvoices}</span>
                </div>
                <div className="dash-ops-item">
                  <span className={`dash-ops-dot ${stats.billing.overdueInvoices > 0 ? 'dash-ops-dot--error' : 'dash-ops-dot--ok'}`} />
                  <span className="dash-ops-label">Overdue Invoices</span>
                  <span className="dash-ops-val">{stats.billing.overdueInvoices}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── BOTTOM KPI ROW ── */}
          <div className="dash-kpi-row">
            <KpiCard icon={ICON.subscription} label="Active Subscriptions" value={stats.billing.activeSubscriptions.toLocaleString()} sub={`of ${stats.billing.totalSubscriptions.toLocaleString()} total`} accent="success" />
            <KpiCard icon={ICON.trending} label="New Users This Month" value={`+${stats.users.newThisMonth.toLocaleString()}`} accent="blue" />
            <KpiCard icon={ICON.warning} label="Overdue Invoices" value={stats.billing.overdueInvoices.toLocaleString()} accent={stats.billing.overdueInvoices > 0 ? 'error' : 'success'} />
            <KpiCard icon={ICON.subscription} label="Trialing" value={stats.billing.trialingSubscriptions.toLocaleString()} accent="blue" />
          </div>
        </>
      ) : null}

      <style>{`
        .dash { display: flex; flex-direction: column; gap: 24px; }

        /* Header */
        .dash-header {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
        }
        .dash-title { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; color: var(--text-primary, #111); }
        .dash-date { margin: 4px 0 0; font-size: 14px; color: var(--text-muted, #999); }
        .dash-refresh {
          display: flex; align-items: center; gap: 6px;
          height: 36px; padding: 0 14px; border: 1px solid var(--border, #e5e5e5);
          border-radius: 8px; background: var(--surface, #fff);
          color: var(--text-secondary, #666); font-size: 13px; font-weight: 600;
          font-family: inherit; cursor: pointer; transition: all 0.15s ease;
        }
        .dash-refresh:hover:not(:disabled) { background: var(--state-hover, #f5f5f5); color: var(--text-primary); }
        .dash-refresh:disabled { opacity: 0.5; cursor: not-allowed; }

        .dash-error {
          padding: 12px 16px; background: var(--error-soft, #fef2f2);
          border: 1px solid var(--color-error-200, #fecaca); border-radius: 10px;
          font-size: 13px; color: var(--color-error-700, #b91c1c);
        }

        .dash-loading-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .dash-skeleton {
          height: 180px; border-radius: 14px;
          background: linear-gradient(90deg, var(--surface-raised, #f9f9f9) 25%, var(--state-hover, #f0f0f0) 50%, var(--surface-raised, #f9f9f9) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* KPI row */
        .dash-kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .dash-kpi-anchor { text-decoration: none; color: inherit; }
        .dash-kpi {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 20px; border-radius: 14px;
          border: 1px solid var(--border, #e5e5e5);
          background: var(--surface, #fff);
          transition: all 0.2s ease;
        }
        .dash-kpi-anchor:hover .dash-kpi {
          border-color: var(--color-primary-200, #c7d2fe);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          transform: translateY(-2px);
        }
        .dash-kpi-icon-wrap {
          width: 42px; height: 42px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .dash-kpi--primary .dash-kpi-icon-wrap { background: var(--color-primary-100, #e0e7ff); color: var(--color-primary-600, #4f46e5); }
        .dash-kpi--success .dash-kpi-icon-wrap { background: #dcfce7; color: #16a34a; }
        .dash-kpi--emerald .dash-kpi-icon-wrap { background: #d1fae5; color: #059669; }
        .dash-kpi--blue .dash-kpi-icon-wrap { background: #dbeafe; color: #2563eb; }
        .dash-kpi--error .dash-kpi-icon-wrap { background: #fee2e2; color: #dc2626; }
        .dash-kpi--warning .dash-kpi-icon-wrap { background: #fef3c7; color: #d97706; }

        .dash-kpi-body { min-width: 0; }
        .dash-kpi-value { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; color: var(--text-primary, #111); }
        .dash-kpi-label { margin: 4px 0 0; font-size: 13px; font-weight: 500; color: var(--text-muted, #999); }
        .dash-kpi-sub { margin: 2px 0 0; font-size: 12px; color: var(--text-muted, #bbb); }

        /* Cards */
        .dash-charts-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .dash-card {
          padding: 24px; border-radius: 14px;
          border: 1px solid var(--border, #e5e5e5);
          background: var(--surface, #fff);
        }
        .dash-card--center { text-align: center; display: flex; flex-direction: column; align-items: center; }
        .dash-card-title { margin: 0 0 18px; font-size: 14px; font-weight: 700; color: var(--text-secondary, #555); }

        /* Donut */
        .dash-donut-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .dash-donut-legend { display: flex; flex-direction: column; gap: 6px; width: 100%; }
        .dash-legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
        .dash-legend-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
        .dash-legend-label { flex: 1; color: var(--text-secondary, #666); }
        .dash-legend-val { font-weight: 700; color: var(--text-primary, #111); }

        /* Gauge */
        .dash-gauge { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .dash-gauge-label { margin: 0; font-size: 13px; color: var(--text-muted, #999); font-weight: 500; }

        .dash-card-stats-row { display: flex; gap: 32px; margin-top: 16px; }
        .dash-mini-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .dash-mini-val { font-size: 22px; font-weight: 800; color: var(--text-primary, #111); }
        .dash-mini-label { font-size: 12px; color: var(--text-muted, #999); }

        /* H bars */
        .dash-hbar-list { display: flex; flex-direction: column; gap: 14px; }
        .dash-hbar-head { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .dash-hbar-label { font-size: 13px; color: var(--text-secondary, #666); }
        .dash-hbar-val { font-size: 13px; font-weight: 700; color: var(--text-primary, #111); }
        .dash-hbar-track { height: 8px; border-radius: 4px; background: var(--color-neutral-100, #f5f5f5); overflow: hidden; }
        .dash-hbar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }

        /* Operations */
        .dash-ops-list { display: flex; flex-direction: column; gap: 2px; }
        .dash-ops-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 8px;
          text-decoration: none; color: inherit;
          transition: background 0.12s ease;
        }
        a.dash-ops-item:hover { background: var(--state-hover, #f5f5f5); }
        .dash-ops-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .dash-ops-dot--ok { background: var(--color-success-500, #22c55e); }
        .dash-ops-dot--warn { background: var(--color-warning-500, #f59e0b); }
        .dash-ops-dot--error { background: var(--color-error-500, #ef4444); animation: pulse-dot 2s infinite; }
        .dash-ops-dot--info { background: var(--color-info-500, #3b82f6); }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .dash-ops-label { flex: 1; font-size: 13px; color: var(--text-secondary, #666); }
        .dash-ops-val { font-size: 14px; font-weight: 700; color: var(--text-primary, #111); }

        /* Responsive */
        @media (max-width: 1100px) {
          .dash-kpi-row { grid-template-columns: repeat(2, 1fr); }
          .dash-charts-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .dash-kpi-row { grid-template-columns: 1fr; }
          .dash-title { font-size: 22px; }
          .dash-kpi-value { font-size: 22px; }
        }
      `}</style>
    </div>
  );
}
