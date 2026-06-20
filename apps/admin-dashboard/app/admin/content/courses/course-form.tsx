'use client';
// P11-022: Admin course editor form using AIM design system.
// Backend is final authority for course data and status transitions.

import { useState, useTransition } from 'react';
import type { AdminCourseSummary } from '../../../../lib/api/admin-courses-api';
import {
  AdminInput,
  AdminTextarea,
  AdminButton,
  AdminFormField,
  AdminCard,
} from '../../../../components/common';

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!title.trim()) {
      errors.title = 'Title is required.';
    }
    if (slug.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) {
      errors.slug = 'Slug must be lowercase letters, numbers, and hyphens only.';
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
        slug: slug.trim() || null,
        description: description.trim() || null,
      });
      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <AdminCard
      title={mode === 'create' ? 'New Course' : 'Edit Course'}
    >
      {error && (
        <div className="admin-error-banner" role="alert" style={{ marginBlockEnd: 'var(--space-16)' }}>
          {error}
        </div>
      )}

      <div className="aim-course-form-fields">
        <AdminFormField
          id="course-title"
          label="Title"
          required
          error={fieldErrors.title}
        >
          <AdminInput
            id="course-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. English for Beginners"
            disabled={isPending}
            maxLength={255}
            hasError={!!fieldErrors.title}
            aria-required="true"
          />
        </AdminFormField>

        <AdminFormField
          id="course-slug"
          label="Slug"
          hint="Optional. Lowercase letters, numbers, and hyphens. Must be unique."
          error={fieldErrors.slug}
        >
          <AdminInput
            id="course-slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. english-for-beginners"
            disabled={isPending}
            maxLength={255}
            hasError={!!fieldErrors.slug}
          />
        </AdminFormField>

        <AdminFormField
          id="course-description"
          label="Description"
        >
          <AdminTextarea
            id="course-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary of this course."
            disabled={isPending}
            rows={3}
            maxLength={2000}
          />
        </AdminFormField>
      </div>

      <div className="admin-boundary-note" style={{ marginBlock: 'var(--space-16)' }}>
        <strong>Backend authority:</strong> Status changes (publish, archive) are
        controlled by backend APIs only and cannot be set here.
      </div>

      <div className="aim-course-form-actions">
        <AdminButton
          variant="primary"
          onClick={handleSubmit}
          disabled={isPending}
          loading={isPending}
        >
          {mode === 'create' ? 'Create Course' : 'Save Changes'}
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
        .aim-course-form-fields {
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
        }
        .aim-course-form-actions {
          display: flex;
          gap: var(--space-12);
        }
      `}</style>
    </AdminCard>
  );
}
