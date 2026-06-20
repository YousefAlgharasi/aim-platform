import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionForm } from '../../app/admin/content/question-bank/question-form';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

jest.mock('../../lib/api', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
  AdminApiClientError: class extends Error { status = 500; },
}));

const defaultProps = {
  mode: 'create' as const,
  onSubmit: jest.fn().mockResolvedValue({}),
  onCancel: jest.fn(),
};

describe('QuestionForm', () => {
  it('renders create form title', () => {
    render(<QuestionForm {...defaultProps} />);
    expect(screen.getByText('New Question')).toBeInTheDocument();
  });

  it('renders edit form title with initial data', () => {
    render(
      <QuestionForm
        {...defaultProps}
        mode="edit"
        initial={{
          id: 'q-1',
          type: 'true_false',
          stem: 'Is the sky blue?',
          difficulty: 'beginner',
          tags: ['science'],
          status: 'draft',
          createdBy: 'user-1',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        }}
      />,
    );
    expect(screen.getByText('Edit Question')).toBeInTheDocument();
  });

  it('validates empty stem on submit', () => {
    render(<QuestionForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Create Question'));
    expect(screen.getByText(/question stem is required/i)).toBeInTheDocument();
  });

  it('disables type select in edit mode', () => {
    render(
      <QuestionForm
        {...defaultProps}
        mode="edit"
        initial={{
          id: 'q-1',
          type: 'multiple_choice',
          stem: 'Test',
          difficulty: 'beginner',
          tags: [],
          status: 'draft',
          createdBy: 'user-1',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        }}
      />,
    );
    const typeSelect = document.getElementById('q-type') as HTMLSelectElement;
    expect(typeSelect).toBeDisabled();
  });

  it('shows cancel button', () => {
    render(<QuestionForm {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onCancel when Cancel clicked', () => {
    render(<QuestionForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });
});
