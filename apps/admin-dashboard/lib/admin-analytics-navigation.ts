export type AdminAnalyticsNavigationItem = {
  readonly label: string;
  readonly href: string;
  readonly description: string;
  readonly backendBoundary: string;
};

export const adminAnalyticsNavigationItems: readonly AdminAnalyticsNavigationItem[] = [
  {
    label: 'Platform Overview',
    href: '/admin/analytics/overview',
    description: 'Backend-resolved platform-wide dashboard widgets.',
    backendBoundary: 'Dashboard widgets are resolved entirely by DashboardService.',
  },
  {
    label: 'Learning Reports',
    href: '/admin/analytics/reports/learning',
    description: 'Skills, progress, retention, and engagement reports.',
    backendBoundary: 'Report output is assembled by ReportRunnerService only.',
  },
  {
    label: 'Curriculum Reports',
    href: '/admin/analytics/reports/curriculum',
    description: 'Curriculum coverage and content usage reports.',
    backendBoundary: 'Report output is assembled by ReportRunnerService only.',
  },
  {
    label: 'Assessment Reports',
    href: '/admin/analytics/reports/assessment',
    description: 'Quizzes, exams, attempts, deadlines, and results.',
    backendBoundary: 'Report output is assembled by ReportRunnerService only.',
  },
  {
    label: 'Notification Reports',
    href: '/admin/analytics/reports/notifications',
    description: 'Notification delivery and engagement reports.',
    backendBoundary: 'Report output is assembled by ReportRunnerService only.',
  },
  {
    label: 'Revenue Reports',
    href: '/admin/analytics/reports/revenue',
    description: 'Revenue reports from safe billing aggregates.',
    backendBoundary: 'Report output never reads raw payment payloads.',
  },
  {
    label: 'User Reports',
    href: '/admin/analytics/reports/users',
    description: 'User growth, activation, and role distribution reports.',
    backendBoundary: 'Report output is assembled by ReportRunnerService only.',
  },
  {
    label: 'Exports',
    href: '/admin/analytics/exports',
    description: 'Request and track exports of completed report runs.',
    backendBoundary: 'Export scope and ownership are enforced by AnalyticsExportService.',
  },
];
