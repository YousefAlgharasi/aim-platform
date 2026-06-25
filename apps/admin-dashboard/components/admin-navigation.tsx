// Admin sidebar navigation with grouped categories and SVG icons
import Link from 'next/link';

import type { AdminAuthContext, BackendAuthorizedRole } from '../lib/auth';

type NavItem = { label: string; href: string; icon: string };
type NavGroup = { label: string; items: NavItem[] };

// SVG path data for each icon (24x24 viewBox, stroke-based)
const ICONS: Record<string, string> = {
  dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4',
  users: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  shield: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
  book: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  academic: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15v-3.75m0 0l5.25-3 5.25 3M12 21.75V15',
  layers: 'M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25L12 17.25 2.25 12l4.179-2.25',
  clipboard: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
  puzzle: 'M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.421 48.421 0 01-4.185-.408c-.009 1.607.02 3.217.085 4.828a.642.642 0 00.643.597c.355 0 .676-.186.959-.401.29-.221.634-.349 1.003-.349 1.035 0 1.875 1.007 1.875 2.25s-.84 2.25-1.875 2.25c-.369 0-.713-.128-1.003-.349-.283-.215-.604-.401-.959-.401a.656.656 0 00-.659.663 47.703 47.703 0 00.39 5.207c1.572.118 3.16.18 4.762.18s3.19-.062 4.762-.18a47.67 47.67 0 00.39-5.207.656.656 0 00-.659-.663c-.354 0-.675.186-.958.401-.29.221-.634.349-1.003.349-1.036 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.369 0 .713.128 1.003.349.283.215.604.401.959.401a.64.64 0 00.643-.596 48.108 48.108 0 00.085-4.83 48.542 48.542 0 01-4.185.409.64.64 0 01-.657-.643v0z',
  question: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z',
  photo: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 002.25 6v12zm5.25-9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z',
  target: 'M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 4.5a5.25 5.25 0 110 10.5 5.25 5.25 0 010-10.5zm0 3a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z',
  clock: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  chart: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  progress: 'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605',
  spark: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z',
  mic: 'M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z',
  bell: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
  family: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
  creditcard: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
  wrench: 'M11.42 15.17l-5.1 5.1a2.121 2.121 0 01-3-3l5.1-5.1m2.999-3a4.5 4.5 0 017.5 2.721c0 .648-.18 1.257-.488 1.779l-3.013 3.013m-6.998-3.013a4.5 4.5 0 00-7.5 2.721c0 .648.18 1.257.488 1.779l3.013 3.013',
  ticket: 'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z',
  log: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  report: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75m3-3v3.75m3-6v6.75M5.625 2.25H9.75a2.25 2.25 0 012.25 2.25v.894m-4.875-3.144A2.25 2.25 0 005.625 4.5v15A2.25 2.25 0 007.875 21.75h8.25a2.25 2.25 0 002.25-2.25V11.25a9 9 0 00-9-9z',
  cog: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  logout: 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9',
};

function NavIcon({ name }: { name: string }) {
  const d = ICONS[name];
  if (!d) return null;
  return (
    <svg className="aim-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const ALL_NAV_GROUPS: NavGroup[] = [
  {
    label: '',
    items: [
      { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
    ],
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
      { label: 'Levels', href: '/admin/content/levels', icon: 'layers' },
      { label: 'Chapters', href: '/admin/content/chapters', icon: 'layers' },
      { label: 'Lessons', href: '/admin/content/lessons', icon: 'academic' },
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
      { label: 'Progress', href: '/admin/students', icon: 'progress' },
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

const CONTENT_EDITOR_GROUPS: NavGroup[] = [
  { label: '', items: [{ label: 'Dashboard', href: '/admin', icon: 'dashboard' }] },
  {
    label: 'Content',
    items: [
      { label: 'Courses', href: '/admin/content/courses', icon: 'book' },
      { label: 'Chapters', href: '/admin/content/chapters', icon: 'layers' },
      { label: 'Lessons', href: '/admin/content/lessons', icon: 'academic' },
      { label: 'Skills', href: '/admin/content/skills', icon: 'puzzle' },
      { label: 'Question Bank', href: '/admin/content/question-bank', icon: 'question' },
    ],
  },
  {
    label: 'Assessments',
    items: [{ label: 'Assessments', href: '/admin/assessments', icon: 'clipboard' }],
  },
];

const REVIEWER_GROUPS: NavGroup[] = [
  { label: '', items: [{ label: 'Dashboard', href: '/admin', icon: 'dashboard' }] },
  {
    label: 'Content',
    items: [
      { label: 'Courses', href: '/admin/content/courses', icon: 'book' },
      { label: 'Chapters', href: '/admin/content/chapters', icon: 'layers' },
      { label: 'Lessons', href: '/admin/content/lessons', icon: 'academic' },
      { label: 'Skills', href: '/admin/content/skills', icon: 'puzzle' },
      { label: 'Question Bank', href: '/admin/content/question-bank', icon: 'question' },
    ],
  },
  {
    label: 'Assessments',
    items: [
      { label: 'Assessments', href: '/admin/assessments', icon: 'clipboard' },
      { label: 'Results', href: '/admin/assessment-results', icon: 'chart' },
    ],
  },
  {
    label: 'Reports',
    items: [{ label: 'Reports', href: '/admin/reports', icon: 'report' }],
  },
];

function getNavGroups(roles: readonly BackendAuthorizedRole[]): NavGroup[] {
  if (roles.includes('admin') || roles.includes('super_admin')) return ALL_NAV_GROUPS;
  if (roles.includes('content_editor')) return CONTENT_EDITOR_GROUPS;
  if (roles.includes('reviewer')) return REVIEWER_GROUPS;
  return [{ label: '', items: [{ label: 'Dashboard', href: '/admin', icon: 'dashboard' }] }];
}

export function AdminNavigation({
  authContext,
}: Readonly<{
  authContext: AdminAuthContext;
}>) {
  const groups = getNavGroups(authContext.roles);
  const roleLabel = authContext.roles.join(', ') || 'unknown';

  return (
    <nav className="aim-admin-nav" aria-label="Admin navigation">
      {/* Brand */}
      <Link className="aim-admin-brand" href="/admin" aria-label="AIM Admin home">
        <span className="aim-admin-brand-mark" aria-hidden="true">AIM</span>
        <span className="aim-admin-brand-label">Admin</span>
      </Link>

      {/* User info */}
      <div className="aim-admin-user" aria-label="Signed in user">
        <div className="aim-admin-user-avatar">
          {(authContext.user.email ?? 'U')[0].toUpperCase()}
        </div>
        <div className="aim-admin-user-info">
          <span className="aim-admin-user-email">
            {authContext.user.email ?? authContext.user.id}
          </span>
          <span className="aim-admin-user-role">{roleLabel}</span>
        </div>
      </div>

      <hr className="aim-admin-divider" aria-hidden="true" />

      {/* Navigation groups */}
      <div className="aim-admin-nav-groups">
        {groups.map((group, gi) => (
          <div key={gi} className="aim-admin-nav-group">
            {group.label && (
              <span className="aim-admin-group-label">{group.label}</span>
            )}
            <ul className="aim-admin-nav-list" role="list">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link className="aim-admin-nav-link" href={item.href}>
                    <NavIcon name={item.icon} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="aim-admin-nav-footer">
        <hr className="aim-admin-divider" aria-hidden="true" />
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="aim-admin-nav-link aim-admin-logout-btn">
            <NavIcon name="logout" />
            Logout
          </button>
        </form>
      </div>

      <style>{`
        .aim-admin-nav {
          width: var(--sidebar-width);
          min-height: 100vh;
          background: var(--surface);
          border-inline-end: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: var(--space-16, 16px) 0 var(--space-16, 16px);
          flex-shrink: 0;
          position: sticky;
          inset-block-start: 0;
          height: 100vh;
          overflow-y: auto;
        }
        .aim-admin-brand {
          display: flex;
          align-items: center;
          gap: var(--space-8, 8px);
          padding: var(--space-4, 4px) var(--space-16, 16px) var(--space-12, 12px);
          text-decoration: none;
          color: var(--text-primary);
          min-height: var(--touch-target);
        }
        .aim-admin-brand:focus-visible { box-shadow: var(--shadow-focus); }
        .aim-admin-brand-mark {
          background: var(--color-primary-500);
          color: var(--text-on-primary, #fff);
          font-size: 13px;
          font-weight: var(--weight-bold, 700);
          letter-spacing: 0.04em;
          padding: 3px 7px;
          border-radius: var(--radius-sm, 6px);
          line-height: 1;
        }
        .aim-admin-brand-label {
          font-size: 15px;
          font-weight: var(--weight-semibold, 600);
          color: var(--text-primary);
        }

        .aim-admin-user {
          padding: var(--space-8, 8px) var(--space-16, 16px);
          display: flex;
          align-items: center;
          gap: var(--space-8, 8px);
        }
        .aim-admin-user-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--color-primary-100, #e0e7ff);
          color: var(--color-primary-700, #4338ca);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; flex-shrink: 0;
        }
        .aim-admin-user-info {
          display: flex; flex-direction: column; gap: 1px;
          min-width: 0;
        }
        .aim-admin-user-email {
          font-size: 13px;
          font-weight: var(--weight-medium, 500);
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .aim-admin-user-role {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: capitalize;
        }

        .aim-admin-divider {
          border: none;
          border-block-end: 1px solid var(--divider, #e5e5e5);
          margin: var(--space-8, 8px) var(--space-16, 16px);
        }

        .aim-admin-nav-groups {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-4, 4px);
          padding: 0;
        }
        .aim-admin-nav-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2, 2px);
        }
        .aim-admin-group-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-muted, #999);
          padding: var(--space-12, 12px) var(--space-16, 16px) var(--space-4, 4px);
        }
        .aim-admin-nav-list {
          list-style: none;
          margin: 0;
          padding: 0 var(--space-8, 8px);
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .aim-nav-icon {
          width: 18px; height: 18px; flex-shrink: 0;
        }

        .aim-admin-nav-link {
          display: flex;
          align-items: center;
          gap: var(--space-8, 8px);
          min-height: 36px;
          padding: 6px var(--space-12, 12px);
          border-radius: var(--radius-sm, 6px);
          font-size: 13px;
          font-weight: var(--weight-medium, 500);
          color: var(--text-secondary, #666);
          text-decoration: none;
          transition: background 0.12s ease, color 0.12s ease;
          border: none;
          background: none;
          width: 100%;
          cursor: pointer;
          font-family: inherit;
        }
        .aim-admin-nav-link:hover {
          background: var(--state-hover, #f5f5f5);
          color: var(--text-primary);
        }
        .aim-admin-nav-link:focus-visible {
          outline: none;
          box-shadow: var(--shadow-focus);
          color: var(--text-primary);
        }

        .aim-admin-nav-footer {
          margin-top: auto;
          padding: 0 var(--space-8, 8px) 0;
        }
        .aim-admin-logout-btn {
          color: var(--color-error-600, #dc2626);
        }
        .aim-admin-logout-btn:hover {
          background: var(--error-soft, #fef2f2);
          color: var(--color-error-700, #b91c1c);
        }

        @media (max-width: 768px) {
          .aim-admin-nav {
            width: 100%;
            min-height: unset;
            height: auto;
            position: static;
            border-inline-end: none;
            border-block-end: 1px solid var(--border);
            padding: var(--space-8, 8px) var(--space-16, 16px);
          }
          .aim-admin-nav-groups {
            overflow-y: visible;
          }
          .aim-admin-nav-list {
            flex-direction: row;
            flex-wrap: wrap;
            gap: var(--space-4, 4px);
            padding: 0;
          }
          .aim-admin-group-label { display: none; }
          .aim-admin-user { display: none; }
          .aim-admin-divider { display: none; }
          .aim-admin-nav-footer { display: none; }
        }
      `}</style>
    </nav>
  );
}
