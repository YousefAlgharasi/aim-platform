// P17-065: Admin operations dashboard UI
// Summary cards: open tickets, active incidents, upcoming maintenance, recent feedback.
// Backend is the final authority for all counts and data.
'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { backendFetch } from '../../../../lib/api/client-api-helpers';

import { OperationsLoadingSpinner } from '../../../../components/operations/operations-loading-spinner';
import { OperationsEmptyState } from '../../../../components/operations/operations-empty-state';
import { OperationsErrorCard } from '../../../../components/operations/operations-error-card';

type DashboardSummary = {
  readonly openTickets: number;
  readonly activeIncidents: number;
  readonly upcomingMaintenance: number;
  readonly recentFeedback: number;
};

type SummaryCardData = {
  readonly label: string;
  readonly value: number;
  readonly href: string;
  readonly variant: 'primary' | 'warning' | 'info' | 'neutral';
};

function buildCards(summary: DashboardSummary): readonly SummaryCardData[] {
  return [
    { label: 'Open Tickets',         value: summary.openTickets,         href: '/admin/operations/support-tickets', variant: 'primary' },
    { label: 'Active Incidents',     value: summary.activeIncidents,     href: '/admin/operations/incidents',       variant: 'warning' },
    { label: 'Upcoming Maintenance', value: summary.upcomingMaintenance, href: '/admin/operations/maintenance',     variant: 'info' },
    { label: 'Recent Feedback',      value: summary.recentFeedback,      href: '/admin/operations/feedback',        variant: 'neutral' },
  ];
}

const VARIANT_CLASSES: Record<string, string> = {
  primary: 'ops-dash-card--primary',
  warning: 'ops-dash-card--warning',
  info:    'ops-dash-card--info',
  neutral: 'ops-dash-card--neutral',
};

export default function OperationsDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await backendFetch('/admin/operations/dashboard');
      if (!res.ok) {
        throw new Error(`Backend error ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      setSummary(json?.data ?? json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load operations dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return <OperationsLoadingSpinner message="Loading operations dashboard..." />;
  }

  if (error) {
    return <OperationsErrorCard message={error} onRetry={fetchDashboard} />;
  }

  if (!summary) {
    return <OperationsEmptyState message="No dashboard data available." />;
  }

  const cards = buildCards(summary);

  return (
    <div className="ops-dash">
      <header className="ops-dash-header">
        <p className="ops-dash-eyebrow">Operations</p>
        <h1 className="ops-dash-title">Dashboard</h1>
        <p className="ops-dash-description">
          Real-time summary of platform operations. All counts are provided by the backend.
        </p>
      </header>

      <div className="ops-dash-grid" role="list" aria-label="Operations summary cards">
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className={`ops-dash-card ${VARIANT_CLASSES[card.variant]}`}
            role="listitem"
            aria-label={`${card.label}: ${card.value}`}
          >
            <span className="ops-dash-card-value">{card.value}</span>
            <span className="ops-dash-card-label">{card.label}</span>
          </a>
        ))}
      </div>

      <p className="ops-dash-boundary-note">
        Data is served by GET /admin/operations/dashboard. Counts are backend-authoritative.
      </p>

      <style>{`
        .ops-dash {
          display: flex;
          flex-direction: column;
          gap: var(--space-24);
        }

        .ops-dash-header {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .ops-dash-eyebrow {
          margin: 0;
          font-size: 12px;
          font-weight: var(--weight-semibold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .ops-dash-title {
          margin: 0;
          font-size: 24px;
          font-weight: var(--weight-bold);
          color: var(--text-primary);
        }

        .ops-dash-description {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .ops-dash-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--space-16);
        }

        .ops-dash-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-8);
          padding: var(--space-24);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          background: var(--surface);
          text-decoration: none;
          transition: box-shadow var(--duration-fast) var(--ease-standard),
                      transform var(--duration-fast) var(--ease-standard);
        }

        .ops-dash-card:hover {
          box-shadow: var(--shadow-card);
          transform: translateY(-1px);
        }

        .ops-dash-card:focus-visible {
          outline: none;
          box-shadow: var(--shadow-focus);
        }

        .ops-dash-card-value {
          font-size: 32px;
          font-weight: var(--weight-bold);
          line-height: 1;
        }

        .ops-dash-card-label {
          font-size: 13px;
          font-weight: var(--weight-medium);
          color: var(--text-secondary);
        }

        /* Variant colors */
        .ops-dash-card--primary .ops-dash-card-value { color: var(--color-primary-600); }
        .ops-dash-card--warning .ops-dash-card-value { color: var(--color-warning-600); }
        .ops-dash-card--info    .ops-dash-card-value { color: var(--color-info-600); }
        .ops-dash-card--neutral .ops-dash-card-value { color: var(--text-primary); }

        .ops-dash-boundary-note {
          margin: 0;
          font-size: 12px;
          color: var(--text-muted);
          text-align: center;
          padding: var(--space-8) 0;
        }

        @media (max-width: 640px) {
          .ops-dash-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 400px) {
          .ops-dash-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
