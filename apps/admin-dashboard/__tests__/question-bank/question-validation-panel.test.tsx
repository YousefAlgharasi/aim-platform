import { render, screen } from '@testing-library/react';
import { QuestionValidationPanel } from '../../app/admin/content/question-bank/[questionId]/question-validation-panel';
import type { AdminQuestionDetail } from '../../lib/api/admin-question-bank-api';

const makeQuestion = (overrides: Partial<AdminQuestionDetail> = {}): AdminQuestionDetail => ({
  id: 'q-1',
  type: 'multiple_choice',
  stem: 'What is the correct answer?',
  difficulty: 'beginner',
  tags: ['grammar'],
  status: 'draft',
  createdBy: 'user-1',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  richStem: null,
  explanation: 'Because it is correct.',
  hint: 'Think carefully.',
  ...overrides,
});

describe('QuestionValidationPanel', () => {
  it('shows warning for missing skill links', () => {
    render(<QuestionValidationPanel question={makeQuestion()} hasSkillLinks={false} />);
    expect(screen.getByText(/no skills linked/i)).toBeInTheDocument();
  });

  it('shows warning for missing explanation', () => {
    render(<QuestionValidationPanel question={makeQuestion({ explanation: null })} hasSkillLinks={true} />);
    expect(screen.getByText(/no explanation/i)).toBeInTheDocument();
  });

  it('shows warning for missing tags', () => {
    render(<QuestionValidationPanel question={makeQuestion({ tags: [] })} hasSkillLinks={true} />);
    expect(screen.getByText(/no tags/i)).toBeInTheDocument();
  });

  it('shows warning for choice-required types', () => {
    render(<QuestionValidationPanel question={makeQuestion()} hasSkillLinks={true} />);
    expect(screen.getByText(/require answer choices/i)).toBeInTheDocument();
  });

  it('shows error for empty stem', () => {
    render(<QuestionValidationPanel question={makeQuestion({ stem: '' })} hasSkillLinks={true} />);
    expect(screen.getByText(/stem is empty/i)).toBeInTheDocument();
  });

  it('shows warning count badges', () => {
    render(<QuestionValidationPanel question={makeQuestion()} hasSkillLinks={false} />);
    const warningBadges = screen.getAllByText(/warning/i);
    expect(warningBadges.length).toBeGreaterThan(0);
  });
});
