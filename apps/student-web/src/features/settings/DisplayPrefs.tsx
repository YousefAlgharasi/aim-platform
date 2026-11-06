import { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { readDisplayPrefs, saveDisplayPrefs, type FontScale } from '../../state/displayPrefs';

const SIZES: Array<{ id: FontScale; label: string; sample: string }> = [
  { id: 'default', label: 'Default', sample: 'text-sm' },
  { id: 'large', label: 'Large', sample: 'text-base' },
  { id: 'xlarge', label: 'Extra large', sample: 'text-lg' },
];

/** Text size and reduced motion, remembered on this device. */
export function DisplayPrefs() {
  const { t } = useI18n();
  const [prefs, setPrefs] = useState(readDisplayPrefs);
  const update = (next: typeof prefs) => { setPrefs(next); saveDisplayPrefs(next); };

  return (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label={t('Text size')} className="grid grid-cols-3 gap-2">
        {SIZES.map((s) => (
          <button key={s.id} type="button" role="radio" aria-checked={prefs.fontScale === s.id}
            onClick={() => update({ ...prefs, fontScale: s.id })}
            className={`h-12 cursor-pointer rounded-2xl border-0 font-bold ring-1 transition-colors ${s.sample} ${
              prefs.fontScale === s.id ? 'bg-brand-soft text-brand-ink ring-brand' : 'bg-surface text-ink ring-line hover:ring-line-strong'}`}>
            {t(s.label)}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-bold text-ink">{t('Reduce motion')}</span>
        <button type="button" role="switch" aria-checked={prefs.reduceMotion} aria-label={t('Reduce motion')}
          onClick={() => update({ ...prefs, reduceMotion: !prefs.reduceMotion })}
          className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full border-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${prefs.reduceMotion ? 'bg-brand' : 'bg-line-strong'}`}>
          <span aria-hidden="true" className={`absolute top-0.5 start-0.5 size-6 rounded-full bg-white transition-transform ${prefs.reduceMotion ? 'ltr:translate-x-5 rtl:-translate-x-5' : ''}`} />
        </button>
      </div>
    </div>
  );
}
