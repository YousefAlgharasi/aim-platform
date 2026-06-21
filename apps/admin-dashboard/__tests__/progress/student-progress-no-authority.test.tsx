import { render, screen } from '@testing-library/react';
import { StudentProgressClient } from '../../app/admin/students/[studentId]/progress/student-progress-client';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }),
}));

jest.mock('../../lib/api', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
  AdminApiClientError: class extends Error { status = 500; },
}));

const defaultProps = {
  studentId: 'st-1',
  completedLessons: 8,
  totalLessons: 20,
  completionPct: 40,
  lastActiveAt: '2026-01-15T10:00:00Z',
  lessons: [
    { lessonId: 'l-1', lessonTitle: 'Past Simple Basics', completed: true, completedAt: '2026-01-10T00:00:00Z' },
    { lessonId: 'l-2', lessonTitle: 'Present Perfect', completed: false, completedAt: null },
  ],
  totalLessonRecords: 2,
  page: 1,
  totalPages: 1,
};

describe('StudentProgressClient — no authority', () => {
  it('displays completion percentage from backend without recalculating', () => {
    render(<StudentProgressClient {...defaultProps} />);
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('displays lesson counts from backend', () => {
    render(<StudentProgressClient {...defaultProps} />);
    expect(screen.getByText('8 / 20 lessons')).toBeInTheDocument();
  });

  it('displays completion status from backend', () => {
    render(<StudentProgressClient {...defaultProps} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('In progress')).toBeInTheDocument();
  });

  it('does not contain mutation buttons for progress', () => {
    render(<StudentProgressClient {...defaultProps} />);
    expect(screen.queryByText(/delete/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/reset/i)).not.toBeInTheDocument();
  });

  it('shows empty state for no lessons', () => {
    render(<StudentProgressClient {...defaultProps} lessons={[]} totalLessonRecords={0} />);
    expect(screen.getByText(/no lesson records/i)).toBeInTheDocument();
  });
});
