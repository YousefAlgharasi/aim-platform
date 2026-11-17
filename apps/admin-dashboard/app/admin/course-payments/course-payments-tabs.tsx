'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/admin/course-payments', label: 'Overview & revenue' },
  { href: '/admin/course-payments/prices', label: 'Prices' },
  { href: '/admin/course-payments/coupons', label: 'Coupons' },
  { href: '/admin/course-payments/purchases', label: 'Coupon purchases' },
  { href: '/admin/course-payments/wallets', label: 'Wallets' },
  { href: '/admin/course-payments/access', label: 'Course access' },
  { href: '/admin/course-payments/requests', label: 'In-app payments' },
];

export function CoursePaymentsTabs() {
  const path = usePathname() ?? '';
  const [pending, setPending] = useState<{ coupons: number; payments: number } | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () => fetch('/api/admin/proxy/course-billing/pending-total', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => alive && j?.data && setPending(j.data))
      .catch(() => undefined);
    load();
    const id = window.setInterval(load, 20_000);
    return () => { alive = false; window.clearInterval(id); };
  }, [path]);
  const count = (href: string) => (href.endsWith('/purchases') ? pending?.coupons : href.endsWith('/requests') ? pending?.payments : 0) ?? 0;
  return (
    <nav className="cpl-nav" aria-label="Billing and subscriptions navigation">
      <ul className="cpl-nav-list" role="list">
        {TABS.map((t) => {
          const active = t.href === '/admin/course-payments' ? path === t.href : path.startsWith(t.href);
          return (
            <li key={t.href}>
              <a href={t.href} className={`cpl-nav-link${active ? ' cpl-nav-link--active' : ''}`} aria-current={active ? 'page' : undefined}>
                {t.label}
                {count(t.href) > 0 && <span className="sn-count" style={{ marginInlineStart: 8, display: 'inline-block' }}>{count(t.href)}</span>}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
