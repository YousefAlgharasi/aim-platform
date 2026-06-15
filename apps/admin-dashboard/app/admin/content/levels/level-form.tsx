'use client';

// Phase 3 — P3-053
// Admin level create/edit form client component.
//
// Scope: Curriculum & Content System — levels only.
//
// Security:
// - No token or credential ever enters this component.
// - Status field is intentionally absent; status changes are backend-only operations.

import { useState, useTransition } from 'react';
import type { AdminLevelSummary } from '../../../../lib/api/admin-levels-api';

type LevelFormData = {
  title: string;
  code: string | null;
  slug: string | null;
  description: string | null;
};

type LevelFormProps = {
  readonly mode: 'create' | 'edit';
  readonly initial?: AdminLevelSummary;
  readonly onSubmit: (data: LevelFormData) => Promise<{ error?: string }>;
  readonly onCancel: () => void;
};

export function LevelForm({ mode, initial, onSubmit, onCancel }: LevelFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [code, setCode] = useState(initial?.code ?? '');
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
        code: code.trim() || null,
        slug: slug.trim() || null,
        description: description.trim() || null,
      });
      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="course-form">
      <h2 className="course-form-title">
        {mode === 'create' ? 'New Level' : 'Edit Level'}
      </h2>

      {error && (
        <p className="course-form-error" role="alert">
          {error}
        </p>
      )}

      <div className="course-form-field">
        <label htmlFor="level-title">
          Title <span aria-hidden="true">*</span>
        </label>
        <input
          id="level-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Beginner"
          disabled={isPending}
          maxLength={255}
        />
      </div>

      <div className="course-form-field">
        <label htmlFor="level-code">Code</label>
        <input
          id="level-code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. A1"
          disabled={isPending}
          maxLength={50}
        />
        <small>
          Optional editorial code (e.g. CEFR level). Not a mastery or placement
          signal — backend controls those.
        </small>
      </div>

      <div className="course-form-field">
        <label htmlFor="level-slug">Slug</label>
        <input
          id="level-slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. beginner"
          disabled={isPending}
          maxLength={255}
        />
        <small>Optional. Must be unique within a course. Leave blank to omit.</small>
      </div>

      <div className="course-form-field">
        <label htmlFor="level-description">Description</label>
        <textarea
          id="level-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief summary of this level."
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
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending
            ? 'Saving…'
            : mode === 'create'
            ? 'Create Level'
            : 'Save Changes'}
        </button>
        <button
          className="btn-secondary"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
