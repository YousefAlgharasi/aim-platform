'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  QUESTION_DIFFICULTIES,
  type AdminQuestionDetail,
  type QuestionDifficulty,
} from '../../../../../lib/api/admin-question-bank-api';
import {
  AdminButton,
  AdminCard,
  AdminFormField,
  AdminInput,
  AdminTextarea,
  AdminSelect,
  AdminStatusBadge,
  AdminBadge,
} from '../../../../../components/common';
import { QuestionChoiceEditor } from './question-choice-editor';
import { QuestionValidationPanel } from './question-validation-panel';

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Multiple Choice',
  multiple_select: 'Multiple Select',
  true_false: 'True / False',
  fill_in_the_blank: 'Fill in the Blank',
  short_answer: 'Short Answer',
  ordering: 'Ordering',
  matching: 'Matching',
};

const DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  beginner: 'Beginner',
  elementary: 'Elementary',
  intermediate: 'Intermediate',
  upper_intermediate: 'Upper Intermediate',
  advanced: 'Advanced',
};

type Props = {
  readonly question: AdminQuestionDetail;
  readonly onUpdate: (data: {
    stem: string;
    difficulty: QuestionDifficulty;
    explanation: string | null;
    hint: string | null;
    tags: string[];
  }) => Promise<{ error?: string }>;
};

export function QuestionEditorClient({ question, onUpdate }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [stem, setStem] = useState(question.stem);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>(question.difficulty);
  const [explanation, setExplanation] = useState(question.explanation ?? '');
  const [hint, setHint] = useState(question.hint ?? '');
  const [tagsInput, setTagsInput] = useState(question.tags.join(', '));
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function parseTags(raw: string): string[] {
    return raw.split(',').map((t) => t.trim()).filter(Boolean);
  }

  function handleSubmit() {
    const errors: Record<string, string> = {};
    if (!stem.trim()) errors.stem = 'Question stem is required.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setError(null);
    startTransition(async () => {
      const result = await onUpdate({
        stem: stem.trim(),
        difficulty,
        explanation: explanation.trim() || null,
        hint: hint.trim() || null,
        tags: parseTags(tagsInput),
      });
      if (result.error) {
        setError(result.error);
      } else {
        setEditing(false);
        router.refresh();
      }
    });
  }

  function handleCancel() {
    setStem(question.stem);
    setDifficulty(question.difficulty);
    setExplanation(question.explanation ?? '');
    setHint(question.hint ?? '');
    setTagsInput(question.tags.join(', '));
    setFieldErrors({});
    setError(null);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <AdminCard title="Question Details">
          <dl className="aim-detail-grid">
            <div className="aim-detail-row">
              <dt>Type</dt>
              <dd><AdminBadge variant="neutral">{TYPE_LABELS[question.type] ?? question.type}</AdminBadge></dd>
            </div>
            <div className="aim-detail-row">
              <dt>Status</dt>
              <dd><AdminStatusBadge status={question.status} /></dd>
            </div>
            <div className="aim-detail-row">
              <dt>Difficulty</dt>
              <dd>{DIFFICULTY_LABELS[question.difficulty]}</dd>
            </div>
            <div className="aim-detail-row">
              <dt>Stem</dt>
              <dd>{question.stem}</dd>
            </div>
            {question.explanation && (
              <div className="aim-detail-row">
                <dt>Explanation</dt>
                <dd>{question.explanation}</dd>
              </div>
            )}
            {question.hint && (
              <div className="aim-detail-row">
                <dt>Hint</dt>
                <dd>{question.hint}</dd>
              </div>
            )}
            <div className="aim-detail-row">
              <dt>Tags</dt>
              <dd>
                {question.tags.length > 0
                  ? question.tags.map((t) => <AdminBadge key={t} variant="default">{t}</AdminBadge>)
                  : '—'}
              </dd>
            </div>
            <div className="aim-detail-row">
              <dt>Created</dt>
              <dd>{new Date(question.createdAt).toLocaleDateString()}</dd>
            </div>
            <div className="aim-detail-row">
              <dt>Updated</dt>
              <dd>{new Date(question.updatedAt).toLocaleDateString()}</dd>
            </div>
          </dl>

          {question.status !== 'archived' && (
            <div style={{ marginBlockStart: 'var(--space-16)' }}>
              <AdminButton variant="primary" onClick={() => setEditing(true)}>
                Edit Question
              </AdminButton>
            </div>
          )}
        </AdminCard>

        <QuestionValidationPanel question={question} hasSkillLinks={false} />

        <QuestionChoiceEditor questionType={question.type} questionId={question.id} />

        <style>{`
          .aim-detail-grid {
            display: grid;
            gap: var(--space-12);
            margin: 0;
          }
          .aim-detail-row {
            display: grid;
            grid-template-columns: 140px 1fr;
            gap: var(--space-8);
            align-items: start;
          }
          .aim-detail-row dt {
            font-weight: var(--weight-semibold);
            font-size: 13px;
            color: var(--text-secondary);
          }
          .aim-detail-row dd {
            margin: 0;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <AdminCard title="Edit Question">
      {error && (
        <div className="admin-error-banner" role="alert" style={{ marginBlockEnd: 'var(--space-16)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <AdminFormField id="q-type" label="Question Type" hint="Type cannot be changed after creation.">
          <AdminInput id="q-type" type="text" value={TYPE_LABELS[question.type] ?? question.type} disabled />
        </AdminFormField>

        <AdminFormField id="q-stem" label="Question Stem" required error={fieldErrors.stem}>
          <AdminTextarea
            id="q-stem"
            value={stem}
            onChange={(e) => setStem(e.target.value)}
            placeholder="Enter the question text…"
            disabled={isPending}
            rows={3}
            maxLength={2000}
            hasError={!!fieldErrors.stem}
            aria-required="true"
          />
        </AdminFormField>

        <AdminFormField id="q-difficulty" label="Difficulty">
          <AdminSelect
            id="q-difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
            disabled={isPending}
          >
            {QUESTION_DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
            ))}
          </AdminSelect>
        </AdminFormField>

        <AdminFormField id="q-explanation" label="Explanation">
          <AdminTextarea
            id="q-explanation"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Optional explanation shown after answering."
            disabled={isPending}
            rows={2}
            maxLength={2000}
          />
        </AdminFormField>

        <AdminFormField id="q-hint" label="Hint">
          <AdminInput
            id="q-hint"
            type="text"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="Optional hint shown before answering."
            disabled={isPending}
            maxLength={500}
          />
        </AdminFormField>

        <AdminFormField id="q-tags" label="Tags" hint="Comma-separated. Editorial tags only — not AIM skill keys.">
          <AdminInput
            id="q-tags"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. past_simple, A1, negation"
            disabled={isPending}
          />
        </AdminFormField>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-12)', marginBlockStart: 'var(--space-16)' }}>
        <AdminButton variant="primary" onClick={handleSubmit} disabled={isPending} loading={isPending}>
          Save Changes
        </AdminButton>
        <AdminButton variant="secondary" onClick={handleCancel} disabled={isPending}>
          Cancel
        </AdminButton>
      </div>
    </AdminCard>
  );
}
