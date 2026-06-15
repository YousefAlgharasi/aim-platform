'use client';

// Phase 3 — P3-055
// Admin lesson create/edit form client component.
//
// Scope: Curriculum & Content System — lessons only.
//
// Security:
// - No token or credential ever enters this component.
// - Status field is intentionally absent; status changes are backend-only operations.
// - Lesson-to-skill linking is managed separately (P3-058); this form does not
//   set or display skills.

import { useState, useTransition } from 'react';
import type { AdminLessonSummary } from '../../../../lib/api/admin-lessons-api';

type LessonFormData = {
  title: string;
  description: string;
};

type LessonFormProps = {
  readonly mode: 'create' | 'edit';
  readonly initial?: AdminLessonSummary;
  readonly onSubmit: (data: LessonFormData) => Promise<{ error?: string }>;
  readonly onCancel: () => void;
};

export function LessonForm({ mode, initial, onSubmit, onCancel }: LessonFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await onSubmit({
        title: title.trim(),
        description: description.trim(),
      });
      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="course-form">
      <h2 className="course-form-title">
        {mode === 'create' ? 'New Lesson' : 'Edit Lesson'}
      </h2>

      {error && (
        <p className="course-form-error" role="alert">
          {error}
        </p>
      )}

      <div className="course-form-field">
        <label htmlFor="lesson-title">
          Title <span aria-hidden="true">*</span>
        </label>
        <input
          id="lesson-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Past Simple Basics"
          disabled={isPending}
          maxLength={255}
        />
      </div>

      <div className="course-form-field">
        <label htmlFor="lesson-description">
          Description <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="lesson-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What this lesson covers."
          disabled={isPending}
          rows={3}
          maxLength={2000}
        />
      </div>

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Status changes (publish, archive) and
        skill linking are controlled by backend APIs and are not set here. A
        lesson cannot be published until it is linked to at least one skill.
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
            ? 'Create Lesson'
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
