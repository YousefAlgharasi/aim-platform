// Billing & Subscriptions: one menu entry, with tabs for revenue, prices, coupons, purchases, wallets and access.
import type { ReactNode } from 'react';

import { CoursePaymentsTabs } from './course-payments-tabs';
import { CoursePaymentsStyles } from '../../../features/course-payments/course-payments-styles';

export default function CoursePaymentsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <section className="cpl-layout">
      <CoursePaymentsTabs />
      <div>{children}</div>
      <CoursePaymentsStyles />
      <style>{`
        .cpl-layout { display: flex; flex-direction: column; gap: var(--space-24, 24px); }
        .cpl-nav { border-bottom: 1px solid var(--border); padding-bottom: var(--space-8, 8px); overflow-x: auto; }
        .cpl-nav-list { list-style: none; margin: 0; padding: 0; display: flex; gap: var(--space-4, 4px); }
        .cpl-nav-link { display: inline-block; padding: var(--space-8, 8px) var(--space-12, 12px); border-radius: var(--radius-md); font-size: 14px; font-weight: var(--weight-medium, 500); color: var(--text-secondary); text-decoration: none; white-space: nowrap; }
        .cpl-nav-link--active { background: var(--color-primary-500); color: var(--text-on-primary) !important; }
        .cpl-nav-link:hover { background: var(--surface-sunken, rgba(0,0,0,0.04)); color: var(--text-primary); }
      `}</style>
    </section>
  );
}
