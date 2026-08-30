'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { AdminAuthContext, BackendAuthorizedRole } from '../../../core/auth';
import { NAV_ICONS } from './admin-nav-icon-paths';
import { AdminSvgIcon } from '../../components/Misc/admin-svg-icon';

type NavItem = { label: string; href: string; icon: string };
type NavGroup = { label: string; items: NavItem[] };

function NavIcon({ name }: { name: string }) {
  const d = NAV_ICONS[name];
  if (!d) return null;
  return <AdminSvgIcon d={d} size={18} className="aim-nav-icon" />;
}

const ALL_NAV_GROUPS: NavGroup[] = [
  {
    label: '',
    items: [{ label: 'Dashboard', href: '/admin', icon: 'dashboard' }],
  },
  {
    label: 'Users & Access',
    items: [
      { label: 'Users', href: '/admin/users', icon: 'users' },
      { label: 'Roles', href: '/admin/roles', icon: 'shield' },
      { label: 'Parents', href: '/admin/parents', icon: 'family' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Courses', href: '/admin/content/courses', icon: 'book' },
      { label: 'Skills', href: '/admin/content/skills', icon: 'puzzle' },
      { label: 'Objectives', href: '/admin/content/objectives', icon: 'target' },
      { label: 'Question Bank', href: '/admin/content/question-bank', icon: 'question' },
      { label: 'Assets', href: '/admin/content/assets', icon: 'photo' },
    ],
  },
  {
    label: 'Assessments',
    items: [
      { label: 'Assessments', href: '/admin/assessments', icon: 'clipboard' },
      { label: 'Deadlines', href: '/admin/deadlines', icon: 'clock' },
      { label: 'Results', href: '/admin/assessment-results', icon: 'chart' },
      { label: 'Placement Tests', href: '/admin/placement/tests', icon: 'academic' },
      { label: 'Placement Results', href: '/admin/placement/results', icon: 'chart' },
    ],
  },
  {
    label: 'Learning',
    items: [
      { label: 'Students', href: '/admin/students', icon: 'progress' },
      { label: 'Session Summaries', href: '/admin/session-summaries', icon: 'log' },
      { label: 'Reviews', href: '/admin/reviews', icon: 'clipboard' },
      { label: 'AI Teacher', href: '/admin/ai-teacher', icon: 'spark' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Billing', href: '/admin/billing', icon: 'creditcard' },
      { label: 'Analytics', href: '/admin/analytics', icon: 'chart' },
      { label: 'Reports', href: '/admin/reports', icon: 'report' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Operations', href: '/admin/operations', icon: 'wrench' },
      { label: 'Notifications', href: '/admin/notifications', icon: 'bell' },
      { label: 'Audit Logs', href: '/admin/audit-logs', icon: 'log' },
      { label: 'Activity Logs', href: '/admin/activity-logs', icon: 'log' },
      { label: 'Settings', href: '/admin/settings', icon: 'cog' },
    ],
  },
];

const ALLOWED_PATHS_BY_ROLE: Record<string, string[]> = {
  content_editor: [
    '/admin',
    '/admin/content/courses',
    '/admin/content/lessons',
    '/admin/content/skills',
    '/admin/content/question-bank',
    '/admin/assessments',
  ],
  reviewer: [
    '/admin',
    '/admin/content/courses',
    '/admin/content/lessons',
    '/admin/content/skills',
    '/admin/content/question-bank',
    '/admin/assessments',
    '/admin/assessment-results',
    '/admin/reports',
  ],
};

function getNavGroups(roles: readonly BackendAuthorizedRole[]): NavGroup[] {
  if (roles.includes('admin') || roles.includes('super_admin')) return ALL_NAV_GROUPS;

  const role = roles.find((r) => r in ALLOWED_PATHS_BY_ROLE);
  if (!role) {
    return [{ label: '', items: [{ label: 'Dashboard', href: '/admin', icon: 'dashboard' }] }];
  }

  const allowed = new Set(ALLOWED_PATHS_BY_ROLE[role]);
  return ALL_NAV_GROUPS.map((group) => ({
    label: group.label,
    items: group.items.filter((item) => allowed.has(item.href)),
  })).filter((group) => group.items.length > 0);
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname.startsWith(href);
}

const STORAGE_KEY = 'aim-nav-collapsed';

export function AdminNavigation({
  authContext,
}: Readonly<{
  authContext: AdminAuthContext;
}>) {
  const pathname = usePathname();
  const groups = getNavGroups(authContext.roles);
  const roleLabel = authContext.roles.join(', ') || 'unknown';

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'true') setCollapsed(true);
    } catch {}
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [mobileOpen]);

  const navContent = (
    <>
      {/* Brand */}
      <div className="sn-brand-row">
        <Link className="sn-brand" href="/admin" aria-label="AIM Admin home">
          <span className="sn-brand-mark" aria-hidden="true">
            AIM
          </span>
          {!collapsed && <span className="sn-brand-label">Admin</span>}
        </Link>
        {/* Collapse toggle - desktop only */}
        <button
          type="button"
          className="sn-collapse-btn sn-desktop-only"
          onClick={toggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <NavIcon name={collapsed ? 'chevronRight' : 'chevronLeft'} />
        </button>
        {/* Close button - mobile only */}
        <button
          type="button"
          className="sn-collapse-btn sn-mobile-only"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <NavIcon name="close" />
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="sn-user">
          <div className="sn-user-avatar">
            {(authContext.user.email ?? 'U')[0].toUpperCase()}
          </div>
          <div className="sn-user-info">
            <span className="sn-user-email">{authContext.user.email ?? authContext.user.id}</span>
            <span className="sn-user-role">{roleLabel}</span>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="sn-user-collapsed" title={authContext.user.email ?? authContext.user.id}>
          <div className="sn-user-avatar">
            {(authContext.user.email ?? 'U')[0].toUpperCase()}
          </div>
        </div>
      )}

      <hr className="sn-divider" aria-hidden="true" />

      {/* Nav groups */}
      <div className="sn-groups">
        {groups.map((group, gi) => (
          <div key={gi} className="sn-group">
            {group.label && !collapsed && <span className="sn-group-label">{group.label}</span>}
            {group.label && collapsed && <hr className="sn-group-sep" aria-hidden="true" />}
            <ul className="sn-list" role="list">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      className={`sn-link${active ? ' sn-link--active' : ''}`}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                    >
                      <NavIcon name={item.icon} />
                      {!collapsed && <span className="sn-link-text">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="sn-footer">
        <hr className="sn-divider" aria-hidden="true" />
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="sn-link sn-logout"
            title={collapsed ? 'Logout' : undefined}
          >
            <NavIcon name="logout" />
            {!collapsed && <span className="sn-link-text">Logout</span>}
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type="button"
        className="sn-hamburger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <NavIcon name="menu" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sn-overlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <nav
        className={`sn-sidebar${collapsed ? ' sn-sidebar--collapsed' : ''}${
          mobileOpen ? ' sn-sidebar--mobile-open' : ''
        }`}
        aria-label="Admin navigation"
      >
        {navContent}
      </nav>
    </>
  );
}
