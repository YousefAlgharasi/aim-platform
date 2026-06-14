'use client';

import { useState, useTransition } from 'react';
import type { AdminCourseSummary } from '../../../../lib/api/admin-courses-api';

type CourseFormProps = {
  readonly mode: 'create' | 'edit';
  readonly initial?: AdminCourseSummary;
  readonly onSubmit: (data: {
    title: string;
    slug: string | null;
    description: string | null;
  }) => Promise<{ error?: string }>;
  readonly onCancel: () => void;
};

export function CourseForm({ mode, initial, onSubmit, onCancel }: CourseFormProps) {
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
      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="course-form">
      <h2 className="course-form-title">
        {mode === 'create' ? 'New Course' : 'Edit Course'}
      </h2>

      {error && <p className="course-form-error" role="alert">{error}</p>}

      <div className="course-form-field">
        <label htmlFor="course-title">Title <span aria-hidden="true">*</span></label>
        <input
          id="course-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. English for Beginners"
          disabled={isPending}
          maxLength={255}
        />
      </div>

      <div className="course-form-field">
        <label htmlFor="course-slug">Slug</label>
        <input
          id="course-slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. english-for-beginners"
          disabled={isPending}
          maxLength={255}
        />
        <small>Optional. Must be unique. Leave blank to omit.</small>
      </div>

      <div className="course-form-field">
        <label htmlFor="course-description">Description</label>
        <textarea
          id="course-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief summary of this course."
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
          {isPending ? 'Saving…' : mode === 'create' ? 'Create Course' : 'Save Changes'}
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
