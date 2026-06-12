import Link from 'next/link';

import { getAdminRoleLabel } from '../lib/admin-roles';
import { roleBasedMenuGroups } from '../lib/admin-navigation';
import type { AdminAuthContext } from '../lib/auth';

export function AdminNavigation({
  authContext,
}: Readonly<{
  authContext: AdminAuthContext;
}>) {
  return (
    <nav className="admin-navigation" aria-label="Admin navigation">
      <Link className="admin-brand" href="/admin">
        <span className="admin-brand-mark">AIM</span>
        <span>
          <strong>Admin</strong>
          <small>Phase 1 shell</small>
        </span>
      </Link>

      <div className="admin-auth-summary">
        <strong>{authContext.user.email ?? authContext.user.id}</strong>
        <small>{authContext.roles.join(', ')}</small>
      </div>

      <p className="admin-menu-note">
        Role-based menu placeholder only. Backend API authorization remains the
        final authority.
      </p>

      <div className="admin-role-menu-list">
        {roleBasedMenuGroups.map((group) => (
          <section className="admin-role-menu-group" key={group.role}>
            <h2>{getAdminRoleLabel(group.role)}</h2>
            <div className="admin-nav-list">
              {group.items.map((item) => (
                <Link className="admin-nav-link" href={item.href} key={item.href}>
                  <span>{item.label}</span>
                  <small>{item.description}</small>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </nav>
  );
}
