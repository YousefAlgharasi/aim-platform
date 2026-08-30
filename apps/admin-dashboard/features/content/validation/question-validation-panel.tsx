'use client';

import type { AdminQuestionChoice, AdminQuestionDetail, QuestionType } from '../api/admin-question-bank-api';
import { AdminCard, AdminBadge } from '../../../shared/components/Misc';

type Props = {
  readonly question: AdminQuestionDetail;
  readonly hasSkillLinks: boolean;
  readonly choices?: AdminQuestionChoice[];
};

type ValidationIssue = {
  readonly field: string;
  readonly message: string;
  readonly severity: 'error' | 'warning';
};

const CHOICE_REQUIRED_TYPES: QuestionType[] = [
  'multiple_choice',
  'multiple_select',
  'true_false',
  'ordering',
  'matching',
];

function validateChoices(question: AdminQuestionDetail, choices: AdminQuestionChoice[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const typeLabel = question.type.replace(/_/g, ' ');

  if (choices.length === 0) {
    issues.push({
      field: 'Choices',
      message: `${typeLabel} questions require answer choices. Add at least one choice below.`,
      severity: 'error',
    });
    return issues;
  }

  const correctCount = choices.filter((c) => c.isCorrect).length;

  switch (question.type) {
    case 'multiple_choice':
      if (correctCount !== 1) {
        issues.push({
          field: 'Choices',
          message: 'Exactly one choice must be marked correct for multiple choice questions.',
          severity: 'error',
        });
      }
      break;
    case 'multiple_select':
      if (correctCount < 1) {
        issues.push({
          field: 'Choices',
          message: 'At least one choice must be marked correct for multiple select questions.',
          severity: 'error',
        });
      }
      break;
    case 'true_false':
      if (choices.length !== 2 || correctCount !== 1) {
        issues.push({
          field: 'Choices',
          message: 'True/false questions must have exactly two choices, one marked correct.',
          severity: 'error',
        });
      }
      break;
    case 'ordering':
    case 'matching':
      // Correct order/pairings are defined separately from is_correct.
      break;
    default:
      break;
  }

  return issues;
}

function validateQuestion(
  question: AdminQuestionDetail,
  hasSkillLinks: boolean,
  choices: AdminQuestionChoice[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!question.stem.trim()) {
    issues.push({ field: 'Stem', message: 'Question stem is empty.', severity: 'error' });
  }

  if (question.stem.trim().length < 10) {
    issues.push({ field: 'Stem', message: 'Stem is very short — consider adding more detail.', severity: 'warning' });
  }

  if (CHOICE_REQUIRED_TYPES.includes(question.type)) {
    issues.push(...validateChoices(question, choices));
  }

  if (!hasSkillLinks) {
    issues.push({
      field: 'Skills',
      message: 'No skills linked to this question. Link at least one skill for curriculum alignment.',
      severity: 'warning',
    });
  }

  if (!question.explanation) {
    issues.push({
      field: 'Explanation',
      message: 'No explanation provided. Explanations help students learn from mistakes.',
      severity: 'warning',
    });
  }

  if (question.tags.length === 0) {
    issues.push({
      field: 'Tags',
      message: 'No tags set. Tags help filter and organize questions.',
      severity: 'warning',
    });
  }

  return issues;
}

export function QuestionValidationPanel({ question, hasSkillLinks, choices = [] }: Props) {
  const issues = validateQuestion(question, hasSkillLinks, choices);
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  if (issues.length === 0) {
    return (
      <AdminCard title="Validation">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          <AdminBadge variant="success">All checks passed</AdminBadge>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Question is ready for publishing (via backend workflow).
          </span>
        </div>
      </AdminCard>
    );
  }

  return (
    <AdminCard title="Validation">
      <div style={{ display: 'flex', gap: 'var(--space-8)', marginBlockEnd: 'var(--space-12)' }}>
        {errors.length > 0 && (
          <AdminBadge variant="error">{errors.length} error{errors.length !== 1 ? 's' : ''}</AdminBadge>
        )}
        {warnings.length > 0 && (
          <AdminBadge variant="warning">{warnings.length} warning{warnings.length !== 1 ? 's' : ''}</AdminBadge>
        )}
      </div>

      <ul className="aim-validation-list" role="list">
        {issues.map((issue) => (
          <li key={`${issue.field}-${issue.message}`} className={`aim-validation-item aim-validation-item--${issue.severity}`}>
            <span className="aim-validation-field">{issue.field}</span>
            <span className="aim-validation-message">{issue.message}</span>
          </li>
        ))}
      </ul>

      <style>{`
        .aim-validation-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }
        .aim-validation-item {
          display: flex;
          gap: var(--space-8);
          padding: var(--space-8) var(--space-12);
          border-radius: var(--radius-sm);
          font-size: 13px;
          line-height: 18px;
        }
        .aim-validation-item--error {
          background: var(--error-soft);
          color: var(--color-error-700);
        }
        .aim-validation-item--warning {
          background: var(--warning-soft);
          color: var(--color-warning-700);
        }
        .aim-validation-field {
          font-weight: var(--weight-semibold);
          min-width: 80px;
        }
        .aim-validation-message {
          flex: 1;
        }
      `}</style>
    </AdminCard>
  );
}
