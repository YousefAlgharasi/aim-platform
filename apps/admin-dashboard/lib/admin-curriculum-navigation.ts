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
    description: 'Top-level curriculum containers.',
    backendBoundary: 'Course records and status changes must come from backend curriculum APIs.',
  },
  {
    label: 'Levels',
    href: '/admin/content/levels',
    description: 'Course progression bands.',
    backendBoundary: 'Level ordering and course membership must be validated by the backend.',
  },
  {
    label: 'Chapters',
    href: '/admin/content/chapters',
    description: 'Lesson grouping within curriculum structure.',
    backendBoundary: 'Chapter hierarchy belongs to backend-approved curriculum data.',
  },
  {
    label: 'Lessons',
    href: '/admin/content/lessons',
    description: 'Skill-linked lesson records.',
    backendBoundary: 'Published lessons must be validated by backend lesson-skill rules.',
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
