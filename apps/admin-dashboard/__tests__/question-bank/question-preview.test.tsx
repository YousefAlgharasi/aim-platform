import { render, screen, fireEvent, renderWithProviders } from '../test-utils';
import { QuestionPreview } from '../../features/content/question-preview';
import type { AdminQuestionDetail } from '../../features/content/admin-question-bank-api';

const makeQuestion = (overrides: Partial<AdminQuestionDetail> = {}): AdminQuestionDetail => ({
  id: 'q-1',
  type: 'multiple_choice',
  stem: 'What is the past tense of go?',
  difficulty: 'beginner',
  tags: ['grammar'],
  status: 'draft',
  createdBy: 'user-1',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  richStem: null,
  explanation: 'The answer is went.',
  hint: 'Think about irregular verbs.',
  ...overrides,
});

describe('QuestionPreview', () => {
  it('shows preview button initially', () => {
    renderWithProviders(<QuestionPreview question={makeQuestion()} />);
    expect(screen.getByText('Preview as Student')).toBeInTheDocument();
  });

  it('opens preview when button clicked', () => {
    renderWithProviders(<QuestionPreview question={makeQuestion()} />);
    fireEvent.click(screen.getByText('Preview as Student'));
    expect(screen.getByText('Student Preview')).toBeInTheDocument();
    expect(screen.getByText('What is the past tense of go?')).toBeInTheDocument();
  });

  it('shows hint in preview', () => {
    renderWithProviders(<QuestionPreview question={makeQuestion()} />);
    fireEvent.click(screen.getByText('Preview as Student'));
    expect(screen.getByText(/think about irregular verbs/i)).toBeInTheDocument();
  });

  it('shows explanation in preview', () => {
    renderWithProviders(<QuestionPreview question={makeQuestion()} />);
    fireEvent.click(screen.getByText('Preview as Student'));
    expect(screen.getByText(/the answer is went/i)).toBeInTheDocument();
  });

  it('shows MCQ choices for multiple_choice type', () => {
    renderWithProviders(<QuestionPreview question={makeQuestion()} />);
    fireEvent.click(screen.getByText('Preview as Student'));
    expect(screen.getByText(/Choice A/)).toBeInTheDocument();
  });

  it('shows True/False for true_false type', () => {
    renderWithProviders(<QuestionPreview question={makeQuestion({ type: 'true_false' })} />);
    fireEvent.click(screen.getByText('Preview as Student'));
    expect(screen.getByText('True')).toBeInTheDocument();
    expect(screen.getByText('False')).toBeInTheDocument();
  });

  it('closes preview when close button clicked', () => {
    renderWithProviders(<QuestionPreview question={makeQuestion()} />);
    fireEvent.click(screen.getByText('Preview as Student'));
    fireEvent.click(screen.getByText('Close Preview'));
    expect(screen.getByText('Preview as Student')).toBeInTheDocument();
  });
});
