'use client';
// P11-025: Admin lesson editor form using AIM design system.
// Backend is final authority for lesson data and status transitions.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminLessonSummary } from '../../../../../lib/api/admin-lessons-api';
import {
  AdminInput,
  AdminTextarea,
  AdminButton,
  AdminFormField,
  AdminCard,
  AdminBadge,
} from '../../../../../components/common';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  draft: 'neutral',
  in_review: 'warning',
  approved: 'info',
  published: 'success',
  archived: 'error',
};

type LessonEditorFormProps = {
  readonly lesson: AdminLessonSummary;
  readonly onUpdate: (data: {
    title: string;
    description: string;
    sortOrder?: number;
  }) => Promise<{ error?: string }>;
};

export function LessonEditorForm({ lesson, onUpdate }: LessonEditorFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description);
  const [sortOrder, setSortOrder] = useState(String(lesson.sortOrder));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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
    const orderNum = parseInt(sortOrder, 10);
    if (sortOrder.trim() && isNaN(orderNum)) {
      errors.sortOrder = 'Sort order must be a number.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const orderNum = parseInt(sortOrder, 10);
      const result = await onUpdate({
        title: title.trim(),
        description: description.trim(),
        ...(sortOrder.trim() && !isNaN(orderNum) ? { sortOrder: orderNum } : {}),
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
      }
    });
  }

  return (
    <AdminCard title="Lesson Details">
      <div className="aim-lesson-editor-meta">
        <span className="aim-lesson-editor-meta-item">
          <strong>ID:</strong> <code>{lesson.id}</code>
        </span>
        <span className="aim-lesson-editor-meta-item">
          <strong>Chapter:</strong> <code>{lesson.chapterId}</code>
        </span>
        <span className="aim-lesson-editor-meta-item">
          <strong>Status:</strong>{' '}
          <AdminBadge variant={STATUS_VARIANT[lesson.status] ?? 'neutral'}>
            {lesson.status.replace('_', ' ')}
          </AdminBadge>
        </span>
        <span className="aim-lesson-editor-meta-item">
          <strong>Created:</strong> {new Date(lesson.createdAt).toLocaleDateString()}
        </span>
        <span className="aim-lesson-editor-meta-item">
          <strong>Updated:</strong> {new Date(lesson.updatedAt).toLocaleDateString()}
        </span>
      </div>

      {error && (
        <div className="admin-error-banner" role="alert" style={{ marginBlockEnd: 'var(--space-16)' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="aim-lesson-editor-success" role="status">
          Lesson updated successfully.
        </div>
      )}

      <div className="aim-lesson-editor-fields">
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
            rows={4}
            maxLength={2000}
            hasError={!!fieldErrors.description}
            aria-required="true"
          />
        </AdminFormField>

        <AdminFormField
          id="lesson-sort-order"
          label="Sort Order"
          hint="Numeric position within the chapter. Lower numbers appear first."
          error={fieldErrors.sortOrder}
        >
          <AdminInput
            id="lesson-sort-order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            placeholder="0"
            disabled={isPending}
            hasError={!!fieldErrors.sortOrder}
          />
        </AdminFormField>
      </div>

      <div className="admin-boundary-note" style={{ marginBlock: 'var(--space-16)' }}>
        <strong>Backend authority:</strong> Status changes (publish, archive) and
        skill linking are controlled by backend APIs. A lesson cannot be published
        until it is linked to at least one skill.
      </div>

      <div className="aim-lesson-editor-actions">
        <AdminButton
          variant="primary"
          onClick={handleSubmit}
          disabled={isPending}
          loading={isPending}
        >
          Save Changes
        </AdminButton>
        <AdminButton
          variant="secondary"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Back
        </AdminButton>
      </div>

      <style>{`
        .aim-lesson-editor-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-16);
          padding: var(--space-12) 0;
          margin-block-end: var(--space-16);
          border-bottom: 1px solid var(--border-default);
          font-size: 13px;
          color: var(--text-secondary);
        }
        .aim-lesson-editor-meta-item code {
          font-size: 12px;
          color: var(--text-muted);
        }
        .aim-lesson-editor-fields {
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
        }
        .aim-lesson-editor-actions {
          display: flex;
          gap: var(--space-12);
        }
        .aim-lesson-editor-success {
          padding: var(--space-12) var(--space-16);
          margin-block-end: var(--space-16);
          border-radius: var(--radius-md);
          background: var(--color-success-50);
          color: var(--color-success-700);
          font-size: 14px;
          font-weight: var(--weight-medium);
        }
      `}</style>
    </AdminCard>
  );
}
