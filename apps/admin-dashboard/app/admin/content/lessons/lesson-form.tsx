'use client';
// P11-024: Admin lesson create/edit form using AIM design system.
// Backend is final authority for lesson data and status transitions.

import { useState, useTransition } from 'react';
import type { AdminLessonSummary } from '../../../../lib/api/admin-lessons-api';
import {
  AdminInput,
  AdminTextarea,
  AdminButton,
  AdminFormField,
  AdminCard,
} from '../../../../components/common';

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!title.trim()) {
      errors.title = 'Title is required.';
    }
    if (!description.trim()) {
      errors.description = 'Description is required.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
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
    <AdminCard
      title={mode === 'create' ? 'New Lesson' : 'Edit Lesson'}
    >
      {error && (
        <div className="admin-error-banner" role="alert" style={{ marginBlockEnd: 'var(--space-16)' }}>
          {error}
        </div>
      )}

      <div className="aim-lesson-form-fields">
        <AdminFormField
          id="lesson-title"
          label="Title"
          required
          error={fieldErrors.title}
        >
          <AdminInput
            id="lesson-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Past Simple Basics"
            disabled={isPending}
            maxLength={255}
            hasError={!!fieldErrors.title}
            aria-required="true"
          />
        </AdminFormField>

        <AdminFormField
          id="lesson-description"
          label="Description"
          required
          error={fieldErrors.description}
        >
          <AdminTextarea
            id="lesson-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What this lesson covers."
            disabled={isPending}
            rows={3}
            maxLength={2000}
            hasError={!!fieldErrors.description}
            aria-required="true"
          />
        </AdminFormField>
      </div>

      <div className="admin-boundary-note" style={{ marginBlock: 'var(--space-16)' }}>
        <strong>Backend authority:</strong> Status changes (publish, archive) and
        skill linking are controlled by backend APIs and are not set here. A
        lesson cannot be published until it is linked to at least one skill.
      </div>

      <div className="aim-lesson-form-actions">
        <AdminButton
          variant="primary"
          onClick={handleSubmit}
          disabled={isPending}
          loading={isPending}
        >
          {mode === 'create' ? 'Create Lesson' : 'Save Changes'}
        </AdminButton>
        <AdminButton
          variant="secondary"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </AdminButton>
      </div>

      <style>{`
        .aim-lesson-form-fields {
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
        }
        .aim-lesson-form-actions {
          display: flex;
          gap: var(--space-12);
        }
      `}</style>
    </AdminCard>
  );
}
