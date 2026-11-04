import { fireEvent, render, screen } from '../test-utils';
import { useState } from 'react';
import { TranslationFields, type TranslationValues } from '../../features/content/components/translation-fields';
import { COURSE_FIELD_LABELS, getLocaleMeta, missingContentLocales } from '../../features/content/config/content-locales';

function Harness({
  saved = new Set<string>(['en']),
  initial,
}: {
  saved?: Set<string>;
  initial?: TranslationValues;
}) {
  const [values, setValues] = useState<TranslationValues>(
    initial ?? { en: { title: 'Basics', description: '' }, ar: { title: '', description: '' } },
  );
  const [active, setActive] = useState('en');
  return (
    <TranslationFields
      idPrefix="t"
      locales={['en', 'ar']}
      values={values}
      savedLocales={saved}
      fieldLabels={COURSE_FIELD_LABELS}
      activeLocale={active}
      onActiveLocaleChange={setActive}
      onChange={(locale, field, value) =>
        setValues((prev) => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }))
      }
    />
  );
}

describe('TranslationFields', () => {
  it('shows English and Arabic tabs with the localized field labels', () => {
    render(<Harness />);
    expect(screen.getByRole('tab', { name: /English/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /العربية/ })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByLabelText(/Course Title/)).toHaveAttribute('dir', 'ltr');
    expect(screen.getByLabelText('Course Description')).toHaveAttribute('lang', 'en');
  });

  it('marks the unsaved Arabic translation as missing', () => {
    render(<Harness />);
    expect(screen.getByRole('tab', { name: /العربية.*Missing/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /English/ })).not.toHaveTextContent('Missing');
  });

  it('switches to Arabic with right-to-left, Arabic-labelled inputs', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    const title = screen.getByLabelText('عنوان الدورة');
    expect(title).toHaveAttribute('dir', 'rtl');
    expect(title).toHaveAttribute('lang', 'ar');
    expect(screen.getByLabelText('وصف الدورة')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('tab', { name: /العربية/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('keeps typed values when switching languages and flags typed-but-unsaved text', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    fireEvent.change(screen.getByLabelText('عنوان الدورة'), { target: { value: 'أساسيات' } });
    fireEvent.click(screen.getByRole('tab', { name: /English/ }));
    fireEvent.click(screen.getByRole('tab', { name: /العربية.*Unsaved/ }));
    expect(screen.getByLabelText('عنوان الدورة')).toHaveValue('أساسيات');
  });

  it('supports arrow-key navigation between tabs', () => {
    render(<Harness />);
    const english = screen.getByRole('tab', { name: /English/ });
    english.focus();
    fireEvent.keyDown(english, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: /العربية/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('shows no missing badge once Arabic is saved, and offers removal only for non-default saved locales', () => {
    const onRemove = jest.fn();
    render(
      <TranslationFields
        idPrefix="t"
        locales={['en', 'ar']}
        values={{ en: { title: 'a', description: '' }, ar: { title: 'ب', description: '' } }}
        savedLocales={new Set(['en', 'ar'])}
        fieldLabels={COURSE_FIELD_LABELS}
        activeLocale="ar"
        onActiveLocaleChange={() => undefined}
        onChange={() => undefined}
        onRemove={onRemove}
      />,
    );
    expect(screen.queryByText('Missing')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Remove Arabic translation/ }));
    expect(onRemove).toHaveBeenCalledWith('ar');
    expect(screen.queryByRole('button', { name: /Remove English/ })).not.toBeInTheDocument();
  });

  it('shows a field error and disables locale inputs on request', () => {
    render(
      <TranslationFields
        idPrefix="t"
        locales={['en', 'ar']}
        values={{ en: { title: '', description: '' }, ar: { title: '', description: '' } }}
        savedLocales={new Set(['en'])}
        fieldLabels={COURSE_FIELD_LABELS}
        activeLocale="en"
        onActiveLocaleChange={() => undefined}
        onChange={() => undefined}
        errors={{ en: 'Title is required.' }}
        disabledLocales={new Set(['ar'])}
      />,
    );
    expect(screen.getByText('Title is required.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Course Title/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('عنوان الدورة')).toBeDisabled();
  });
});

describe('content locale config', () => {
  it('derives direction for known and unknown locales without code changes', () => {
    expect(getLocaleMeta('ar').dir).toBe('rtl');
    expect(getLocaleMeta('en').dir).toBe('ltr');
    expect(getLocaleMeta('fa-IR').dir).toBe('rtl');
    expect(getLocaleMeta('fr')).toMatchObject({ code: 'fr', dir: 'ltr' });
  });

  it('computes missing locales only when availability is known', () => {
    expect(missingContentLocales(['en'])).toEqual(['ar']);
    expect(missingContentLocales(['en', 'ar'])).toEqual([]);
    expect(missingContentLocales(undefined)).toEqual([]);
    expect(missingContentLocales([])).toEqual([]);
  });
});
