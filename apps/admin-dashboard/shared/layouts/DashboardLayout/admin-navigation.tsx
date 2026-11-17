'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { AdminAuthContext, BackendAuthorizedRole } from '../../../core/auth';
import { NAV_ICONS } from './admin-nav-icon-paths';
import { AdminSvgIcon } from '../../components/Misc/admin-svg-icon';
import { ThemeToggle } from '../../components/Theme';

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
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Courses', href: '/admin/content/courses', icon: 'book' },
      { label: 'Skills', href: '/admin/content/skills', icon: 'puzzle' },
      { label: 'Objectives', href: '/admin/content/objectives', icon: 'target' },
      { label: 'Question Bank', href: '/admin/content/question-bank', icon: 'question' },
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
      { label: 'Reviews', href: '/admin/reviews', icon: 'clipboard' },
      { label: 'AI Teacher', href: '/admin/ai-teacher', icon: 'spark' },
      { label: 'Voice Languages', href: '/admin/voice-languages', icon: 'spark' },
      { label: 'Practice Topics', href: '/admin/practice', icon: 'academic' },
      { label: 'Stories', href: '/admin/stories', icon: 'academic' },
      { label: 'Vocabulary', href: '/admin/vocabulary', icon: 'clipboard' },
      { label: 'Achievements & Challenges', href: '/admin/engagement', icon: 'academic' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Billing & Subscriptions', href: '/admin/course-payments', icon: 'banknotes' },
      { label: 'Analytics', href: '/admin/analytics', icon: 'chart' },
      { label: 'Reports', href: '/admin/reports', icon: 'report' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Operations', href: '/admin/operations', icon: 'wrench' },
      { label: 'App Versions', href: '/admin/operations/app-versions', icon: 'phone' },
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

const ALL_NAV_HREFS = ALL_NAV_GROUPS.flatMap((group) => group.items.map((item) => item.href));

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  if (!pathname.startsWith(href)) return false;
  // A more specific item (e.g. /admin/operations/app-versions) wins over its
  // parent (/admin/operations), so only one link is highlighted.
  return !ALL_NAV_HREFS.some(
    (other) => other.length > href.length && other.startsWith(href) && pathname.startsWith(other),
  );
}

const STORAGE_KEY = 'aim-nav-collapsed';
const BILLING_HREF = '/admin/course-payments';

type Pending = { coupons: number; payments: number; total: number };

/** How many coupon purchases / payments wait for review. Polled; a rise raises an alert. */
function usePendingBilling(enabled: boolean): { pending: Pending | null; alert: string | null; dismiss: () => void } {
  const [pending, setPending] = useState<Pending | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    async function poll() {
      try {
        const res = await fetch('/api/admin/proxy/course-billing/pending-total', { cache: 'no-store' });
        if (!res.ok) return;
        const json = (await res.json()) as { data?: Pending };
        const d = json.data;
        if (!alive || !d) return;
        if (last.current !== null && d.total > last.current) {
          const added = d.total - last.current;
          setAlert(added === 1 ? 'New coupon request — a student is waiting for your approval.' : `${added} new coupon requests are waiting for your approval.`);
          beep();
        }
        last.current = d.total;
        setPending(d);
      } catch {
        /* keep the last number */
      }
    }
    poll();
    const id = window.setInterval(poll, 20_000);
    const onVisible = () => { if (document.visibilityState === 'visible') poll(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { alive = false; window.clearInterval(id); document.removeEventListener('visibilitychange', onVisible); };
  }, [enabled]);

  // The browser tab shows the number too, so it is visible when the dashboard is in the background.
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\)\s*/, '');
    document.title = pending && pending.total > 0 ? `(${pending.total}) ${base}` : base;
  }, [pending]);

  return { pending, alert, dismiss: () => setAlert(null) };
}

/** A short two-tone chime; silently skipped if the browser has not allowed audio yet. */
function beep() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const tone = (freq: number, at: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.35);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + at);
      o.stop(ctx.currentTime + at + 0.4);
    };
    tone(880, 0);
    tone(1175, 0.18);
    window.setTimeout(() => void ctx.close(), 900);
  } catch {
    /* audio not available */
  }
}

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
  const showsBilling = groups.some((g) => g.items.some((i) => i.href === BILLING_HREF));
  const { pending, alert, dismiss } = usePendingBilling(showsBilling);

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
            <span className="sn-user-status-dot" aria-hidden="true" />
          </div>
          <div className="sn-user-info">
            <span className="sn-user-email" title={authContext.user.email ?? authContext.user.id}>
              {authContext.user.email ?? authContext.user.id}
            </span>
            <span className="sn-user-role-badge">{roleLabel.replace(/_/g, ' ')}</span>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="sn-user-collapsed" title={`${authContext.user.email ?? authContext.user.id} (${roleLabel})`}>
          <div className="sn-user-avatar">
            {(authContext.user.email ?? 'U')[0].toUpperCase()}
            <span className="sn-user-status-dot" aria-hidden="true" />
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
                      <span className="sn-link-icon-wrap">
                        <NavIcon name={item.icon} />
                        {collapsed && item.href === BILLING_HREF && !!pending?.total && <span className="sn-count-dot" aria-hidden="true" />}
                      </span>
                      {!collapsed && <span className="sn-link-text">{item.label}</span>}
                      {!collapsed && item.href === BILLING_HREF && !!pending?.total && (
                        <span className="sn-count" aria-label={`${pending.total} waiting for review`}>{pending.total > 99 ? '99+' : pending.total}</span>
                      )}
                      {active && !collapsed && <span className="sn-link-active-indicator" aria-hidden="true" />}
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
        <div style={{ padding: '0 6px 4px' }}>
          <ThemeToggle variant="nav" showLabel={!collapsed} />
        </div>
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

      {/* A student just asked for a coupon: visible on every admin page until it is dismissed. */}
      {alert && (
        <div className="sn-toast" role="alert">
          <span className="sn-toast-text">{alert}</span>
          <Link className="sn-toast-action" href="/admin/course-payments/purchases" onClick={dismiss}>Review now</Link>
          <button type="button" className="sn-toast-close" onClick={dismiss} aria-label="Dismiss">×</button>
        </div>
      )}
    </>
  );
}
