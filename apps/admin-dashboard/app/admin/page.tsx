// P11-012: Admin Dashboard Home
// Role-scoped quick-link cards using AIM design system.
// No backend metrics fetched here — auth context is already available from parent layout.
// Backend remains final authority for all data; this page is navigation only.

import Link from 'next/link';
import { cookies } from 'next/headers';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../lib/auth/admin-auth';
import { AdminPageHeader } from '../../components/layout/admin-page-header';
import { AdminCard } from '../../components/common/admin-card';

type QuickLinkGroup = {
  readonly title: string;
  readonly description: string;
  readonly links: readonly { label: string; href: string; description: string }[];
  readonly roles: readonly string[];
};

const QUICK_LINK_GROUPS: readonly QuickLinkGroup[] = [
  {
    title: 'Users',
    description: 'Manage platform users and role assignments.',
    roles: ['admin', 'super_admin'],
    links: [
      { label: 'All Users', href: '/admin/users', description: 'Browse and manage user accounts' },
    ],
  },
  {
    title: 'Curriculum',
    description: 'Manage courses, chapters, lessons, skills, and question bank.',
    roles: ['admin', 'super_admin', 'content_editor', 'reviewer'],
    links: [
      { label: 'Courses',       href: '/admin/content/courses',       description: 'Create and publish courses' },
      { label: 'Chapters',      href: '/admin/content/chapters',      description: 'Manage course chapters' },
      { label: 'Lessons',       href: '/admin/content/lessons',       description: 'Manage lessons' },
      { label: 'Skills',        href: '/admin/content/skills',        description: 'Manage skill taxonomy' },
      { label: 'Question Bank', href: '/admin/content/question-bank', description: 'Manage questions' },
    ],
  },
  {
    title: 'Assessments',
    description: 'Configure quizzes, exams, and deadlines.',
    roles: ['admin', 'super_admin', 'content_editor'],
    links: [
      { label: 'Assessments', href: '/admin/assessments', description: 'Manage quizzes and exams' },
      { label: 'Deadlines',   href: '/admin/deadlines',   description: 'Manage assessment deadlines' },
    ],
  },
  {
    title: 'Results & Progress',
    description: 'View assessment results, placement history, and student progress.',
    roles: ['admin', 'super_admin', 'reviewer'],
    links: [
      { label: 'Assessment Results', href: '/admin/assessment-results', description: 'View all attempt results' },
      { label: 'Placement Results',  href: '/admin/placement/results',  description: 'View placement history' },
      { label: 'Student Progress',   href: '/admin/students',           description: 'View student progress' },
    ],
  },
  {
    title: 'Logs & Reports',
    description: 'View audit logs, activity logs, and operational reports.',
    roles: ['admin', 'super_admin'],
    links: [
      { label: 'Audit Logs',     href: '/admin/audit-logs',     description: 'AIM audit log' },
      { label: 'Activity Logs',  href: '/admin/activity-logs',  description: 'Platform activity' },
      { label: 'Reports',        href: '/admin/reports',         description: 'Basic operational reports' },
    ],
  },
];

export default async function AdminOverviewPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
  // Token presence confirms auth — actual role enforcement is in the parent layout.
  const isAuthenticated = Boolean(token);

  return (
    <div className="aim-home">
      <AdminPageHeader
        eyebrow="AIM Platform"
        title="Admin Dashboard"
        description="Manage users, curriculum, assessments, and platform operations."
      />

      {!isAuthenticated && (
        <div
          className="aim-home-warning"
          role="alert"
          aria-live="polite"
        >
          Session token not detected. Some actions may require re-authentication.
        </div>
      )}

      <div className="aim-home-grid">
        {QUICK_LINK_GROUPS.map((group) => (
          <AdminCard
            key={group.title}
            title={group.title}
            description={group.description}
          >
            <ul className="aim-home-link-list" role="list">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="aim-home-link"
                    aria-label={`${link.label} — ${link.description}`}
                  >
                    <span className="aim-home-link-label">{link.label}</span>
                    <span className="aim-home-link-desc" aria-hidden="true">
                      {link.description}
                    </span>
                    <span className="aim-home-link-arrow" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </AdminCard>
        ))}
      </div>

      <p className="aim-home-boundary-note">
        All data is served by the backend API. Role enforcement and authorization
        are backend responsibilities. This dashboard renders backend-approved data only.
      </p>

      <style>{`
        .aim-home { display: flex; flex-direction: column; gap: var(--space-32); }

        .aim-home-warning {
          background: var(--warning-soft);
          color: var(--warning-soft-fg);
          padding: var(--space-12) var(--space-16);
          border-radius: var(--radius-md);
          font-size: 14px;
          border-inline-start: 3px solid var(--color-warning-500);
        }

        .aim-home-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-16);
        }

        .aim-home-link-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .aim-home-link {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          min-height: var(--touch-target);
          padding: var(--space-8) var(--space-12);
          border-radius: var(--radius-sm);
          text-decoration: none;
          color: var(--text-primary);
          transition: background var(--duration-fast) var(--ease-standard);
        }
        .aim-home-link:hover { background: var(--state-hover); }
        .aim-home-link:focus-visible {
          outline: none;
          box-shadow: var(--shadow-focus);
        }

        .aim-home-link-label {
          font-size: 14px;
          font-weight: var(--weight-medium);
          color: var(--color-primary-600);
          flex-shrink: 0;
        }

        .aim-home-link-desc {
          font-size: 13px;
          color: var(--text-muted);
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .aim-home-link-arrow {
          font-size: 14px;
          color: var(--color-neutral-400);
          flex-shrink: 0;
          transition: transform var(--duration-fast) var(--ease-standard);
        }
        .aim-home-link:hover .aim-home-link-arrow {
          transform: translateX(3px);
        }
        [dir="rtl"] .aim-home-link:hover .aim-home-link-arrow {
          transform: translateX(-3px);
        }

        .aim-home-boundary-note {
          margin: 0;
          font-size: 12px;
          color: var(--text-muted);
          text-align: center;
          padding: var(--space-8) 0;
        }

        @media (max-width: 640px) {
          .aim-home-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
