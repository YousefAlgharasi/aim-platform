'use client';

import { useState, useTransition } from 'react';
import type { AdminChapterSummary } from '../../../../lib/api/admin-chapters-api';

type Props = {
  readonly mode: 'create' | 'edit';
  readonly initial?: AdminChapterSummary;
  readonly onSubmit: (data: {
    title: string; slug: string | null; description: string | null;
  }) => Promise<{ error?: string }>;
  readonly onCancel: () => void;
};

export function ChapterForm({ mode, initial, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Title is required.';
    if (slug.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) {
      errors.slug = 'Lowercase letters, numbers, and hyphens only.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setError(null);
    startTransition(async () => {
      const result = await onSubmit({
        title: title.trim(),
        slug: slug.trim() || null,
        description: description.trim() || null,
      });
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="cf-card">
      <div className="cf-header">
        <h2 className="cf-title">{mode === 'create' ? 'New Chapter' : 'Edit Chapter'}</h2>
        <button type="button" className="cf-close" onClick={onCancel} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {error && <div className="admin-error-banner" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="cf-form">
        <div className="cf-field">
          <label htmlFor="chf-title" className="cf-label">Title <span className="cf-req">*</span></label>
          <input id="chf-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction to Past Tense" disabled={isPending} maxLength={255}
            className={`cf-input ${fieldErrors.title ? 'cf-input--error' : ''}`} />
          {fieldErrors.title && <span className="cf-error">{fieldErrors.title}</span>}
        </div>

        <div className="cf-field">
          <label htmlFor="chf-slug" className="cf-label">Slug</label>
          <input id="chf-slug" type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. intro-past-tense" disabled={isPending} maxLength={255}
            className={`cf-input ${fieldErrors.slug ? 'cf-input--error' : ''}`} />
          <span className="cf-hint">Optional. Lowercase, hyphens only. Must be unique within a level.</span>
          {fieldErrors.slug && <span className="cf-error">{fieldErrors.slug}</span>}
        </div>

        <div className="cf-field">
          <label htmlFor="chf-desc" className="cf-label">Description</label>
          <textarea id="chf-desc" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary of this chapter." disabled={isPending} rows={3} maxLength={2000}
            className="cf-textarea" />
        </div>

        <div className="cf-actions">
          <button type="submit" disabled={isPending} className="cf-submit">
            {isPending ? 'Saving…' : mode === 'create' ? 'Create Chapter' : 'Save Changes'}
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
        .cf-hint { font-size: 12px; color: var(--text-muted); }
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
