// P11-008: updated to AIM design system tokens + backend-aligned roles
import Link from 'next/link';

import type { AdminAuthContext, BackendAuthorizedRole } from '../lib/auth';

type NavItem = { label: string; href: string };

const ALL_NAV_ITEMS: NavItem[] = [
  { label: 'Overview',          href: '/admin' },
  { label: 'Users',             href: '/admin/users' },
  { label: 'Courses',           href: '/admin/content/courses' },
  { label: 'Chapters',          href: '/admin/content/chapters' },
  { label: 'Lessons',           href: '/admin/content/lessons' },
  { label: 'Skills',            href: '/admin/content/skills' },
  { label: 'Question Bank',     href: '/admin/content/question-bank' },
  { label: 'Assessments',       href: '/admin/assessments' },
  { label: 'Deadlines',         href: '/admin/deadlines' },
  { label: 'Results',           href: '/admin/assessment-results' },
  { label: 'Placement',         href: '/admin/placement/results' },
  { label: 'Progress',          href: '/admin/students' },
  { label: 'Session Summaries', href: '/admin/session-summaries' },
  { label: 'Audit Logs',        href: '/admin/audit-logs' },
  { label: 'Activity Logs',     href: '/admin/activity-logs' },
  { label: 'Reports',           href: '/admin/reports' },
];

/** Items visible to reviewer only */
const REVIEWER_ITEMS: NavItem[] = [
  { label: 'Overview',      href: '/admin' },
  { label: 'Courses',       href: '/admin/content/courses' },
  { label: 'Chapters',      href: '/admin/content/chapters' },
  { label: 'Lessons',       href: '/admin/content/lessons' },
  { label: 'Skills',        href: '/admin/content/skills' },
  { label: 'Question Bank', href: '/admin/content/question-bank' },
  { label: 'Assessments',   href: '/admin/assessments' },
  { label: 'Results',       href: '/admin/assessment-results' },
  { label: 'Reports',       href: '/admin/reports' },
];

/** Items visible to content_editor */
const CONTENT_EDITOR_ITEMS: NavItem[] = [
  { label: 'Overview',      href: '/admin' },
  { label: 'Courses',       href: '/admin/content/courses' },
  { label: 'Chapters',      href: '/admin/content/chapters' },
  { label: 'Lessons',       href: '/admin/content/lessons' },
  { label: 'Skills',        href: '/admin/content/skills' },
  { label: 'Question Bank', href: '/admin/content/question-bank' },
  { label: 'Assessments',   href: '/admin/assessments' },
];

function getNavItems(roles: readonly BackendAuthorizedRole[]): NavItem[] {
  if (roles.includes('admin') || roles.includes('super_admin')) return ALL_NAV_ITEMS;
  if (roles.includes('content_editor')) return CONTENT_EDITOR_ITEMS;
  if (roles.includes('reviewer')) return REVIEWER_ITEMS;
  return [{ label: 'Overview', href: '/admin' }];
}

export function AdminNavigation({
  authContext,
}: Readonly<{
  authContext: AdminAuthContext;
}>) {
  const items = getNavItems(authContext.roles);
  const roleLabel = authContext.roles.join(', ') || 'unknown';

  return (
    <nav
      className="aim-admin-nav"
      aria-label="Admin navigation"
    >
      {/* Brand */}
      <Link className="aim-admin-brand" href="/admin" aria-label="AIM Admin home">
        <span className="aim-admin-brand-mark" aria-hidden="true">AIM</span>
        <span className="aim-admin-brand-label">Admin</span>
      </Link>

      {/* User info */}
      <div className="aim-admin-user" aria-label="Signed in user">
        <span className="aim-admin-user-email">
          {authContext.user.email ?? authContext.user.id}
        </span>
        <span className="aim-admin-user-role">{roleLabel}</span>
      </div>

      <hr className="aim-admin-divider" aria-hidden="true" />

      {/* Navigation items */}
      <ul className="aim-admin-nav-list" role="list">
        {items.map((item) => (
          <li key={item.href}>
            <Link className="aim-admin-nav-link" href={item.href}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <style>{`
        .aim-admin-nav {
          width: var(--sidebar-width);
          min-height: 100vh;
          background: var(--surface);
          border-inline-end: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          padding: var(--space-20) 0 var(--space-32);
          flex-shrink: 0;
          position: sticky;
          inset-block-start: 0;
          height: 100vh;
          overflow-y: auto;
        }
        .aim-admin-brand {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          padding: var(--space-4) var(--space-16) var(--space-12);
          text-decoration: none;
          color: var(--text-primary);
          min-height: var(--touch-target);
          border-radius: 0;
        }
        .aim-admin-brand:focus-visible { box-shadow: var(--shadow-focus); }
        .aim-admin-brand-mark {
          background: var(--color-primary-500);
          color: var(--text-on-primary);
          font-size: 13px;
          font-weight: var(--weight-bold);
          letter-spacing: 0.04em;
          padding: 3px 7px;
          border-radius: var(--radius-sm);
          line-height: 1;
        }
        .aim-admin-brand-label {
          font-size: 15px;
          font-weight: var(--weight-semibold);
          color: var(--text-primary);
        }
        .aim-admin-user {
          padding: var(--space-8) var(--space-16);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .aim-admin-user-email {
          font-size: 13px;
          font-weight: var(--weight-medium);
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .aim-admin-user-role {
          font-size: 12px;
          color: var(--text-muted);
        }
        .aim-admin-divider {
          border: none;
          border-block-end: 1px solid var(--divider);
          margin: var(--space-8) var(--space-16);
        }
        .aim-admin-nav-list {
          list-style: none;
          margin: 0;
          padding: 0 var(--space-8);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .aim-admin-nav-link {
          display: flex;
          align-items: center;
          min-height: var(--touch-target);
          padding: var(--space-8) var(--space-12);
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: var(--weight-medium);
          color: var(--text-secondary);
          text-decoration: none;
          transition: background var(--duration-fast) var(--ease-standard),
                      color var(--duration-fast) var(--ease-standard);
        }
        .aim-admin-nav-link:hover {
          background: var(--state-hover);
          color: var(--text-primary);
        }
        .aim-admin-nav-link:focus-visible {
          outline: none;
          box-shadow: var(--shadow-focus);
          color: var(--text-primary);
        }
        @media (max-width: 768px) {
          .aim-admin-nav {
            width: 100%;
            min-height: unset;
            height: auto;
            position: static;
            border-inline-end: none;
            border-block-end: 1px solid var(--border);
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
            padding: var(--space-8) var(--space-16);
          }
          .aim-admin-nav-list {
            flex-direction: row;
            flex-wrap: wrap;
            gap: var(--space-4);
            padding: 0;
          }
          .aim-admin-user { display: none; }
          .aim-admin-divider { display: none; }
        }
      `}</style>
    </nav>
  );
}