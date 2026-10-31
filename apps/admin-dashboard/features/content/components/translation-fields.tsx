'use client';

import { useRef } from 'react';
import {
  DEFAULT_CONTENT_LOCALE,
  getLocaleMeta,
  type TranslatableFieldLabels,
} from '../config/content-locales';

export type TranslationValue = {
  readonly title: string;
  readonly description: string;
};

export type TranslationValues = Readonly<Record<string, TranslationValue>>;

type Props = {
  readonly idPrefix: string;
  readonly locales: readonly string[];
  readonly values: TranslationValues;
  readonly savedLocales: ReadonlySet<string>;
  readonly fieldLabels: Readonly<Record<string, TranslatableFieldLabels>>;
  readonly activeLocale: string;
  readonly onActiveLocaleChange: (locale: string) => void;
  readonly onChange: (locale: string, field: keyof TranslationValue, value: string) => void;
  readonly errors?: Readonly<Record<string, string | undefined>>;
  readonly disabledLocales?: ReadonlySet<string>;
  readonly disabled?: boolean;
  readonly defaultLocale?: string;
  readonly titleMaxLength?: number;
  readonly descriptionMaxLength?: number;
  readonly onRemove?: (locale: string) => void;
  readonly pendingRemoveLocale?: string | null;
  readonly onConfirmRemove?: (locale: string) => void;
  readonly onCancelRemove?: () => void;
};

export function TranslationFields({
  idPrefix,
  locales,
  values,
  savedLocales,
  fieldLabels,
  activeLocale,
  onActiveLocaleChange,
  onChange,
  errors = {},
  disabledLocales,
  disabled = false,
  defaultLocale = DEFAULT_CONTENT_LOCALE,
  titleMaxLength = 255,
  descriptionMaxLength = 2000,
  onRemove,
  pendingRemoveLocale = null,
  onConfirmRemove,
  onCancelRemove,
}: Props) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function moveFocus(from: string, step: number) {
    const index = locales.indexOf(from);
    const next = locales[(index + step + locales.length) % locales.length];
    onActiveLocaleChange(next);
    tabRefs.current[next]?.focus();
  }

  function onTabKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, locale: string) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      moveFocus(locale, 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      moveFocus(locale, -1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      moveFocus(locales[0], 0);
    } else if (e.key === 'End') {
      e.preventDefault();
      moveFocus(locales[locales.length - 1], 0);
    }
  }

  return (
    <div className="tf-root">
      <div className="tf-tabs" role="tablist" aria-label="Content language">
        {locales.map((locale) => {
          const meta = getLocaleMeta(locale);
          const value = values[locale];
          const saved = savedLocales.has(locale);
          const hasContent = Boolean(value && (value.title.trim() || value.description.trim()));
          const status = saved ? null : hasContent ? 'Unsaved' : 'Missing';
          const hasError = Boolean(errors[locale]);
          return (
            <button
              key={locale}
              ref={(el) => {
                tabRefs.current[locale] = el;
              }}
              id={`${idPrefix}-tab-${locale}`}
              type="button"
              role="tab"
              aria-selected={activeLocale === locale}
              aria-controls={`${idPrefix}-panel-${locale}`}
              tabIndex={activeLocale === locale ? 0 : -1}
              onClick={() => onActiveLocaleChange(locale)}
              onKeyDown={(e) => onTabKeyDown(e, locale)}
              className={`tf-tab ${activeLocale === locale ? 'tf-tab--active' : ''} ${hasError ? 'tf-tab--error' : ''}`}
            >
              <span>{meta.nativeLabel}</span>
              {status && (
                <span className={`tf-badge ${status === 'Missing' ? 'tf-badge--missing' : 'tf-badge--unsaved'}`}>
                  {status}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {locales.map((locale) => {
        const meta = getLocaleMeta(locale);
        const labels = fieldLabels[locale] ?? fieldLabels[defaultLocale];
        const value = values[locale] ?? { title: '', description: '' };
        const isDefault = locale === defaultLocale;
        const fieldDisabled = disabled || Boolean(disabledLocales?.has(locale));
        const error = errors[locale];
        const canRemove = !isDefault && savedLocales.has(locale) && onRemove;
        return (
          <div
            key={locale}
            id={`${idPrefix}-panel-${locale}`}
            role="tabpanel"
            aria-labelledby={`${idPrefix}-tab-${locale}`}
            hidden={activeLocale !== locale}
            className="tf-panel"
          >
            <div className="tf-field">
              <label htmlFor={`${idPrefix}-title-${locale}`} className="tf-label" dir={meta.dir} lang={locale}>
                {labels.title}
                {isDefault && <span className="tf-req"> *</span>}
              </label>
              <input
                id={`${idPrefix}-title-${locale}`}
                type="text"
                dir={meta.dir}
                lang={locale}
                value={value.title}
                onChange={(e) => onChange(locale, 'title', e.target.value)}
                placeholder={labels.titlePlaceholder}
                disabled={fieldDisabled}
                maxLength={titleMaxLength}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${idPrefix}-error-${locale}` : undefined}
                className={`tf-input ${error ? 'tf-input--error' : ''}`}
              />
              {error && (
                <span id={`${idPrefix}-error-${locale}`} className="tf-error">
                  {error}
                </span>
              )}
            </div>

            <div className="tf-field">
              <label htmlFor={`${idPrefix}-description-${locale}`} className="tf-label" dir={meta.dir} lang={locale}>
                {labels.description}
              </label>
              <textarea
                id={`${idPrefix}-description-${locale}`}
                dir={meta.dir}
                lang={locale}
                value={value.description}
                onChange={(e) => onChange(locale, 'description', e.target.value)}
                placeholder={labels.descriptionPlaceholder}
                disabled={fieldDisabled}
                rows={3}
                maxLength={descriptionMaxLength}
                className="tf-textarea"
              />
            </div>

            {!isDefault && !savedLocales.has(locale) && (
              <span className="tf-hint">
                No {meta.label} translation yet. Students using {meta.label} see the English text until one is saved.
              </span>
            )}

            {canRemove && pendingRemoveLocale !== locale && (
              <button type="button" className="tf-remove" disabled={fieldDisabled} onClick={() => onRemove?.(locale)}>
                Remove {meta.label} translation
              </button>
            )}
            {canRemove && pendingRemoveLocale === locale && (
              <div className="tf-confirm" role="alert">
                <span>Remove the {meta.label} translation? Students will see English instead.</span>
                <button type="button" className="tf-remove tf-remove--confirm" onClick={() => onConfirmRemove?.(locale)}>
                  Confirm remove
                </button>
                <button type="button" className="tf-cancel" onClick={() => onCancelRemove?.()}>
                  Keep
                </button>
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        .tf-root { display: flex; flex-direction: column; gap: 14px; }
        .tf-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
        .tf-tab {
          display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border: none; background: none;
          cursor: pointer; font-size: 13px; font-weight: 600; color: var(--text-muted); font-family: inherit;
          border-bottom: 2px solid transparent; margin-bottom: -1px;
        }
        .tf-tab:hover { color: var(--text-primary); }
        .tf-tab:focus-visible { outline: 2px solid var(--color-primary-500); outline-offset: 2px; border-radius: var(--radius-sm); }
        .tf-tab--active { color: var(--color-primary-500); border-bottom-color: var(--color-primary-500); }
        .tf-tab--error { color: var(--color-error-500); }
        .tf-badge { font-size: 11px; font-weight: 600; padding: 1px 7px; border-radius: 10px; }
        .tf-badge--missing { background: color-mix(in srgb, var(--color-warning-500, #f59e0b) 18%, transparent); color: var(--text-secondary); }
        .tf-badge--unsaved { background: color-mix(in srgb, var(--color-primary-500) 14%, transparent); color: var(--color-primary-500); }
        .tf-panel { display: flex; flex-direction: column; gap: 14px; }
        .tf-panel[hidden] { display: none; }
        .tf-field { display: flex; flex-direction: column; gap: 4px; }
        .tf-label { font-size: 13px; font-weight: 500; color: var(--text-secondary); text-align: start; }
        .tf-req { color: var(--color-error-500); }
        .tf-input, .tf-textarea {
          padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm);
          background: var(--surface); color: var(--text-primary); font-size: 14px; font-family: inherit; text-align: start;
        }
        .tf-input { height: 38px; }
        .tf-textarea { resize: vertical; min-height: 72px; }
        .tf-input:focus, .tf-textarea:focus {
          outline: none; border-color: var(--color-primary-500);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
        }
        .tf-input:disabled, .tf-textarea:disabled { opacity: 0.6; cursor: not-allowed; }
        .tf-input--error { border-color: var(--color-error-500); }
        .tf-error { font-size: 12px; color: var(--color-error-500); font-weight: 500; }
        .tf-hint { font-size: 12px; color: var(--text-muted); }
        .tf-remove {
          align-self: flex-start; background: none; border: 1px solid var(--color-error-500); color: var(--color-error-500);
          border-radius: var(--radius-md); padding: 6px 12px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit;
        }
        .tf-remove:disabled { opacity: 0.5; cursor: not-allowed; }
        .tf-remove--confirm { background: var(--color-error-500); color: white; }
        .tf-cancel {
          background: none; border: 1px solid var(--border); color: var(--text-secondary); border-radius: var(--radius-md);
          padding: 6px 12px; font-size: 12px; cursor: pointer; font-family: inherit;
        }
        .tf-confirm { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }
      `}</style>
    </div>
  );
}
