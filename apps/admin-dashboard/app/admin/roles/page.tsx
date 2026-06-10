import { adminRoles } from '../../../lib/admin-roles';
import { roleBasedMenuGroups } from '../../../lib/admin-navigation';

export default function AdminRoleMenuPlaceholderPage() {
  return (
    <section className="admin-placeholder-page">
      <p className="eyebrow">Internal admin surface</p>
      <h1>Role-Based Menu Placeholder</h1>
      <p className="hero-copy">
        This page documents placeholder menu visibility for pilot admin,
        content manager, human reviewer, and project owner roles. It is not an
        authorization implementation.
      </p>

      <div className="role-card-grid">
        {roleBasedMenuGroups.map((group) => {
          const role = adminRoles.find((item) => item.key === group.role);

          return (
            <article className="scope-card" key={group.role}>
              <h2>{role?.label ?? group.role}</h2>
              <p>{role?.description}</p>
              <ul className="role-menu-items">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <strong>{item.label}</strong>
                    <span>{item.description}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <div className="boundary-note">
        <h2>Important boundary</h2>
        <ul>
          <li>This menu is a UI placeholder only.</li>
          <li>It does not grant or deny access.</li>
          <li>Backend API authorization remains final.</li>
          <li>No Supabase service-role key belongs in this app.</li>
          <li>No direct database access is allowed from this dashboard.</li>
        </ul>
      </div>
    </section>
  );
}
