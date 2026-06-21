import Link from 'next/link';

import { adminAnalyticsNavigationItems } from '../../../lib/admin-analytics-navigation';

export default function AdminAnalyticsPage() {
  return (
    <section className="admin-curriculum-page">
      <header className="admin-page-header">
        <p className="eyebrow">Admin — Analytics</p>
        <h1>Analytics and Reports</h1>
        <p className="hero-copy">
          Analytics navigation for backend-approved platform dashboards,
          report categories, and export tracking.
        </p>
      </header>

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> This dashboard is a navigation shell.
        Metric definitions, aggregation, report assembly, and export scope
        remain backend responsibilities. The UI never calculates analytics
        outputs locally.
      </div>

      <div className="admin-curriculum-grid">
        {adminAnalyticsNavigationItems.map((item) => (
          <Link className="admin-curriculum-card" href={item.href} key={item.href}>
            <span>{item.label}</span>
            <small>{item.description}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}
