export type AdminCurriculumNavigationItem = {
  readonly label: string;
  readonly href: string;
  readonly description: string;
  readonly backendBoundary: string;
};

export const adminCurriculumNavigationItems: readonly AdminCurriculumNavigationItem[] = [
  {
    label: 'Courses',
    href: '/admin/content/courses',
    description: 'Courses and their full Levels → Chapters → Lessons curriculum tree.',
    backendBoundary: 'Course, level, chapter, and lesson records and status changes must come from backend curriculum APIs.',
  },
  {
    label: 'Skills',
    href: '/admin/content/skills',
    description: 'Stable skill keys and taxonomy entries.',
    backendBoundary: 'Skill keys are backend-owned identifiers, not display labels.',
  },
  {
    label: 'Objectives',
    href: '/admin/content/objectives',
    description: 'Learning goals attached to curriculum content.',
    backendBoundary: 'Objectives describe learning outcomes only; they do not calculate AIM signals.',
  },
  {
    label: 'Assets',
    href: '/admin/content/assets',
    description: 'Lesson asset metadata references.',
    backendBoundary: 'Asset metadata may be rendered here, but storage secrets stay server-side.',
  },
  {
    label: 'Question Bank',
    href: '/admin/content/question-bank',
    description: 'Reusable content questions.',
    backendBoundary: 'Question skill links must be enforced by backend content APIs.',
  },
];
