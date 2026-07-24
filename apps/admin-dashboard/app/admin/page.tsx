'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { backendFetch } from '../../lib/api/client-api-helpers';
import { DASHBOARD_ICONS } from '../../components/dashboard/dashboard-icon-paths';
import dynamic from 'next/dynamic';
import { KpiCard } from '../../components/dashboard/kpi-card';

const DonutChart = dynamic(() => import('../../components/dashboard/donut-chart').then((m) => m.DonutChart), {
  loading: () => <div className="h-32 w-full animate-pulse bg-neutral-100 rounded-md" />,
});
const HBar = dynamic(() => import('../../components/dashboard/h-bar').then((m) => m.HBar), {
  loading: () => <div className="h-4 w-full animate-pulse bg-neutral-100 rounded-md" />,
});
const ScoreGauge = dynamic(() => import('../../components/dashboard/score-gauge').then((m) => m.ScoreGauge), {
  loading: () => <div className="h-24 w-full animate-pulse bg-neutral-100 rounded-md" />,
});

type DashboardStats = {
  users: { total: number; students: number; admins: number; active: number; newThisMonth: number };
  content: { courses: number; lessons: number; questions: number; skills: number };
  assessments: { total: number; attempts: number; avgScore: number | null };
  activity: { aiSessions: number; voiceSessions: number; learningSessionsToday: number };
  billing: {
    activeSubscriptions: number;
    trialingSubscriptions: number;
    canceledSubscriptions: number;
    totalSubscriptions: number;
    totalRevenue: number;
    revenueThisMonth: number;
    currency: string;
    paidInvoices: number;
    overdueInvoices: number;
  };
  operations: { openTickets: number; activeIncidents: number; pendingFeedback: number };
};

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
      const defaultBilling = {
        activeSubscriptions: 0,
        trialingSubscriptions: 0,
        canceledSubscriptions: 0,
        totalSubscriptions: 0,
        totalRevenue: 0,
        revenueThisMonth: 0,
        currency: 'USD',
        paidInvoices: 0,
        overdueInvoices: 0,
      };
      setStats({ ...raw, billing: { ...defaultBilling, ...raw.billing } });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {greeting}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{dateStr}</p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 h-9 px-3.5 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text-secondary)] text-xs font-semibold hover:bg-[var(--state-hover)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
          onClick={() => {
            setLoading(true);
            fetchStats();
          }}
          disabled={loading}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </header>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700" role="alert">
          {error}
        </div>
      )}

      {loading && !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-[var(--surface-raised)] animate-pulse"
            />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* ── TOP KPI ROW ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={DASHBOARD_ICONS.users}
              label="Total Users"
              value={stats.users.total.toLocaleString()}
              href="/admin/users"
              accent="primary"
            />
            <KpiCard
              icon={DASHBOARD_ICONS.active}
              label="Active Users"
              value={stats.users.active.toLocaleString()}
              sub={`${stats.users.total > 0 ? Math.round((stats.users.active / stats.users.total) * 100) : 0}% of total`}
              accent="success"
            />
            <KpiCard
              icon={DASHBOARD_ICONS.revenue}
              label="Total Revenue"
              value={`$${(stats.billing.totalRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              accent="emerald"
            />
            <KpiCard
              icon={DASHBOARD_ICONS.trending}
              label="Revenue This Month"
              value={`$${(stats.billing.revenueThisMonth / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              accent="blue"
            />
          </div>

          {/* ── CHARTS ROW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* User breakdown donut */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">
                User Breakdown
              </h3>
              <DonutChart
                segments={[
                  { value: stats.users.students, color: 'var(--color-primary-500, #6366f1)', label: 'Students' },
                  { value: stats.users.admins, color: 'var(--color-info-500, #3b82f6)', label: 'Admins' },
                  {
                    value: Math.max(0, stats.users.total - stats.users.students - stats.users.admins),
                    color: 'var(--color-neutral-300, #d4d4d4)',
                    label: 'Other',
                  },
                ]}
              />
            </div>

            {/* Subscription breakdown donut */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">
                Subscriptions
              </h3>
              <DonutChart
                segments={[
                  { value: stats.billing.activeSubscriptions, color: 'var(--color-success-500, #22c55e)', label: 'Active' },
                  { value: stats.billing.trialingSubscriptions, color: 'var(--color-info-500, #3b82f6)', label: 'Trialing' },
                  { value: stats.billing.canceledSubscriptions, color: 'var(--color-warning-500, #f59e0b)', label: 'Canceled' },
                  {
                    value: Math.max(
                      0,
                      stats.billing.totalSubscriptions -
                        stats.billing.activeSubscriptions -
                        stats.billing.trialingSubscriptions -
                        stats.billing.canceledSubscriptions
                    ),
                    color: 'var(--color-neutral-300, #d4d4d4)',
                    label: 'Other',
                  },
                ]}
              />
            </div>

            {/* Avg score gauge */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] flex flex-col items-center text-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4 self-start">
                Assessment Performance
              </h3>
              <ScoreGauge score={stats.assessments.avgScore} label="Average Score" />
              <div className="flex gap-8 mt-4 pt-4 border-t border-[var(--border)] w-full justify-center">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-extrabold text-[var(--text-primary)]">
                    {stats.assessments.total.toLocaleString()}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">Assessments</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-extrabold text-[var(--text-primary)]">
                    {stats.assessments.attempts.toLocaleString()}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">Attempts</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── CONTENT & ACTIVITY ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Content bar chart */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">
                Content Library
              </h3>
              <div className="flex flex-col gap-3.5">
                {(() => {
                  const contentMax = Math.max(
                    stats.content.courses,
                    stats.content.lessons,
                    stats.content.questions,
                    stats.content.skills,
                    1
                  );
                  return (
                    <>
                      <HBar label="Courses" value={stats.content.courses} max={contentMax} color="var(--color-primary-500, #6366f1)" />
                      <HBar label="Lessons" value={stats.content.lessons} max={contentMax} color="var(--color-info-500, #3b82f6)" />
                      <HBar label="Questions" value={stats.content.questions} max={contentMax} color="var(--color-success-500, #22c55e)" />
                      <HBar label="Skills" value={stats.content.skills} max={contentMax} color="var(--color-warning-500, #f59e0b)" />
                    </>
                  );
                })()}
              </div>
            </div>

            {/* AI & Learning activity */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">
                AI & Learning Activity
              </h3>
              <div className="flex flex-col gap-3.5">
                {(() => {
                  const actMax = Math.max(
                    stats.activity.aiSessions,
                    stats.activity.voiceSessions,
                    stats.activity.learningSessionsToday,
                    1
                  );
                  return (
                    <>
                      <HBar label="AI Chat Sessions" value={stats.activity.aiSessions} max={actMax} color="var(--color-primary-500, #6366f1)" />
                      <HBar label="Voice Sessions" value={stats.activity.voiceSessions} max={actMax} color="var(--color-info-500, #3b82f6)" />
                      <HBar label="Sessions Today" value={stats.activity.learningSessionsToday} max={actMax} color="var(--color-success-500, #22c55e)" />
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Operations status */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">
                Operations Status
              </h3>
              <div className="flex flex-col gap-1">
                <Link
                  href="/admin/operations/support-tickets"
                  className="flex items-center gap-2.5 p-2 rounded-lg text-xs hover:bg-[var(--state-hover)] transition-colors"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      stats.operations.openTickets > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                  <span className="flex-1 text-[var(--text-secondary)]">Open Tickets</span>
                  <span className="font-bold text-[var(--text-primary)]">{stats.operations.openTickets}</span>
                </Link>
                <Link
                  href="/admin/operations/incidents"
                  className="flex items-center gap-2.5 p-2 rounded-lg text-xs hover:bg-[var(--state-hover)] transition-colors"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      stats.operations.activeIncidents > 0 ? 'bg-red-500 animate-ping' : 'bg-emerald-500'
                    }`}
                  />
                  <span className="flex-1 text-[var(--text-secondary)]">Active Incidents</span>
                  <span className="font-bold text-[var(--text-primary)]">{stats.operations.activeIncidents}</span>
                </Link>
                <Link
                  href="/admin/operations/feedback"
                  className="flex items-center gap-2.5 p-2 rounded-lg text-xs hover:bg-[var(--state-hover)] transition-colors"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      stats.operations.pendingFeedback > 0 ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}
                  />
                  <span className="flex-1 text-[var(--text-secondary)]">Pending Feedback</span>
                  <span className="font-bold text-[var(--text-primary)]">{stats.operations.pendingFeedback}</span>
                </Link>
                <div className="flex items-center gap-2.5 p-2 rounded-lg text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="flex-1 text-[var(--text-secondary)]">Paid Invoices</span>
                  <span className="font-bold text-[var(--text-primary)]">{stats.billing.paidInvoices}</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-lg text-xs">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      stats.billing.overdueInvoices > 0 ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                  />
                  <span className="flex-1 text-[var(--text-secondary)]">Overdue Invoices</span>
                  <span className="font-bold text-[var(--text-primary)]">{stats.billing.overdueInvoices}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── BOTTOM KPI ROW ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={DASHBOARD_ICONS.subscription}
              label="Active Subscriptions"
              value={stats.billing.activeSubscriptions.toLocaleString()}
              sub={`of ${stats.billing.totalSubscriptions.toLocaleString()} total`}
              accent="success"
            />
            <KpiCard
              icon={DASHBOARD_ICONS.trending}
              label="New Users This Month"
              value={`+${stats.users.newThisMonth.toLocaleString()}`}
              accent="blue"
            />
            <KpiCard
              icon={DASHBOARD_ICONS.warning}
              label="Overdue Invoices"
              value={stats.billing.overdueInvoices.toLocaleString()}
              accent={stats.billing.overdueInvoices > 0 ? 'error' : 'success'}
            />
            <KpiCard
              icon={DASHBOARD_ICONS.subscription}
              label="Trialing"
              value={stats.billing.trialingSubscriptions.toLocaleString()}
              accent="blue"
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
