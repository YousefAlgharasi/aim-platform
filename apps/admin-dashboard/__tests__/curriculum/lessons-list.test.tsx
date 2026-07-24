import { render, screen, fireEvent, renderWithProviders } from '../test-utils';
import { LessonsList } from '../../features/content/lessons-list';
import type { AdminLessonSummary } from '../../features/content/admin-lessons-api';

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
  systemPrompt: null,
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
    renderWithProviders(<LessonsList {...defaultProps} />);
    expect(screen.getByText('Hello World Lesson')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('shows empty state when no lessons', () => {
    renderWithProviders(<LessonsList {...defaultProps} lessons={[]} total={0} />);
    expect(screen.getByText(/no lessons yet/i)).toBeInTheDocument();
  });

  it('shows create form when + New Lesson clicked', () => {
    renderWithProviders(<LessonsList {...defaultProps} />);
    fireEvent.click(screen.getByText('+ New Lesson'));
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it('shows skill link badge for draft lesson', () => {
    renderWithProviders(<LessonsList {...defaultProps} />);
    expect(screen.getByText(/link skills/i)).toBeInTheDocument();
  });

  it('shows linked badge for published lesson', () => {
    renderWithProviders(
      <LessonsList
        {...defaultProps}
        lessons={[makeLesson({ status: 'published' })]}
      />,
    );
    expect(screen.getByText(/linked/i)).toBeInTheDocument();
  });

  it('shows dash for archived lesson skill cell', () => {
    renderWithProviders(
      <LessonsList
        {...defaultProps}
        lessons={[makeLesson({ status: 'archived' })]}
      />,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders accessible Actions column', () => {
    renderWithProviders(<LessonsList {...defaultProps} />);
    expect(document.querySelector('th[aria-label="Actions"]')).toBeInTheDocument();
  });
});
