'use client';

import { useState, useTransition } from 'react';
import type { AdminLessonSummary } from '../../../../lib/api/admin-lessons-api';

type Props = {
  readonly mode: 'create' | 'edit';
  readonly initial?: AdminLessonSummary;
  readonly onSubmit: (data: { title: string; description: string }) => Promise<{ error?: string }>;
  readonly onCancel: () => void;
};

export function LessonForm({ mode, initial, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Title is required.';
    if (!description.trim()) errors.description = 'Description is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setError(null);
    startTransition(async () => {
      const result = await onSubmit({ title: title.trim(), description: description.trim() });
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="cf-card">
      <div className="cf-header">
        <h2 className="cf-title">{mode === 'create' ? 'New Lesson' : 'Edit Lesson'}</h2>
        <button type="button" className="cf-close" onClick={onCancel} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {error && <div className="admin-error-banner" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="cf-form">
        <div className="cf-field">
          <label htmlFor="lesf-title" className="cf-label">Title <span className="cf-req">*</span></label>
          <input id="lesf-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Past Simple Basics" disabled={isPending} maxLength={255}
            className={`cf-input ${fieldErrors.title ? 'cf-input--error' : ''}`} />
          {fieldErrors.title && <span className="cf-error">{fieldErrors.title}</span>}
        </div>

        <div className="cf-field">
          <label htmlFor="lesf-desc" className="cf-label">Description <span className="cf-req">*</span></label>
          <textarea id="lesf-desc" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="What this lesson covers." disabled={isPending} rows={3} maxLength={2000}
            className={`cf-textarea ${fieldErrors.description ? 'cf-input--error' : ''}`} />
          {fieldErrors.description && <span className="cf-error">{fieldErrors.description}</span>}
        </div>

        <div className="cf-actions">
          <button type="submit" disabled={isPending} className="cf-submit">
            {isPending ? 'Saving…' : mode === 'create' ? 'Create Lesson' : 'Save Changes'}
          </button>
          <button type="button" onClick={onCancel} disabled={isPending} className="cf-cancel">Cancel</button>
        </div>
      </form>

      <style>{`
        .cf-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; max-width: 560px; }
        .cf-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .cf-title { margin: 0; font-size: 18px; font-weight: 700; color: var(--text-primary); }
        .cf-close { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: var(--radius-sm); }
        .cf-close:hover { color: var(--text-primary); }
        .cf-form { display: flex; flex-direction: column; gap: 16px; }
        .cf-field { display: flex; flex-direction: column; gap: 4px; }
        .cf-label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
        .cf-req { color: var(--color-error-500); }
        .cf-input, .cf-textarea {
          padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm);
          background: var(--surface); color: var(--text-primary); font-size: 14px; font-family: inherit;
        }
        .cf-input { height: 38px; }
        .cf-textarea { resize: vertical; min-height: 72px; }
        .cf-input:focus, .cf-textarea:focus {
          outline: none; border-color: var(--color-primary-500);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
        }
        .cf-input--error { border-color: var(--color-error-500); }
        .cf-error { font-size: 12px; color: var(--color-error-500); font-weight: 500; }
        .cf-actions { display: flex; gap: 8px; margin-top: 4px; }
        .cf-submit {
          height: 38px; padding: 0 18px; border: none; border-radius: var(--radius-md);
          background: var(--color-primary-500); color: white;
          font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
        }
        .cf-submit:hover:not(:disabled) { background: var(--color-primary-600); }
        .cf-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .cf-cancel {
          height: 38px; padding: 0 18px; border: 1px solid var(--border);
          border-radius: var(--radius-md); background: var(--surface);
          color: var(--text-secondary); font-size: 13px; font-weight: 500;
          font-family: inherit; cursor: pointer;
        }
        .cf-cancel:hover { background: var(--surface-sunken); }
      `}</style>
    </div>
  );
}
