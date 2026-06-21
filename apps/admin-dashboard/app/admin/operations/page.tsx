// P17-064: Operations overview / landing page
import Link from 'next/link';

import { AdminPageHeader } from '../../../components/layout/admin-page-header';
import { AdminCard } from '../../../components/common/admin-card';

type OperationsLink = {
  readonly label: string;
  readonly href: string;
  readonly description: string;
};

const OPERATIONS_LINKS: readonly OperationsLink[] = [
  { label: 'Dashboard',       href: '/admin/operations/dashboard',       description: 'Summary cards for open tickets, incidents, maintenance, and feedback' },
  { label: 'Support Tickets', href: '/admin/operations/support-tickets', description: 'Manage and triage user support requests' },
  { label: 'Feedback',        href: '/admin/operations/feedback',        description: 'Review and triage user feedback submissions' },
  { label: 'Incidents',       href: '/admin/operations/incidents',       description: 'Track and manage platform incidents' },
  { label: 'Maintenance',     href: '/admin/operations/maintenance',     description: 'Schedule and manage maintenance windows' },
  { label: 'Release Notes',   href: '/admin/operations/release-notes',   description: 'Create and publish release notes' },
  { label: 'Feature Flags',   href: '/admin/operations/feature-flags',   description: 'Manage feature flag rollouts' },
];

export default function OperationsOverviewPage() {
  return (
    <div className="ops-overview">
      <AdminPageHeader
        eyebrow="Admin"
        title="Operations"
        description="Post-launch operations management: support, incidents, maintenance, releases, and feature flags."
      />

      <div className="ops-overview-grid">
        {OPERATIONS_LINKS.map((link) => (
          <AdminCard key={link.href} title={link.label} description={link.description}>
            <Link href={link.href} className="ops-overview-link" aria-label={`Go to ${link.label}`}>
              Open {link.label}
              <span className="ops-overview-arrow" aria-hidden="true">&rarr;</span>
            </Link>
          </AdminCard>
        ))}
      </div>

      <p className="ops-overview-boundary-note">
        All data is served by the backend API. This dashboard renders backend-approved data only.
      </p>

      <style>{`
        .ops-overview {
          display: flex;
          flex-direction: column;
          gap: var(--space-24);
        }

        .ops-overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-16);
        }

        .ops-overview-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-8);
          font-size: 14px;
          font-weight: var(--weight-medium);
          color: var(--color-primary-600);
          text-decoration: none;
          transition: color var(--duration-fast) var(--ease-standard);
        }

        .ops-overview-link:hover {
          color: var(--color-primary-700);
        }

        .ops-overview-link:focus-visible {
          outline: none;
          box-shadow: var(--shadow-focus);
          border-radius: var(--radius-sm);
        }

        .ops-overview-arrow {
          transition: transform var(--duration-fast) var(--ease-standard);
        }

        .ops-overview-link:hover .ops-overview-arrow {
          transform: translateX(3px);
        }

        [dir="rtl"] .ops-overview-link:hover .ops-overview-arrow {
          transform: translateX(-3px);
        }

        .ops-overview-boundary-note {
          margin: 0;
          font-size: 12px;
          color: var(--text-muted);
          text-align: center;
          padding: var(--space-8) 0;
        }

        @media (max-width: 640px) {
          .ops-overview-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
