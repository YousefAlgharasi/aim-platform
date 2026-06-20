import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionPreview } from '../../app/admin/content/question-bank/[questionId]/question-preview';
import type { AdminQuestionDetail } from '../../lib/api/admin-question-bank-api';

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
    render(<QuestionPreview question={makeQuestion()} />);
    expect(screen.getByText('Preview as Student')).toBeInTheDocument();
  });

  it('opens preview when button clicked', () => {
    render(<QuestionPreview question={makeQuestion()} />);
    fireEvent.click(screen.getByText('Preview as Student'));
    expect(screen.getByText('Student Preview')).toBeInTheDocument();
    expect(screen.getByText('What is the past tense of go?')).toBeInTheDocument();
  });

  it('shows hint in preview', () => {
    render(<QuestionPreview question={makeQuestion()} />);
    fireEvent.click(screen.getByText('Preview as Student'));
    expect(screen.getByText(/think about irregular verbs/i)).toBeInTheDocument();
  });

  it('shows explanation in preview', () => {
    render(<QuestionPreview question={makeQuestion()} />);
    fireEvent.click(screen.getByText('Preview as Student'));
    expect(screen.getByText(/the answer is went/i)).toBeInTheDocument();
  });

  it('shows MCQ choices for multiple_choice type', () => {
    render(<QuestionPreview question={makeQuestion()} />);
    fireEvent.click(screen.getByText('Preview as Student'));
    expect(screen.getByText(/Choice A/)).toBeInTheDocument();
  });

  it('shows True/False for true_false type', () => {
    render(<QuestionPreview question={makeQuestion({ type: 'true_false' })} />);
    fireEvent.click(screen.getByText('Preview as Student'));
    expect(screen.getByText('True')).toBeInTheDocument();
    expect(screen.getByText('False')).toBeInTheDocument();
  });

  it('closes preview when close button clicked', () => {
    render(<QuestionPreview question={makeQuestion()} />);
    fireEvent.click(screen.getByText('Preview as Student'));
    fireEvent.click(screen.getByText('Close Preview'));
    expect(screen.getByText('Preview as Student')).toBeInTheDocument();
  });
});
