'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import type {
  AdminCourseSummary,
  CourseTranslationInput,
  CourseTranslationsData,
} from '../api/admin-courses-api';
import {
  CONTENT_LOCALE_CODES,
  COURSE_FIELD_LABELS,
  DEFAULT_CONTENT_LOCALE,
  getLocaleMeta,
} from '../config/content-locales';
import { TranslationFields, type TranslationValues } from './translation-fields';

export type CourseFormSubmit = {
  readonly title: string;
  readonly slug: string | null;
  readonly description: string | null;
  readonly translations: Readonly<Record<string, CourseTranslationInput>>;
};

type TranslationsLoader = (
  courseId: string,
) => Promise<{ data?: CourseTranslationsData; error?: string }>;

type Props = {
  readonly mode: 'create' | 'edit';
  readonly initial?: AdminCourseSummary;
  readonly onSubmit: (data: CourseFormSubmit) => Promise<{ error?: string }>;
  readonly onCancel: () => void;
  readonly locales?: readonly string[];
  readonly loadTranslations?: TranslationsLoader;
  readonly onRemoveTranslation?: (courseId: string, locale: string) => Promise<{ error?: string }>;
};

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

const EMPTY = { title: '', description: '' };

function buildInitialValues(locales: readonly string[], initial?: AdminCourseSummary): TranslationValues {
  const values: Record<string, { title: string; description: string }> = {};
  for (const locale of locales) values[locale] = { ...EMPTY };
  values[DEFAULT_CONTENT_LOCALE] = {
    title: initial?.title ?? '',
    description: initial?.description ?? '',
  };
  return values;
}

export function CourseForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  locales = CONTENT_LOCALE_CODES,
  loadTranslations,
  onRemoveTranslation,
}: Props) {
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [values, setValues] = useState<TranslationValues>(() => buildInitialValues(locales, initial));
  const [activeLocale, setActiveLocale] = useState(DEFAULT_CONTENT_LOCALE);
  const [saved, setSaved] = useState<ReadonlySet<string>>(new Set());
  const [loadState, setLoadState] = useState<LoadState>(
    mode === 'edit' && initial && loadTranslations ? 'loading' : 'idle',
  );
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const baseline = useRef<Record<string, CourseTranslationInput>>({});
  const loaderRef = useRef(loadTranslations);
  loaderRef.current = loadTranslations;
  const courseId = initial?.id;
  const editLocales = useMemo(() => {
    const extra = Array.from(saved).filter((l) => !locales.includes(l));
    return [...locales, ...extra];
  }, [locales, saved]);

  useEffect(() => {
    const load = loaderRef.current;
    if (!(mode === 'edit' && courseId && load)) return;
    let cancelled = false;
    setLoadState('loading');
    load(courseId).then((result) => {
      if (cancelled) return;
      if (!result.data) {
        setLoadState('error');
        setError(result.error ?? 'Could not load translations.');
        return;
      }
      const loaded = result.data.translations.filter((t) => t.locale !== DEFAULT_CONTENT_LOCALE);
      const next: Record<string, { title: string; description: string }> = {};
      const savedLocales = new Set<string>();
      for (const t of loaded) {
        next[t.locale] = { title: t.title, description: t.description ?? '' };
        baseline.current[t.locale] = { title: t.title, description: t.description };
        savedLocales.add(t.locale);
      }
      setValues((prev) => ({ ...prev, ...next }));
      setSaved(savedLocales);
      setLoadState('ready');
    });
    return () => {
      cancelled = true;
    };
  }, [mode, courseId]);

  const savedForTabs = useMemo(() => new Set([...saved, DEFAULT_CONTENT_LOCALE]), [saved]);
  const disabledLocales = useMemo(
    () =>
      loadState === 'loading' || loadState === 'error'
        ? new Set(editLocales.filter((l) => l !== DEFAULT_CONTENT_LOCALE))
        : undefined,
    [loadState, editLocales],
  );

  function handleChange(locale: string, field: 'title' | 'description', value: string) {
    setValues((prev) => ({ ...prev, [locale]: { ...(prev[locale] ?? EMPTY), [field]: value } }));
    setFieldErrors((prev) => {
      if (!prev[locale]) return prev;
      const { [locale]: _removed, ...rest } = prev;
      return rest;
    });
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!values[DEFAULT_CONTENT_LOCALE].title.trim()) errors[DEFAULT_CONTENT_LOCALE] = 'Title is required.';
    for (const locale of editLocales) {
      if (locale === DEFAULT_CONTENT_LOCALE) continue;
      const v = values[locale] ?? EMPTY;
      if (!v.title.trim() && v.description.trim()) {
        errors[locale] = `${getLocaleMeta(locale).label} title is required when a description is entered.`;
      }
    }
    if (slug.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) {
      errors.slug = 'Lowercase letters, numbers, and hyphens only.';
    }
    setFieldErrors(errors);
    const firstLocaleError = editLocales.find((l) => errors[l]);
    if (firstLocaleError) setActiveLocale(firstLocaleError);
    return Object.keys(errors).length === 0;
  }

  function collectTranslations(): Record<string, CourseTranslationInput> {
    const out: Record<string, CourseTranslationInput> = {};
    if (loadState === 'error' || loadState === 'loading') return out;
    for (const locale of editLocales) {
      if (locale === DEFAULT_CONTENT_LOCALE) continue;
      const v = values[locale] ?? EMPTY;
      const title = v.title.trim();
      if (!title) continue;
      const description = v.description.trim() || null;
      const before = baseline.current[locale];
      if (before && before.title === title && (before.description ?? null) === description) continue;
      out[locale] = { title, description };
    }
    return out;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setError(null);
    const en = values[DEFAULT_CONTENT_LOCALE];
    startTransition(async () => {
      const result = await onSubmit({
        title: en.title.trim(),
        slug: slug.trim() || null,
        description: en.description.trim() || null,
        translations: collectTranslations(),
      });
      if (result.error) setError(result.error);
    });
  }

  async function confirmRemove(locale: string) {
    if (!initial || !onRemoveTranslation) return;
    setRemoving(true);
    setError(null);
    const result = await onRemoveTranslation(initial.id, locale);
    setRemoving(false);
    setPendingRemove(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    delete baseline.current[locale];
    setSaved((prev) => {
      const next = new Set(prev);
      next.delete(locale);
      return next;
    });
    setValues((prev) => ({ ...prev, [locale]: { ...EMPTY } }));
  }

  const busy = isPending || removing;

  return (
    <div className="cf-card">
      <div className="cf-header">
        <h2 className="cf-title">{mode === 'create' ? 'New Course' : 'Edit Course'}</h2>
        <button type="button" className="cf-close" onClick={onCancel} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {error && <div className="admin-error-banner" role="alert">{error}</div>}
      {loadState === 'loading' && <div className="cf-hint" role="status">Loading translations…</div>}

      <form onSubmit={handleSubmit} className="cf-form">
        <div className="cf-field">
          <label htmlFor="cf-slug" className="cf-label">Slug</label>
          <input
            id="cf-slug" type="text" value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. english-for-beginners"
            disabled={busy} maxLength={255}
            className={`cf-input ${fieldErrors.slug ? 'cf-input--error' : ''}`}
          />
          <span className="cf-hint">Optional. Lowercase, hyphens only. Must be unique. Shared by every language.</span>
          {fieldErrors.slug && <span className="cf-error">{fieldErrors.slug}</span>}
        </div>

        <TranslationFields
          idPrefix="cf"
          locales={editLocales}
          values={values}
          savedLocales={savedForTabs}
          fieldLabels={COURSE_FIELD_LABELS}
          activeLocale={activeLocale}
          onActiveLocaleChange={setActiveLocale}
          onChange={handleChange}
          errors={fieldErrors}
          disabled={busy}
          disabledLocales={disabledLocales}
          onRemove={onRemoveTranslation ? setPendingRemove : undefined}
          pendingRemoveLocale={pendingRemove}
          onConfirmRemove={confirmRemove}
          onCancelRemove={() => setPendingRemove(null)}
        />

        <div className="cf-actions">
          <button type="submit" disabled={busy} className="cf-submit">
            {isPending ? 'Saving…' : mode === 'create' ? 'Create Course' : 'Save Changes'}
          </button>
          <button type="button" onClick={onCancel} disabled={busy} className="cf-cancel">Cancel</button>
        </div>
      </form>

      <style>{`
        .cf-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 24px; max-width: 560px;
        }
        .cf-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .cf-title { margin: 0; font-size: 18px; font-weight: 700; color: var(--text-primary); }
        .cf-close {
          background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;
          border-radius: var(--radius-sm);
        }
        .cf-close:hover { color: var(--text-primary); }
        .cf-form { display: flex; flex-direction: column; gap: 16px; }
        .cf-field { display: flex; flex-direction: column; gap: 4px; }
        .cf-label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
        .cf-req { color: var(--color-error-500); }
        .cf-input, .cf-textarea {
          padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm);
          background: var(--surface); color: var(--text-primary);
          font-size: 14px; font-family: inherit;
        }
        .cf-input { height: 38px; }
        .cf-textarea { resize: vertical; min-height: 72px; }
        .cf-input:focus, .cf-textarea:focus {
          outline: none; border-color: var(--color-primary-500);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
        }
        .cf-input--error { border-color: var(--color-error-500); }
        .cf-hint { font-size: 12px; color: var(--text-muted); }
        .cf-error { font-size: 12px; color: var(--color-error-500); font-weight: 500; }
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
