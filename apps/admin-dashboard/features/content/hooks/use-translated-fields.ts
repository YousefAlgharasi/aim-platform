'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CONTENT_LOCALE_CODES, DEFAULT_CONTENT_LOCALE, getLocaleMeta } from '../config/content-locales';
import type { TranslationInput } from '../api/admin-translations-api';
import type { TranslationValues } from '../components/translation-fields';

export type TranslationsLoadResult = {
  data?: {
    translations: readonly { locale: string; title: string; description: string | null }[];
  };
  error?: string;
};

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

type Options = {
  readonly mode: 'create' | 'edit';
  readonly entityId?: string;
  readonly initialTitle: string;
  readonly initialDescription: string;
  readonly locales?: readonly string[];
  readonly load?: (id: string) => Promise<TranslationsLoadResult>;
  readonly remove?: (id: string, locale: string) => Promise<{ error?: string }>;
};

type ValidateOptions = {
  readonly requireDefaultDescription?: boolean;
  readonly extraErrors?: Readonly<Record<string, string>>;
};

const EMPTY = { title: '', description: '' };

function buildInitialValues(
  locales: readonly string[],
  title: string,
  description: string,
): TranslationValues {
  const values: Record<string, { title: string; description: string }> = {};
  for (const locale of locales) values[locale] = { ...EMPTY };
  values[DEFAULT_CONTENT_LOCALE] = { title, description };
  return values;
}

export function useTranslatedFields({
  mode,
  entityId,
  initialTitle,
  initialDescription,
  locales = CONTENT_LOCALE_CODES,
  load,
  remove,
}: Options) {
  const [values, setValues] = useState<TranslationValues>(() =>
    buildInitialValues(locales, initialTitle, initialDescription),
  );
  const [activeLocale, setActiveLocale] = useState(DEFAULT_CONTENT_LOCALE);
  const [saved, setSaved] = useState<ReadonlySet<string>>(new Set());
  const [loadState, setLoadState] = useState<LoadState>(
    mode === 'edit' && entityId && load ? 'loading' : 'idle',
  );
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [descriptionErrors, setDescriptionErrors] = useState<Record<string, string>>({});
  const baseline = useRef<Record<string, TranslationInput>>({});
  const loaderRef = useRef(load);
  loaderRef.current = load;

  const editLocales = useMemo(() => {
    const extra = Array.from(saved).filter((l) => !locales.includes(l));
    return [...locales, ...extra];
  }, [locales, saved]);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!(mode === 'edit' && entityId && loader)) return;
    let cancelled = false;
    setLoadState('loading');
    loader(entityId).then((result) => {
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
  }, [mode, entityId]);

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
    if (field === 'description') {
      setDescriptionErrors((prev) => {
        if (!prev[locale]) return prev;
        const { [locale]: _removed, ...rest } = prev;
        return rest;
      });
    }
  }

  function validate({ requireDefaultDescription = false, extraErrors = {} }: ValidateOptions = {}): boolean {
    const titleErrors: Record<string, string> = {};
    const descErrors: Record<string, string> = {};
    const en = values[DEFAULT_CONTENT_LOCALE] ?? EMPTY;
    if (!en.title.trim()) titleErrors[DEFAULT_CONTENT_LOCALE] = 'Title is required.';
    if (requireDefaultDescription && !en.description.trim()) {
      descErrors[DEFAULT_CONTENT_LOCALE] = 'Description is required.';
    }
    for (const locale of editLocales) {
      if (locale === DEFAULT_CONTENT_LOCALE) continue;
      const v = values[locale] ?? EMPTY;
      if (!v.title.trim() && v.description.trim()) {
        titleErrors[locale] = `${getLocaleMeta(locale).label} title is required when a description is entered.`;
      }
    }
    setFieldErrors({ ...titleErrors, ...extraErrors });
    setDescriptionErrors(descErrors);
    const firstLocaleError = editLocales.find((l) => titleErrors[l] || descErrors[l]);
    if (firstLocaleError) setActiveLocale(firstLocaleError);
    return (
      Object.keys(titleErrors).length === 0 &&
      Object.keys(descErrors).length === 0 &&
      Object.keys(extraErrors).length === 0
    );
  }

  function collectTranslations(): Record<string, TranslationInput> {
    const out: Record<string, TranslationInput> = {};
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

  async function confirmRemove(locale: string) {
    if (!entityId || !remove) return;
    setRemoving(true);
    setError(null);
    const result = await remove(entityId, locale);
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

  return {
    values,
    editLocales,
    activeLocale,
    setActiveLocale,
    savedForTabs,
    disabledLocales,
    loadState,
    pendingRemove,
    setPendingRemove,
    removing,
    error,
    setError,
    fieldErrors,
    setFieldErrors,
    descriptionErrors,
    handleChange,
    validate,
    collectTranslations,
    confirmRemove,
    english: values[DEFAULT_CONTENT_LOCALE] ?? EMPTY,
    canRemove: Boolean(remove),
  };
}
