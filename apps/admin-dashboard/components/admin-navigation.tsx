import Link from 'next/link';

import { getAdminRoleLabel } from '../lib/admin-roles';
import { roleBasedMenuGroups } from '../lib/admin-navigation';

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
