'use client';

import { useState } from 'react';
import type { AdminQuestionDetail, QuestionType } from '../../../../../lib/api/admin-question-bank-api';
import { AdminCard, AdminButton, AdminBadge } from '../../../../../components/common';

type Props = {
  readonly question: AdminQuestionDetail;
};

function PreviewPlaceholder({ type }: { type: QuestionType }) {
  switch (type) {
    case 'multiple_choice':
      return (
        <div className="aim-preview-choices">
          <div className="aim-preview-choice"><span className="aim-preview-radio" /> Choice A (placeholder)</div>
          <div className="aim-preview-choice"><span className="aim-preview-radio" /> Choice B (placeholder)</div>
          <div className="aim-preview-choice"><span className="aim-preview-radio" /> Choice C (placeholder)</div>
          <div className="aim-preview-choice"><span className="aim-preview-radio" /> Choice D (placeholder)</div>
        </div>
      );
    case 'multiple_select':
      return (
        <div className="aim-preview-choices">
          <div className="aim-preview-choice"><span className="aim-preview-checkbox" /> Option 1 (placeholder)</div>
          <div className="aim-preview-choice"><span className="aim-preview-checkbox" /> Option 2 (placeholder)</div>
          <div className="aim-preview-choice"><span className="aim-preview-checkbox" /> Option 3 (placeholder)</div>
        </div>
      );
    case 'true_false':
      return (
        <div className="aim-preview-choices">
          <div className="aim-preview-choice"><span className="aim-preview-radio" /> True</div>
          <div className="aim-preview-choice"><span className="aim-preview-radio" /> False</div>
        </div>
      );
    case 'fill_in_the_blank':
      return <div className="aim-preview-input-placeholder">Student types answer here…</div>;
    case 'short_answer':
      return <div className="aim-preview-textarea-placeholder">Student writes short answer here…</div>;
    case 'ordering':
      return (
        <div className="aim-preview-choices">
          <div className="aim-preview-drag-item">1. Item (drag to reorder)</div>
          <div className="aim-preview-drag-item">2. Item (drag to reorder)</div>
          <div className="aim-preview-drag-item">3. Item (drag to reorder)</div>
        </div>
      );
    case 'matching':
      return (
        <div className="aim-preview-matching">
          <div className="aim-preview-match-col">
            <div className="aim-preview-match-item">Left A</div>
            <div className="aim-preview-match-item">Left B</div>
          </div>
          <div className="aim-preview-match-col">
            <div className="aim-preview-match-item">Right 1</div>
            <div className="aim-preview-match-item">Right 2</div>
          </div>
        </div>
      );
  }
}

export function QuestionPreview({ question }: Props) {
  const [showPreview, setShowPreview] = useState(false);

  if (!showPreview) {
    return (
      <AdminButton variant="secondary" onClick={() => setShowPreview(true)}>
        Preview as Student
      </AdminButton>
    );
  }

  return (
    <AdminCard title="Student Preview">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBlockEnd: 'var(--space-12)' }}>
        <AdminBadge variant="info">Preview Mode</AdminBadge>
        <AdminButton variant="secondary" size="sm" onClick={() => setShowPreview(false)}>
          Close Preview
        </AdminButton>
      </div>

      <div className="aim-preview-container">
        <div className="aim-preview-difficulty">
          <AdminBadge variant="neutral">{question.difficulty.replace('_', ' ')}</AdminBadge>
        </div>

        <div className="aim-preview-stem">
          {question.stem}
        </div>

        <PreviewPlaceholder type={question.type} />

        {question.hint && (
          <div className="aim-preview-hint">
            <strong>Hint:</strong> {question.hint}
          </div>
        )}

        {question.explanation && (
          <div className="aim-preview-explanation">
            <strong>Explanation (shown after answering):</strong> {question.explanation}
          </div>
        )}
      </div>

      <div className="admin-boundary-note" style={{ marginBlockStart: 'var(--space-12)' }}>
        <strong>Note:</strong> This is an approximate preview. Actual student
        experience is rendered by the Flutter app using backend-delivered question data.
        Choice content will appear once backend choice APIs are available.
      </div>

      <style>{`
        .aim-preview-container {
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: var(--space-20);
          background: var(--surface);
        }
        .aim-preview-difficulty {
          margin-block-end: var(--space-12);
        }
        .aim-preview-stem {
          font-size: 16px;
          font-weight: var(--weight-semibold);
          line-height: 24px;
          margin-block-end: var(--space-16);
          color: var(--text-primary);
        }
        .aim-preview-choices {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }
        .aim-preview-choice {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          padding: var(--space-12);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 14px;
          cursor: default;
        }
        .aim-preview-radio {
          width: 16px;
          height: 16px;
          border: 2px solid var(--border-strong);
          border-radius: 50%;
          flex-shrink: 0;
        }
        .aim-preview-checkbox {
          width: 16px;
          height: 16px;
          border: 2px solid var(--border-strong);
          border-radius: 3px;
          flex-shrink: 0;
        }
        .aim-preview-input-placeholder,
        .aim-preview-textarea-placeholder {
          padding: var(--space-12);
          border: 1px dashed var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          font-size: 14px;
          font-style: italic;
        }
        .aim-preview-textarea-placeholder {
          min-height: 80px;
        }
        .aim-preview-drag-item {
          padding: var(--space-8) var(--space-12);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 14px;
          margin-block-end: var(--space-4);
          background: var(--surface-sunken);
        }
        .aim-preview-matching {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-16);
        }
        .aim-preview-match-col {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }
        .aim-preview-match-item {
          padding: var(--space-8) var(--space-12);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 14px;
          text-align: center;
        }
        .aim-preview-hint {
          margin-block-start: var(--space-16);
          padding: var(--space-12);
          border-radius: var(--radius-sm);
          background: var(--info-soft);
          color: var(--color-info-700);
          font-size: 13px;
        }
        .aim-preview-explanation {
          margin-block-start: var(--space-8);
          padding: var(--space-12);
          border-radius: var(--radius-sm);
          background: var(--success-soft);
          color: var(--color-success-700);
          font-size: 13px;
        }
      `}</style>
    </AdminCard>
  );
}
