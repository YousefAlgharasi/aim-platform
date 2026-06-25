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

function StatCard({ label, value, sub, href, accent }: {
  label: string; value: string | number; sub?: string; href?: string; accent?: string;
}) {
  const card = (
    <div className={`dash-stat ${accent ? `dash-stat--${accent}` : ''} ${href ? 'dash-stat--link' : ''}`}>
      <p className="dash-stat-value">{value}</p>
      <p className="dash-stat-label">{label}</p>
      {sub && <p className="dash-stat-sub">{sub}</p>}
    </div>
  );
  return href ? <Link href={href} className="dash-stat-anchor">{card}</Link> : card;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="dash-section-title">{children}</h2>;
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

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="dash">
      <header className="dash-header">
        <div>
          <p className="dash-eyebrow">AIM PLATFORM</p>
          <h1 className="dash-title">{greeting}</h1>
          <p className="dash-date">{dateStr}</p>
        </div>
        <button className="dash-refresh" type="button" onClick={() => { setLoading(true); fetchStats(); }} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </header>

      {error && (
        <div className="dash-error" role="alert">{error}</div>
      )}

      {loading && !stats ? (
        <div className="dash-loading">
          <div className="dash-loading-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="dash-skeleton" />
            ))}
          </div>
        </div>
      ) : stats ? (
        <>
          {/* Users Overview */}
          <section className="dash-section">
            <SectionTitle>Users</SectionTitle>
            <div className="dash-grid dash-grid--4">
              <StatCard label="Total Users" value={stats.users.total.toLocaleString()} href="/admin/users" accent="primary" />
              <StatCard label="Students" value={stats.users.students.toLocaleString()} sub={`${stats.users.total > 0 ? Math.round((stats.users.students / stats.users.total) * 100) : 0}% of total`} />
              <StatCard label="Active Users" value={stats.users.active.toLocaleString()} accent="success" />
              <StatCard label="New This Month" value={`+${stats.users.newThisMonth.toLocaleString()}`} accent="info" />
            </div>
          </section>

          {/* Content */}
          <section className="dash-section">
            <SectionTitle>Content Library</SectionTitle>
            <div className="dash-grid dash-grid--4">
              <StatCard label="Courses" value={stats.content.courses.toLocaleString()} href="/admin/content/courses" accent="primary" />
              <StatCard label="Lessons" value={stats.content.lessons.toLocaleString()} href="/admin/content/lessons" />
              <StatCard label="Questions" value={stats.content.questions.toLocaleString()} href="/admin/content/question-bank" />
              <StatCard label="Skills" value={stats.content.skills.toLocaleString()} href="/admin/content/skills" />
            </div>
          </section>

          {/* Assessments & Activity */}
          <section className="dash-section">
            <SectionTitle>Assessments & Activity</SectionTitle>
            <div className="dash-grid dash-grid--3">
              <StatCard label="Assessments" value={stats.assessments.total.toLocaleString()} href="/admin/assessments" accent="primary" />
              <StatCard label="Total Attempts" value={stats.assessments.attempts.toLocaleString()} href="/admin/assessment-results" />
              <StatCard label="Avg Score" value={stats.assessments.avgScore !== null ? `${stats.assessments.avgScore}%` : '—'} accent={stats.assessments.avgScore !== null && stats.assessments.avgScore >= 70 ? 'success' : 'warning'} />
            </div>
          </section>

          {/* AI & Learning Activity */}
          <section className="dash-section">
            <SectionTitle>AI & Learning</SectionTitle>
            <div className="dash-grid dash-grid--3">
              <StatCard label="AI Chat Sessions" value={stats.activity.aiSessions.toLocaleString()} accent="info" />
              <StatCard label="Voice Sessions" value={stats.activity.voiceSessions.toLocaleString()} />
              <StatCard label="Sessions Today" value={stats.activity.learningSessionsToday.toLocaleString()} accent="success" />
            </div>
          </section>

          {/* Billing & Revenue */}
          <section className="dash-section">
            <SectionTitle>Billing & Revenue</SectionTitle>
            <div className="dash-grid dash-grid--4">
              <StatCard label="Total Revenue" value={`$${(stats.billing.totalRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} accent="success" />
              <StatCard label="Revenue This Month" value={`$${(stats.billing.revenueThisMonth / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} accent="primary" />
              <StatCard label="Active Subscriptions" value={stats.billing.activeSubscriptions.toLocaleString()} sub={`${stats.billing.totalSubscriptions > 0 ? Math.round((stats.billing.activeSubscriptions / stats.billing.totalSubscriptions) * 100) : 0}% of total`} accent="success" />
              <StatCard label="Trialing" value={stats.billing.trialingSubscriptions.toLocaleString()} accent="info" />
            </div>
            <div className="dash-grid dash-grid--4">
              <StatCard label="Total Subscriptions" value={stats.billing.totalSubscriptions.toLocaleString()} accent="primary" />
              <StatCard label="Canceled" value={stats.billing.canceledSubscriptions.toLocaleString()} accent={stats.billing.canceledSubscriptions > 0 ? 'warning' : 'success'} />
              <StatCard label="Paid Invoices" value={stats.billing.paidInvoices.toLocaleString()} accent="success" />
              <StatCard label="Overdue Invoices" value={stats.billing.overdueInvoices.toLocaleString()} accent={stats.billing.overdueInvoices > 0 ? 'error' : 'success'} />
            </div>
          </section>

          {/* Operations */}
          <section className="dash-section">
            <SectionTitle>Operations</SectionTitle>
            <div className="dash-grid dash-grid--3">
              <StatCard label="Open Tickets" value={stats.operations.openTickets} href="/admin/operations/support-tickets" accent={stats.operations.openTickets > 0 ? 'warning' : 'success'} />
              <StatCard label="Active Incidents" value={stats.operations.activeIncidents} href="/admin/operations/incidents" accent={stats.operations.activeIncidents > 0 ? 'error' : 'success'} />
              <StatCard label="Pending Feedback" value={stats.operations.pendingFeedback} href="/admin/operations/feedback" accent={stats.operations.pendingFeedback > 0 ? 'info' : 'success'} />
            </div>
          </section>

          {/* Quick Links */}
          <section className="dash-section">
            <SectionTitle>Quick Links</SectionTitle>
            <div className="dash-links-grid">
              {[
                { label: 'Users', href: '/admin/users', icon: 'U' },
                { label: 'Courses', href: '/admin/content/courses', icon: 'C' },
                { label: 'Assessments', href: '/admin/assessments', icon: 'A' },
                { label: 'Billing', href: '/admin/billing', icon: 'B' },
                { label: 'Reports', href: '/admin/reports', icon: 'R' },
                { label: 'Audit Logs', href: '/admin/audit-logs', icon: 'L' },
                { label: 'Operations', href: '/admin/operations', icon: 'O' },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="dash-quick-link">
                  <span className="dash-quick-link-icon">{link.icon}</span>
                  <span className="dash-quick-link-label">{link.label}</span>
                  <span className="dash-quick-link-arrow">&#8594;</span>
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : null}

      <style>{`
        .dash { display: flex; flex-direction: column; gap: var(--space-32, 32px); }

        .dash-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: var(--space-16, 16px); flex-wrap: wrap;
        }
        .dash-eyebrow {
          margin: 0; font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--color-primary-600, #4f46e5);
        }
        .dash-title {
          margin: 4px 0 0; font-size: 28px; font-weight: 800;
          letter-spacing: -0.02em; color: var(--text-primary, #111);
        }
        .dash-date { margin: 2px 0 0; font-size: 14px; color: var(--text-secondary, #666); }

        .dash-refresh {
          height: 36px; padding: 0 16px; border: 1px solid var(--border, #e5e5e5);
          border-radius: 8px; background: var(--surface, #fff);
          color: var(--text-primary, #111); font-size: 13px; font-weight: 600;
          font-family: inherit; cursor: pointer;
          transition: all 0.15s ease;
        }
        .dash-refresh:hover:not(:disabled) { background: var(--state-hover, #f5f5f5); }
        .dash-refresh:disabled { opacity: 0.5; cursor: not-allowed; }

        .dash-error {
          padding: 12px 16px; background: var(--error-soft, #fef2f2);
          border: 1px solid var(--color-error-200, #fecaca); border-radius: 8px;
          font-size: 13px; color: var(--color-error-700, #b91c1c);
        }

        .dash-loading-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;
        }
        .dash-skeleton {
          height: 110px; border-radius: 12px;
          background: linear-gradient(90deg, var(--surface-raised, #f9f9f9) 25%, var(--state-hover, #f0f0f0) 50%, var(--surface-raised, #f9f9f9) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .dash-section { display: flex; flex-direction: column; gap: var(--space-12, 12px); }
        .dash-section-title {
          margin: 0; font-size: 15px; font-weight: 700;
          color: var(--text-secondary, #555); letter-spacing: -0.01em;
        }

        .dash-grid { display: grid; gap: 12px; }
        .dash-grid--4 { grid-template-columns: repeat(4, 1fr); }
        .dash-grid--3 { grid-template-columns: repeat(3, 1fr); }

        .dash-stat-anchor { text-decoration: none; color: inherit; }
        .dash-stat {
          padding: 20px; border-radius: 12px; border: 1px solid var(--border, #e5e5e5);
          background: var(--surface, #fff);
          transition: all 0.2s ease;
          position: relative; overflow: hidden;
        }
        .dash-stat::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: var(--color-neutral-200, #e5e5e5);
          transition: background 0.2s ease;
        }
        .dash-stat--primary::before { background: var(--color-primary-500, #6366f1); }
        .dash-stat--success::before { background: var(--color-success-500, #22c55e); }
        .dash-stat--warning::before { background: var(--color-warning-500, #f59e0b); }
        .dash-stat--error::before { background: var(--color-error-500, #ef4444); }
        .dash-stat--info::before { background: var(--color-info-500, #3b82f6); }

        .dash-stat--link { cursor: pointer; }
        .dash-stat--link:hover {
          border-color: var(--color-primary-300, #a5b4fc);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transform: translateY(-1px);
        }

        .dash-stat-value {
          margin: 0; font-size: 32px; font-weight: 800;
          letter-spacing: -0.03em; line-height: 1;
          color: var(--text-primary, #111);
        }
        .dash-stat-label {
          margin: 8px 0 0; font-size: 13px; font-weight: 600;
          color: var(--text-secondary, #666);
        }
        .dash-stat-sub {
          margin: 4px 0 0; font-size: 12px;
          color: var(--text-muted, #999);
        }

        .dash-links-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px;
        }
        .dash-quick-link {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; border-radius: 10px;
          border: 1px solid var(--border, #e5e5e5);
          background: var(--surface, #fff);
          text-decoration: none; color: var(--text-primary, #111);
          transition: all 0.15s ease;
        }
        .dash-quick-link:hover {
          border-color: var(--color-primary-300, #a5b4fc);
          background: var(--state-hover, #f5f5f5);
        }
        .dash-quick-link-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: var(--primary-soft, #eef2ff);
          color: var(--color-primary-600, #4f46e5);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800; flex-shrink: 0;
        }
        .dash-quick-link-label { font-size: 14px; font-weight: 600; flex: 1; }
        .dash-quick-link-arrow {
          font-size: 14px; color: var(--text-muted, #999);
          transition: transform 0.15s ease;
        }
        .dash-quick-link:hover .dash-quick-link-arrow { transform: translateX(3px); }

        @media (max-width: 900px) {
          .dash-grid--4 { grid-template-columns: repeat(2, 1fr); }
          .dash-grid--3 { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 500px) {
          .dash-grid--4, .dash-grid--3 { grid-template-columns: 1fr; }
          .dash-title { font-size: 22px; }
          .dash-stat-value { font-size: 26px; }
          .dash-links-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
