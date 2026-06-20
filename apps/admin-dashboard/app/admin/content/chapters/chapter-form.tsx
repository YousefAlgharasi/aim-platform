'use client';
// P11-023: Admin chapter editor form using AIM design system.

import { useState, useTransition } from 'react';
import type { AdminChapterSummary } from '../../../../lib/api/admin-chapters-api';
import {
  AdminInput,
  AdminTextarea,
  AdminButton,
  AdminFormField,
  AdminCard,
} from '../../../../components/common';

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Title is required.';
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
      if (result.error) setError(result.error);
    });
  }

  return (
    <AdminCard title={mode === 'create' ? 'New Chapter' : 'Edit Chapter'}>
      {error && (
        <div className="admin-error-banner" role="alert" style={{ marginBlockEnd: 'var(--space-16)' }}>
          {error}
        </div>
      )}

      <div className="aim-chapter-form-fields">
        <AdminFormField id="chapter-title" label="Title" required error={fieldErrors.title}>
          <AdminInput
            id="chapter-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction to Past Tense"
            disabled={isPending}
            maxLength={255}
            hasError={!!fieldErrors.title}
            aria-required="true"
          />
        </AdminFormField>

        <AdminFormField
          id="chapter-slug"
          label="Slug"
          hint="Optional. Lowercase letters, numbers, and hyphens. Must be unique within a level."
          error={fieldErrors.slug}
        >
          <AdminInput
            id="chapter-slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. intro-past-tense"
            disabled={isPending}
            maxLength={255}
            hasError={!!fieldErrors.slug}
          />
        </AdminFormField>

        <AdminFormField id="chapter-description" label="Description">
          <AdminTextarea
            id="chapter-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary of this chapter."
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

      <div className="aim-chapter-form-actions">
        <AdminButton variant="primary" onClick={handleSubmit} disabled={isPending} loading={isPending}>
          {mode === 'create' ? 'Create Chapter' : 'Save Changes'}
        </AdminButton>
        <AdminButton variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </AdminButton>
      </div>

      <style>{`
        .aim-chapter-form-fields {
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
        }
        .aim-chapter-form-actions {
          display: flex;
          gap: var(--space-12);
        }
      `}</style>
    </AdminCard>
  );
}
