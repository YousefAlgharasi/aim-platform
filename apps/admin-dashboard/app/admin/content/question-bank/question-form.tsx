'use client';

import { useState, useTransition } from 'react';
import {
  QUESTION_TYPES,
  QUESTION_DIFFICULTIES,
  type AdminQuestionSummary,
  type QuestionType,
  type QuestionDifficulty,
} from '../../../../lib/api/admin-question-bank-api';

type QuestionFormData = {
  type: QuestionType;
  stem: string;
  difficulty: QuestionDifficulty;
  explanation: string | null;
  hint: string | null;
  tags: string[];
};

type Props = {
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

export function QuestionForm({ mode, initial, onSubmit, onCancel }: Props) {
  const [type, setType] = useState<QuestionType>(initial?.type ?? 'multiple_choice');
  const [stem, setStem] = useState(initial?.stem ?? '');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>(initial?.difficulty ?? 'beginner');
  const [explanation, setExplanation] = useState('');
  const [hint, setHint] = useState('');
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(', '));
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      });
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="qf-card">
      <div className="qf-header">
        <h2 className="qf-title">{mode === 'create' ? 'New Question' : 'Edit Question'}</h2>
        <button type="button" className="qf-close" onClick={onCancel} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {error && <div className="admin-error-banner" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="qf-form">
        <div className="qf-row">
          <div className="qf-field qf-field--half">
            <label htmlFor="qf-type" className="qf-label">Type {mode === 'edit' && <span className="qf-hint">(locked)</span>}</label>
            <select id="qf-type" value={type} onChange={(e) => setType(e.target.value as QuestionType)}
              disabled={isPending || mode === 'edit'} className="qf-select">
              {QUESTION_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
          </div>
          <div className="qf-field qf-field--half">
            <label htmlFor="qf-diff" className="qf-label">Difficulty</label>
            <select id="qf-diff" value={difficulty} onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
              disabled={isPending} className="qf-select">
              {QUESTION_DIFFICULTIES.map((d) => <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>)}
            </select>
          </div>
        </div>

        <div className="qf-field">
          <label htmlFor="qf-stem" className="qf-label">Stem <span className="qf-req">*</span></label>
          <textarea id="qf-stem" value={stem} onChange={(e) => setStem(e.target.value)}
            placeholder="Enter the question text…" disabled={isPending} rows={3} maxLength={2000}
            className={`qf-textarea ${fieldErrors.stem ? 'qf-input--error' : ''}`} />
          {fieldErrors.stem && <span className="qf-error">{fieldErrors.stem}</span>}
        </div>

        <div className="qf-field">
          <label htmlFor="qf-explanation" className="qf-label">Explanation</label>
          <textarea id="qf-explanation" value={explanation} onChange={(e) => setExplanation(e.target.value)}
            placeholder="Optional explanation shown after answering." disabled={isPending} rows={2} maxLength={2000}
            className="qf-textarea" />
        </div>

        <div className="qf-field">
          <label htmlFor="qf-hint" className="qf-label">Hint</label>
          <input id="qf-hint" type="text" value={hint} onChange={(e) => setHint(e.target.value)}
            placeholder="Optional hint shown before answering." disabled={isPending} maxLength={500}
            className="qf-input" />
        </div>

        <div className="qf-field">
          <label htmlFor="qf-tags" className="qf-label">Tags</label>
          <input id="qf-tags" type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. past_simple, A1, negation" disabled={isPending} className="qf-input" />
          <span className="qf-hint">Comma-separated editorial tags.</span>
        </div>

        <div className="qf-actions">
          <button type="submit" disabled={isPending} className="qf-submit">
            {isPending ? 'Saving…' : mode === 'create' ? 'Create Question' : 'Save Changes'}
          </button>
          <button type="button" onClick={onCancel} disabled={isPending} className="qf-cancel">Cancel</button>
        </div>
      </form>

      <style>{`
        .qf-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; max-width: 600px; }
        .qf-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .qf-title { margin: 0; font-size: 18px; font-weight: 700; color: var(--text-primary); }
        .qf-close { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: var(--radius-sm); }
        .qf-close:hover { color: var(--text-primary); }
        .qf-form { display: flex; flex-direction: column; gap: 16px; }
        .qf-row { display: flex; gap: 12px; }
        .qf-field { display: flex; flex-direction: column; gap: 4px; }
        .qf-field--half { flex: 1; }
        .qf-label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
        .qf-req { color: var(--color-error-500); }
        .qf-hint { font-size: 12px; color: var(--text-muted); font-weight: 400; }
        .qf-input, .qf-textarea, .qf-select {
          padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm);
          background: var(--surface); color: var(--text-primary); font-size: 14px; font-family: inherit;
        }
        .qf-input, .qf-select { height: 38px; }
        .qf-textarea { resize: vertical; min-height: 72px; }
        .qf-input:focus, .qf-textarea:focus, .qf-select:focus {
          outline: none; border-color: var(--color-primary-500);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
        }
        .qf-input--error { border-color: var(--color-error-500); }
        .qf-error { font-size: 12px; color: var(--color-error-500); font-weight: 500; }
        .qf-select:disabled { opacity: 0.5; }
        .qf-actions { display: flex; gap: 8px; margin-top: 4px; }
        .qf-submit {
          height: 38px; padding: 0 18px; border: none; border-radius: var(--radius-md);
          background: var(--color-primary-500); color: white;
          font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
        }
        .qf-submit:hover:not(:disabled) { background: var(--color-primary-600); }
        .qf-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .qf-cancel {
          height: 38px; padding: 0 18px; border: 1px solid var(--border);
          border-radius: var(--radius-md); background: var(--surface);
          color: var(--text-secondary); font-size: 13px; font-weight: 500;
          font-family: inherit; cursor: pointer;
        }
        .qf-cancel:hover { background: var(--surface-sunken); }
        @media (max-width: 480px) {
          .qf-row { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
