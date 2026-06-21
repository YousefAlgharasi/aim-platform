'use client';

import { useState, useTransition } from 'react';
import {
  QUESTION_TYPES,
  QUESTION_DIFFICULTIES,
  type AdminQuestionSummary,
  type QuestionType,
  type QuestionDifficulty,
} from '../../../../lib/api/admin-question-bank-api';
import {
  AdminButton,
  AdminCard,
  AdminFormField,
  AdminInput,
  AdminTextarea,
  AdminSelect,
} from '../../../../components/common';

type QuestionFormData = {
  type: QuestionType;
  stem: string;
  difficulty: QuestionDifficulty;
  explanation: string | null;
  hint: string | null;
  tags: string[];
};

type QuestionFormProps = {
  readonly mode: 'create' | 'edit';
  readonly initial?: AdminQuestionSummary;
  readonly onSubmit: (data: QuestionFormData) => Promise<{ error?: string }>;
  readonly onCancel: () => void;
};

const TYPE_LABELS: Record<QuestionType, string> = {
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

export function QuestionForm({ mode, initial, onSubmit, onCancel }: QuestionFormProps) {
  const [type, setType] = useState<QuestionType>(initial?.type ?? 'multiple_choice');
  const [stem, setStem] = useState(initial?.stem ?? '');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>(initial?.difficulty ?? 'beginner');
  const [explanation, setExplanation] = useState('');
  const [hint, setHint] = useState('');
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(', '));
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
      const result = await onSubmit({
        type,
        stem: stem.trim(),
        difficulty,
        explanation: explanation.trim() || null,
        hint: hint.trim() || null,
        tags: parseTags(tagsInput),
      });
      if (result.error) setError(result.error);
    });
  }

  return (
    <AdminCard title={mode === 'create' ? 'New Question' : 'Edit Question'}>
      {error && (
        <div className="admin-error-banner" role="alert" style={{ marginBlockEnd: 'var(--space-16)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <AdminFormField
          id="q-type"
          label="Question Type"
          hint={mode === 'edit' ? 'Type cannot be changed after creation.' : undefined}
        >
          <AdminSelect
            id="q-type"
            value={type}
            onChange={(e) => setType(e.target.value as QuestionType)}
            disabled={isPending || mode === 'edit'}
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </AdminSelect>
        </AdminFormField>

        <AdminFormField
          id="q-stem"
          label="Question Stem"
          required
          error={fieldErrors.stem}
        >
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

        <AdminFormField
          id="q-tags"
          label="Tags"
          hint="Comma-separated. Editorial tags only — not AIM skill keys."
        >
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

      <div className="admin-boundary-note" style={{ marginBlock: 'var(--space-16)' }}>
        <strong>Backend authority:</strong> Question status (publish, archive) is
        controlled by backend APIs. Skill-to-question mapping requires the
        dedicated question-skill linking UI. Answers and choices are managed
        separately from this form.
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-12)' }}>
        <AdminButton variant="primary" onClick={handleSubmit} disabled={isPending} loading={isPending}>
          {mode === 'create' ? 'Create Question' : 'Save Changes'}
        </AdminButton>
        <AdminButton variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </AdminButton>
      </div>
    </AdminCard>
  );
}
