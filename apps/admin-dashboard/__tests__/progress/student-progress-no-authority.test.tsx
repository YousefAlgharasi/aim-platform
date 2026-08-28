import { screen, renderWithProviders } from '../test-utils';
import { StudentProgressClient } from '../../features/students';
import type { AdminStudentProfile } from '../../core/api/admin-student-profile-api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }),
}));

jest.mock('../../core/api', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
  AdminApiClientError: class extends Error { status = 500; },
}));

const baseProfile: AdminStudentProfile = {
  student: {
    id: 'st-1',
    email: 'student@example.com',
    displayName: 'Jane Student',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  placement: {
    estimatedLevel: 'intermediate',
    completedAt: '2026-01-05T00:00:00Z',
    skillSummary: [{ skillCode: 'grammar', signal: 'strong' }],
    scorePercent: 85,
    recommendedCourseId: 'course-1',
    recommendedCourseTitle: 'English Foundations',
  },
  subscription: {
    planId: 'pro-monthly',
    planName: 'Pro Monthly',
    status: 'active',
    currentPeriodEnd: '2026-03-01T00:00:00Z',
  },
  courses: [
    {
      enrollmentId: 'enr-1',
      courseId: 'course-1',
      courseTitle: 'English Foundations',
      enrollmentStatus: 'active',
      enrolledAt: '2026-01-02T00:00:00Z',
      completedLessons: 8,
      totalLessons: 20,
      completionPct: 40,
      completed: false,
      assessments: [],
      overallScorePercent: null,
      certificate: null,
    },
    {
      enrollmentId: 'enr-2',
      courseId: 'course-2',
      courseTitle: 'Advanced Grammar',
      enrollmentStatus: 'switched',
      enrolledAt: '2025-12-01T00:00:00Z',
      completedLessons: 10,
      totalLessons: 10,
      completionPct: 100,
      completed: true,
      assessments: [
        { assessmentId: 'a-1', title: 'Midterm Quiz', type: 'quiz', score: 8, maxScore: 10, scorePercent: 80, passed: true },
      ],
      overallScorePercent: 80,
      certificate: { id: 'cert-1', issuedAt: '2026-01-20T00:00:00Z' },
    },
  ],
  weaknesses: [],
  aiTeacherSessions: [],
  assessmentResults: [],
};

describe('StudentProgressClient — no authority', () => {
  it('displays completion percentage from backend without recalculating', () => {
    renderWithProviders(<StudentProgressClient profile={baseProfile} />);
    expect(screen.getByText('8 / 20 (40%)')).toBeInTheDocument();
  });

  it('displays completion status badges from backend', () => {
    renderWithProviders(<StudentProgressClient profile={baseProfile} />);
    expect(screen.getByText('Completed ✓')).toBeInTheDocument();
  });

  it('does not contain mutation buttons for progress', () => {
    renderWithProviders(<StudentProgressClient profile={baseProfile} />);
    expect(screen.queryByText(/delete/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/reset/i)).not.toBeInTheDocument();
  });

  it('shows empty state for no courses', () => {
    renderWithProviders(<StudentProgressClient profile={{ ...baseProfile, courses: [] }} />);
    expect(screen.getByText(/no course enrollments/i)).toBeInTheDocument();
  });

  it('shows empty state for no placement result', () => {
    renderWithProviders(<StudentProgressClient profile={{ ...baseProfile, placement: null }} />);
    expect(screen.getByText(/no placement result yet/i)).toBeInTheDocument();
  });

  it('shows empty state for no weaknesses', () => {
    renderWithProviders(<StudentProgressClient profile={baseProfile} />);
    expect(screen.getByText(/no weaknesses currently tracked/i)).toBeInTheDocument();
  });
});
