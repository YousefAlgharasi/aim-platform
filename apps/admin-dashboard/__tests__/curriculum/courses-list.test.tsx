import { render, screen, fireEvent } from '@testing-library/react';
import { CoursesList } from '../../app/admin/content/courses/courses-list';
import type { AdminCourseSummary } from '../../lib/api/admin-courses-api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

const NOW = '2026-01-15T12:00:00Z';

const makeCourse = (overrides: Partial<AdminCourseSummary> = {}): AdminCourseSummary => ({
  id: 'course-1',
  slug: 'english-101',
  title: 'English 101',
  description: 'Intro course',
  status: 'draft',
  sortOrder: 1,
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
});

const defaultProps = {
  courses: [makeCourse()],
  total: 1,
  page: 1,
  totalPages: 1,
  onCreateCourse: jest.fn().mockResolvedValue({}),
  onUpdateCourse: jest.fn().mockResolvedValue({}),
};

describe('CoursesList', () => {
  it('renders course table with title, slug, status', () => {
    render(<CoursesList {...defaultProps} />);
    expect(screen.getByText('English 101')).toBeInTheDocument();
    expect(screen.getByText('english-101')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('shows empty state when no courses', () => {
    render(<CoursesList {...defaultProps} courses={[]} total={0} />);
    expect(screen.getByText(/no courses yet/i)).toBeInTheDocument();
  });

  it('shows create form when + New Course clicked', () => {
    render(<CoursesList {...defaultProps} />);
    fireEvent.click(screen.getByText('+ New Course'));
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it('shows edit form when Edit clicked', () => {
    render(<CoursesList {...defaultProps} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it('renders status badge with correct class', () => {
    render(
      <CoursesList
        {...defaultProps}
        courses={[makeCourse({ status: 'published' })]}
      />,
    );
    const badge = screen.getByText('Published');
    expect(badge.className).toContain('status-published');
  });

  it('shows pagination when multiple pages', () => {
    render(<CoursesList {...defaultProps} totalPages={3} page={2} />);
    expect(screen.getByText(/page 2 of 3/i)).toBeInTheDocument();
    expect(screen.getByText(/previous/i)).toBeInTheDocument();
    expect(screen.getByText(/next/i)).toBeInTheDocument();
  });

  it('hides pagination when single page', () => {
    render(<CoursesList {...defaultProps} totalPages={1} page={1} />);
    expect(screen.queryByText(/page 1 of 1/i)).not.toBeInTheDocument();
  });

  it('displays dash for null slug', () => {
    render(
      <CoursesList {...defaultProps} courses={[makeCourse({ slug: null })]} />,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('displays course description when present', () => {
    render(<CoursesList {...defaultProps} />);
    expect(screen.getByText('Intro course')).toBeInTheDocument();
  });

  it('renders table with accessible Actions column', () => {
    render(<CoursesList {...defaultProps} />);
    const actionsHeader = document.querySelector('th[aria-label="Actions"]');
    expect(actionsHeader).toBeInTheDocument();
  });
});
