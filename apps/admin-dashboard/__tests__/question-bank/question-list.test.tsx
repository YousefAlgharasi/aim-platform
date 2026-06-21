import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionList } from '../../app/admin/content/question-bank/question-list';
import type { AdminQuestionSummary } from '../../lib/api/admin-question-bank-api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }),
}));

jest.mock('../../lib/api', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
  AdminApiClientError: class extends Error { status = 500; },
}));

const NOW = '2026-01-15T12:00:00Z';

const makeQuestion = (overrides: Partial<AdminQuestionSummary> = {}): AdminQuestionSummary => ({
  id: 'q-1',
  type: 'multiple_choice',
  stem: 'What is the past tense of "go"?',
  difficulty: 'beginner',
  tags: ['grammar', 'past_tense'],
  status: 'draft',
  createdBy: 'user-1',
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
});

const defaultProps = {
  questions: [makeQuestion()],
  total: 1,
  page: 1,
  totalPages: 1,
  filterType: '',
  filterDifficulty: '',
  filterStatus: '',
  onCreateQuestion: jest.fn().mockResolvedValue({}),
  onUpdateQuestion: jest.fn().mockResolvedValue({}),
};

describe('QuestionList', () => {
  it('renders question stem as a link', () => {
    render(<QuestionList {...defaultProps} />);
    const link = screen.getByText('What is the past tense of "go"?');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/admin/content/question-bank/q-1');
  });

  it('renders type badge', () => {
    render(<QuestionList {...defaultProps} />);
    expect(screen.getAllByText('MCQ').length).toBeGreaterThan(0);
  });

  it('renders difficulty badge', () => {
    render(<QuestionList {...defaultProps} />);
    expect(screen.getAllByText('beginner').length).toBeGreaterThan(0);
  });

  it('renders tags', () => {
    render(<QuestionList {...defaultProps} />);
    expect(screen.getAllByText('grammar').length).toBeGreaterThan(0);
    expect(screen.getAllByText('past_tense').length).toBeGreaterThan(0);
  });

  it('renders status badge', () => {
    render(<QuestionList {...defaultProps} />);
    expect(screen.getAllByText('Draft').length).toBeGreaterThan(0);
  });

  it('shows empty state when no questions', () => {
    render(<QuestionList {...defaultProps} questions={[]} total={0} />);
    expect(screen.getByText(/no questions/i)).toBeInTheDocument();
  });

  it('opens create form when + New Question clicked', () => {
    render(<QuestionList {...defaultProps} />);
    fireEvent.click(screen.getByText('+ New Question'));
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it('disables edit button for archived questions', () => {
    render(<QuestionList {...defaultProps} questions={[makeQuestion({ status: 'archived' })]} />);
    const editBtn = screen.getByText('Edit');
    expect(editBtn).toBeDisabled();
  });

  it('renders filter dropdowns', () => {
    render(<QuestionList {...defaultProps} />);
    expect(screen.getByLabelText('Filter by type')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by difficulty')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
  });

  it('truncates long stems', () => {
    const longStem = 'A'.repeat(100);
    render(<QuestionList {...defaultProps} questions={[makeQuestion({ stem: longStem })]} />);
    const link = screen.getByText(`${'A'.repeat(80)}…`);
    expect(link).toBeInTheDocument();
  });
});
