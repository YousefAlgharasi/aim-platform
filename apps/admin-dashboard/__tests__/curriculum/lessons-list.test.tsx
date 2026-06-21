import { render, screen, fireEvent } from '@testing-library/react';
import { LessonsList } from '../../app/admin/content/lessons/lessons-list';
import type { AdminLessonSummary } from '../../lib/api/admin-lessons-api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

const NOW = '2026-01-15T12:00:00Z';

const makeLesson = (overrides: Partial<AdminLessonSummary> = {}): AdminLessonSummary => ({
  id: 'lesson-1',
  chapterId: 'chapter-1',
  title: 'Hello World Lesson',
  description: 'First lesson',
  status: 'draft',
  sortOrder: 1,
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
});

const defaultProps = {
  lessons: [makeLesson()],
  total: 1,
  page: 1,
  totalPages: 1,
  courseId: 'course-1',
  levelId: 'level-1',
  chapterId: 'chapter-1',
  onCreateLesson: jest.fn().mockResolvedValue({}),
  onUpdateLesson: jest.fn().mockResolvedValue({}),
};

describe('LessonsList', () => {
  it('renders lesson table with title and status', () => {
    render(<LessonsList {...defaultProps} />);
    expect(screen.getByText('Hello World Lesson')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('shows empty state when no lessons', () => {
    render(<LessonsList {...defaultProps} lessons={[]} total={0} />);
    expect(screen.getByText(/no lessons yet/i)).toBeInTheDocument();
  });

  it('shows create form when + New Lesson clicked', () => {
    render(<LessonsList {...defaultProps} />);
    fireEvent.click(screen.getByText('+ New Lesson'));
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it('shows skill link badge for draft lesson', () => {
    render(<LessonsList {...defaultProps} />);
    expect(screen.getByText(/link skills/i)).toBeInTheDocument();
  });

  it('shows linked badge for published lesson', () => {
    render(
      <LessonsList
        {...defaultProps}
        lessons={[makeLesson({ status: 'published' })]}
      />,
    );
    expect(screen.getByText(/linked/i)).toBeInTheDocument();
  });

  it('shows dash for archived lesson skill cell', () => {
    render(
      <LessonsList
        {...defaultProps}
        lessons={[makeLesson({ status: 'archived' })]}
      />,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders accessible Actions column', () => {
    render(<LessonsList {...defaultProps} />);
    expect(document.querySelector('th[aria-label="Actions"]')).toBeInTheDocument();
  });
});
