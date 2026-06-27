import type { ReactNode } from 'react';

export default function AdminBillingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <section className="bil-layout">
      <nav className="bil-nav" aria-label="Billing navigation">
        <ul className="bil-nav-list" role="list">
          <li><a href="/admin/billing" className="bil-nav-link">Overview</a></li>
          <li><a href="/admin/billing/subscriptions" className="bil-nav-link">Subscriptions</a></li>
          <li><a href="/admin/billing/payments" className="bil-nav-link">Payments</a></li>
          <li><a href="/admin/billing/invoices" className="bil-nav-link">Invoices</a></li>
          <li><a href="/admin/billing/refunds" className="bil-nav-link">Refunds</a></li>
          <li><a href="/admin/billing/provider-events" className="bil-nav-link">Provider Events</a></li>
          <li><a href="/admin/billing/products" className="bil-nav-link">Products</a></li>
          <li><a href="/admin/billing/plans" className="bil-nav-link">Plans</a></li>
          <li><a href="/admin/billing/coupons" className="bil-nav-link">Coupons</a></li>
        </ul>
      </nav>

      <div className="bil-content">{children}</div>

      <style>{`
        .bil-layout {
          display: flex;
          flex-direction: column;
          gap: var(--space-24, 24px);
        }

        .bil-nav {
          border-bottom: 1px solid var(--border);
          padding-bottom: var(--space-8, 8px);
          overflow-x: auto;
        }

        .bil-nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          gap: var(--space-4, 4px);
          flex-wrap: nowrap;
        }

        .bil-nav-link {
          display: inline-flex;
          align-items: center;
          min-height: var(--touch-target, 44px);
          padding: var(--space-8, 8px) var(--space-12, 12px);
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: var(--weight-medium, 500);
          color: var(--text-secondary);
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .bil-nav-link:hover {
          background: var(--state-hover, rgba(0,0,0,0.04));
          color: var(--text-primary);
        }

        .bil-nav-link:focus-visible {
          outline: none;
          box-shadow: var(--shadow-focus, 0 0 0 2px var(--color-primary-500));
        }

        .bil-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-24, 24px);
        }

        @media (max-width: 640px) {
          .bil-nav { padding-inline-start: var(--space-4, 4px); }
        }
      `}</style>
    </section>
  );
}
