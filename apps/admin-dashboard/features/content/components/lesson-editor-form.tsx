'use client';
// P11-025: Admin lesson editor form using AIM design system.
// Backend is final authority for lesson data and status transitions.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminLessonSummary } from '../api/admin-lessons-api';
import type { TranslationInput } from '../api/admin-translations-api';
import { LESSON_FIELD_LABELS } from '../config/content-locales';
import { useTranslatedFields, type TranslationsLoadResult } from '../hooks/use-translated-fields';
import { TranslationFields } from './translation-fields';
import {
  AdminInput,
  AdminTextarea,
  AdminButton,
  AdminFormField,
  AdminCard,
  AdminBadge,
} from '../../../shared/components/Misc';

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
    systemPrompt?: string | null;
    translations: Readonly<Record<string, TranslationInput>>;
  }) => Promise<{ error?: string }>;
  readonly loadTranslations?: (lessonId: string) => Promise<TranslationsLoadResult>;
  readonly onRemoveTranslation?: (lessonId: string, locale: string) => Promise<{ error?: string }>;
};

export function LessonEditorForm({ lesson, onUpdate, loadTranslations, onRemoveTranslation }: LessonEditorFormProps) {
  const router = useRouter();
  const [sortOrder, setSortOrder] = useState(String(lesson.sortOrder));
  const [systemPrompt, setSystemPrompt] = useState(lesson.systemPrompt ?? '');
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const t = useTranslatedFields({
    mode: 'edit',
    entityId: lesson.id,
    initialTitle: lesson.title,
    initialDescription: lesson.description,
    load: loadTranslations,
    remove: onRemoveTranslation,
  });
  const { error, setError, fieldErrors, descriptionErrors } = t;
  const busy = isPending || t.removing;

  function handleSubmit() {
    const extraErrors: Record<string, string> = {};
    const orderNum = parseInt(sortOrder, 10);
    if (sortOrder.trim() && isNaN(orderNum)) {
      extraErrors.sortOrder = 'Sort order must be a number.';
    }
    if (!t.validate({ requireDefaultDescription: true, extraErrors })) return;
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await onUpdate({
        title: t.english.title.trim(),
        description: t.english.description.trim(),
        ...(sortOrder.trim() && !isNaN(orderNum) ? { sortOrder: orderNum } : {}),
        systemPrompt: systemPrompt.trim() ? systemPrompt.trim() : null,
        translations: t.collectTranslations(),
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
        <a
          href={`/admin/content/lessons/${encodeURIComponent(lesson.id)}/content-blocks`}
          className="aim-lesson-editor-link"
        >
          Manage Content Blocks →
        </a>
      </div>

      {error && (
        <div className="admin-error-banner" role="alert" style={{ marginBlockEnd: 'var(--space-16)' }}>
          {error}
        </div>
      )}

      {t.loadState === 'loading' && <div role="status">Loading translations…</div>}

      {success && (
        <div className="aim-lesson-editor-success" role="status">
          Lesson updated successfully.
        </div>
      )}

      <div className="aim-lesson-editor-fields">
        <TranslationFields
          idPrefix="lesed"
          locales={t.editLocales}
          values={t.values}
          savedLocales={t.savedForTabs}
          fieldLabels={LESSON_FIELD_LABELS}
          activeLocale={t.activeLocale}
          onActiveLocaleChange={t.setActiveLocale}
          onChange={t.handleChange}
          errors={fieldErrors}
          descriptionErrors={descriptionErrors}
          requireDefaultDescription
          disabled={busy}
          disabledLocales={t.disabledLocales}
          onRemove={t.canRemove ? t.setPendingRemove : undefined}
          pendingRemoveLocale={t.pendingRemove}
          onConfirmRemove={t.confirmRemove}
          onCancelRemove={() => t.setPendingRemove(null)}
        />

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
            disabled={busy}
            hasError={!!fieldErrors.sortOrder}
          />
        </AdminFormField>

        <AdminFormField
          id="lesson-system-prompt"
          label="AI Teacher instructions"
          hint="Optional. Tells AI Teacher what this specific lesson is about and what to focus on, in addition to the title/description above."
        >
          <AdminTextarea
            id="lesson-system-prompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="e.g. Focus on present-tense verbs; keep examples food-related; avoid grammar terms the student hasn't learned yet."
            disabled={busy}
            rows={4}
            maxLength={2000}
          />
        </AdminFormField>
      </div>

      <div className="aim-lesson-editor-actions">
        <AdminButton
          variant="primary"
          onClick={handleSubmit}
          disabled={busy}
          loading={isPending}
        >
          Save Changes
        </AdminButton>
        <AdminButton
          variant="secondary"
          onClick={() => router.back()}
          disabled={busy}
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
        .aim-lesson-editor-link {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: var(--radius-sm);
          background: var(--color-primary-50);
          color: var(--color-primary-700);
          font-size: 13px;
          font-weight: var(--weight-semibold);
          text-decoration: none;
          transition: background var(--duration-fast) var(--ease-standard);
        }
        .aim-lesson-editor-link:hover {
          background: var(--color-primary-100);
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
