import Link from 'next/link';

import { adminNavigationItems } from '../lib/admin-navigation';

export function AdminNavigation() {
  return (
    <nav className="admin-navigation" aria-label="Admin navigation">
      <Link className="admin-brand" href="/admin">
        <span className="admin-brand-mark">AIM</span>
        <span>
          <strong>Admin</strong>
          <small>Phase 1 shell</small>
        </span>
      </Link>

      <div className="admin-nav-list">
        {adminNavigationItems.map((item) => (
          <Link className="admin-nav-link" href={item.href} key={item.href}>
            <span>{item.label}</span>
            <small>{item.description}</small>
          </Link>
        ))}
      </div>
    </nav>
  );
}
