'use client';

// Phase 3 — P3-054
// Admin chapter create/edit form client component.
//
// Scope: Curriculum & Content System — chapters only.
//
// Security:
// - No token or credential ever enters this component.
// - Status field is intentionally absent; status changes are backend-only operations.

import { useState, useTransition } from 'react';
import type { AdminChapterSummary } from '../../../../lib/api/admin-chapters-api';

type ChapterFormData = {
  title: string;
  slug: string | null;
  description: string | null;
};

type ChapterFormProps = {
  readonly mode: 'create' | 'edit';
  readonly initial?: AdminChapterSummary;
  readonly onSubmit: (data: ChapterFormData) => Promise<{ error?: string }>;
  readonly onCancel: () => void;
};

export function ChapterForm({ mode, initial, onSubmit, onCancel }: ChapterFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
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
    <div className="course-form">
      <h2 className="course-form-title">
        {mode === 'create' ? 'New Chapter' : 'Edit Chapter'}
      </h2>

      {error && (
        <p className="course-form-error" role="alert">
          {error}
        </p>
      )}

      <div className="course-form-field">
        <label htmlFor="chapter-title">
          Title <span aria-hidden="true">*</span>
        </label>
        <input
          id="chapter-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Introduction to Past Tense"
          disabled={isPending}
          maxLength={255}
        />
      </div>

      <div className="course-form-field">
        <label htmlFor="chapter-slug">Slug</label>
        <input
          id="chapter-slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. intro-past-tense"
          disabled={isPending}
          maxLength={255}
        />
        <small>Optional. Must be unique within a level. Leave blank to omit.</small>
      </div>

      <div className="course-form-field">
        <label htmlFor="chapter-description">Description</label>
        <textarea
          id="chapter-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief summary of this chapter."
          disabled={isPending}
          rows={3}
          maxLength={2000}
        />
      </div>

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Status changes (publish, archive) are
        controlled by backend APIs only and cannot be set here.
      </div>

      <div className="course-form-actions">
        <button className="btn-primary" onClick={handleSubmit} disabled={isPending}>
          {isPending ? 'Saving…' : mode === 'create' ? 'Create Chapter' : 'Save Changes'}
        </button>
        <button className="btn-secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </button>
      </div>
    </div>
  );
}
