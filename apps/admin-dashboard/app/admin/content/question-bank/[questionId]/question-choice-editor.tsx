'use client';

import type { QuestionType } from '../../../../../lib/api/admin-question-bank-api';
import { AdminCard, AdminBadge } from '../../../../../components/common';

type Props = {
  readonly questionType: QuestionType;
  readonly questionId: string;
};

const CHOICE_GUIDANCE: Record<QuestionType, { label: string; description: string }> = {
  multiple_choice: {
    label: 'Multiple Choice',
    description: 'One correct answer from multiple options. Backend manages choices and correctness.',
  },
  multiple_select: {
    label: 'Multiple Select',
    description: 'Multiple correct answers. Backend manages choices and correctness.',
  },
  true_false: {
    label: 'True / False',
    description: 'Two choices: True and False. Backend manages the correct answer.',
  },
  fill_in_the_blank: {
    label: 'Fill in the Blank',
    description: 'Student fills in missing text. Backend validates accepted answers.',
  },
  short_answer: {
    label: 'Short Answer',
    description: 'Free-text response. Backend validates against accepted answers.',
  },
  ordering: {
    label: 'Ordering',
    description: 'Student arranges items in correct order. Backend manages the correct sequence.',
  },
  matching: {
    label: 'Matching',
    description: 'Student matches pairs. Backend manages correct pairings.',
  },
};

export function QuestionChoiceEditor({ questionType, questionId: _questionId }: Props) {
  const guidance = CHOICE_GUIDANCE[questionType];

  return (
    <AdminCard title="Answer Choices">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', marginBlockEnd: 'var(--space-12)' }}>
        <AdminBadge variant="neutral">{guidance.label}</AdminBadge>
      </div>

      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
        {guidance.description}
      </p>

      <div className="admin-boundary-note" style={{ marginBlockStart: 'var(--space-16)' }}>
        <strong>Pending backend support:</strong> Choice management APIs are not yet
        available. Once the backend exposes choice CRUD endpoints, this section will
        allow adding, editing, reordering, and marking correct choices directly.
        Answer correctness is always determined by the backend.
      </div>
    </AdminCard>
  );
}
