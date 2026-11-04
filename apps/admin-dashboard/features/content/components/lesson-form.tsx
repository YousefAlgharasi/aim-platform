'use client';

import { useTransition } from 'react';
import type { AdminLessonSummary } from '../api/admin-lessons-api';
import type { TranslationInput } from '../api/admin-translations-api';
import { CONTENT_LOCALE_CODES, LESSON_FIELD_LABELS } from '../config/content-locales';
import { useTranslatedFields, type TranslationsLoadResult } from '../hooks/use-translated-fields';
import { TranslationFields } from './translation-fields';

export type LessonFormSubmit = {
  readonly title: string;
  readonly description: string;
  readonly translations: Readonly<Record<string, TranslationInput>>;
};

type Props = {
  readonly mode: 'create' | 'edit';
  readonly initial?: AdminLessonSummary;
  readonly onSubmit: (data: LessonFormSubmit) => Promise<{ error?: string }>;
  readonly onCancel: () => void;
  readonly locales?: readonly string[];
  readonly loadTranslations?: (lessonId: string) => Promise<TranslationsLoadResult>;
  readonly onRemoveTranslation?: (lessonId: string, locale: string) => Promise<{ error?: string }>;
};

export function LessonForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  locales = CONTENT_LOCALE_CODES,
  loadTranslations,
  onRemoveTranslation,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const t = useTranslatedFields({
    mode,
    entityId: initial?.id,
    initialTitle: initial?.title ?? '',
    initialDescription: initial?.description ?? '',
    locales,
    load: loadTranslations,
    remove: onRemoveTranslation,
  });
  const { error, setError, fieldErrors, descriptionErrors } = t;
  const busy = isPending || t.removing;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!t.validate({ requireDefaultDescription: true })) return;
    setError(null);
    startTransition(async () => {
      const result = await onSubmit({
        title: t.english.title.trim(),
        description: t.english.description.trim(),
        translations: t.collectTranslations(),
      });
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="cf-card">
      <div className="cf-header">
        <h2 className="cf-title">{mode === 'create' ? 'New Lesson' : 'Edit Lesson'}</h2>
        <button type="button" className="cf-close" onClick={onCancel} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {error && <div className="admin-error-banner" role="alert">{error}</div>}
      {t.loadState === 'loading' && <div className="cf-hint" role="status">Loading translations…</div>}

      <form onSubmit={handleSubmit} className="cf-form">
        <TranslationFields
          idPrefix="lesf"
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

        <div className="cf-actions">
          <button type="submit" disabled={busy} className="cf-submit">
            {isPending ? 'Saving…' : mode === 'create' ? 'Create Lesson' : 'Save Changes'}
          </button>
          <button type="button" onClick={onCancel} disabled={busy} className="cf-cancel">Cancel</button>
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
        .cf-error { font-size: 12px; color: var(--color-error-500); font-weight: 500; }
        .cf-hint { font-size: 12px; color: var(--text-muted); }
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
