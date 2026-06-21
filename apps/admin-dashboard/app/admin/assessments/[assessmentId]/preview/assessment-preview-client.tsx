'use client';

import { AdminCard } from '../../../../../components/common';
import { AdminBadge } from '../../../../../components/common';

type PreviewQuestion = {
  readonly id: string;
  readonly stem: string;
  readonly type: string;
  readonly difficulty: string;
  readonly hint: string | null;
};

type Props = {
  readonly assessmentTitle: string;
  readonly assessmentType: string;
  readonly timeLimitMinutes: number | null;
  readonly passMark: number | null;
  readonly questions: readonly PreviewQuestion[];
};

function formatType(type: string): string {
  return type.replace(/_/g, ' ');
}

export function AssessmentPreviewClient({
  assessmentTitle,
  assessmentType,
  timeLimitMinutes,
  passMark,
  questions,
}: Props) {
  return (
    <div className="aim-preview-container">
      {/* admin-boundary-note */}
      {/* Assessment header as student would see */}
      <AdminCard title={assessmentTitle} description={`${formatType(assessmentType)} · ${questions.length} questions`}>
        <div className="aim-preview-meta">
          {timeLimitMinutes && (
            <AdminBadge variant="info">{timeLimitMinutes} min</AdminBadge>
          )}
          {passMark != null && (
            <AdminBadge variant="neutral">Pass mark: {passMark}%</AdminBadge>
          )}
        </div>
      </AdminCard>

      {questions.length === 0 && (
        <p className="courses-empty">No questions attached to this assessment.</p>
      )}

      {questions.map((q, index) => (
        <AdminCard key={q.id} title={`Question ${index + 1}`}>
          <div className="aim-preview-question">
            <p className="aim-preview-stem">{q.stem}</p>
            <div className="aim-preview-question-meta">
              <AdminBadge variant="default">{formatType(q.type)}</AdminBadge>
              <AdminBadge variant="neutral">{formatType(q.difficulty)}</AdminBadge>
            </div>
            {q.hint && (
              <details className="aim-preview-hint">
                <summary>Show hint</summary>
                <p>{q.hint}</p>
              </details>
            )}
            <div className="aim-preview-answer-placeholder" aria-label="Answer area placeholder">
              <span className="aim-preview-answer-text">
                Student answer area — answers hidden in admin preview
              </span>
            </div>
          </div>
        </AdminCard>
      ))}

      <style>{`
        .aim-preview-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
        }
        .aim-preview-meta {
          display: flex;
          gap: var(--space-8);
          flex-wrap: wrap;
        }
        .aim-preview-question {
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
        }
        .aim-preview-stem {
          margin: 0;
          font-size: 15px;
          line-height: 22px;
          color: var(--text-primary);
        }
        .aim-preview-question-meta {
          display: flex;
          gap: var(--space-8);
        }
        .aim-preview-hint {
          font-size: 13px;
          color: var(--text-secondary);
          cursor: pointer;
        }
        .aim-preview-hint summary {
          font-weight: var(--weight-semibold);
        }
        .aim-preview-hint p {
          margin: var(--space-4) 0 0;
        }
        .aim-preview-answer-placeholder {
          padding: var(--space-16);
          border: 2px dashed var(--border);
          border-radius: var(--radius-md);
          text-align: center;
          background: var(--surface-sunken);
        }
        .aim-preview-answer-text {
          font-size: 13px;
          color: var(--text-muted);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
