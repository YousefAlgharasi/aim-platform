import { render, screen, fireEvent } from '@testing-library/react';
import { ChaptersList } from '../../app/admin/content/chapters/chapters-list';
import type { AdminChapterSummary } from '../../lib/api/admin-chapters-api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

const NOW = '2026-01-15T12:00:00Z';

const makeChapter = (overrides: Partial<AdminChapterSummary> = {}): AdminChapterSummary => ({
  id: 'chapter-1',
  levelId: 'level-1',
  slug: 'greetings',
  title: 'Greetings',
  description: 'Chapter about greetings',
  status: 'draft',
  sortOrder: 1,
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
});

const defaultProps = {
  chapters: [makeChapter()],
  total: 1,
  page: 1,
  totalPages: 1,
  levelId: 'level-1',
  courseId: 'course-1',
  onCreateChapter: jest.fn().mockResolvedValue({}),
  onUpdateChapter: jest.fn().mockResolvedValue({}),
};

describe('ChaptersList', () => {
  it('renders chapter table with title and status', () => {
    render(<ChaptersList {...defaultProps} />);
    expect(screen.getByText('Greetings')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('shows empty state when no chapters', () => {
    render(<ChaptersList {...defaultProps} chapters={[]} total={0} />);
    expect(screen.getByText(/no chapters yet/i)).toBeInTheDocument();
  });

  it('shows create form when + New Chapter clicked', () => {
    render(<ChaptersList {...defaultProps} />);
    fireEvent.click(screen.getByText('+ New Chapter'));
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it('shows edit form when Edit clicked', () => {
    render(<ChaptersList {...defaultProps} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it('renders published status badge', () => {
    render(
      <ChaptersList
        {...defaultProps}
        chapters={[makeChapter({ status: 'published' })]}
      />,
    );
    const badge = screen.getByText('Published');
    expect(badge.className).toContain('status-published');
  });

  it('pagination links include courseId and levelId', () => {
    render(<ChaptersList {...defaultProps} totalPages={2} page={1} />);
    const nextLink = screen.getByText(/next/i);
    expect(nextLink.getAttribute('href')).toContain('courseId=course-1');
    expect(nextLink.getAttribute('href')).toContain('levelId=level-1');
  });

  it('renders accessible Actions column header', () => {
    render(<ChaptersList {...defaultProps} />);
    expect(document.querySelector('th[aria-label="Actions"]')).toBeInTheDocument();
  });
});
