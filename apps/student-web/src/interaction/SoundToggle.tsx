import { useI18n } from '../i18n/I18nContext';
import { useSoundSetting } from './hooks';
import { playSound } from './sound';

function SpeakerGlyph({ on }: { on: boolean }) {
  return (
    <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5z" />
      {on ? (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </>
      ) : (
        <path d="m16 9 5 6m0-6-5 6" />
      )}
    </svg>
  );
}

function toggle(on: boolean, set: (next: boolean) => void) {
  set(!on);
  // A short preview confirms the choice; the click is the gesture that lets the browser start audio.
  if (!on) window.setTimeout(() => playSound('correct'), 60);
}

/** Settings row: a labelled switch for the optional UI sound effects. */
export function SoundSwitch() {
  const { t } = useI18n();
  const [on, set] = useSoundSetting();
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-bold text-ink">{t('Sound effects')}</span>
      <button type="button" role="switch" aria-checked={on} aria-label={t('Sound effects')}
        onClick={() => toggle(on, set)}
        className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full border-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 ${on ? 'bg-brand' : 'bg-line-strong'}`}>
        <span aria-hidden="true" className={`absolute top-0.5 start-0.5 size-6 rounded-full bg-white transition-transform ${on ? 'ltr:translate-x-5 rtl:-translate-x-5' : ''}`} />
      </button>
    </div>
  );
}

/** Compact icon toggle for learning screens (practice header). Same setting as the Settings switch. */
export function SoundToggleButton({ className = '' }: { className?: string }) {
  const { t } = useI18n();
  const [on, set] = useSoundSetting();
  const label = on ? t('Turn sound effects off') : t('Turn sound effects on');
  return (
    <button type="button" aria-pressed={on} aria-label={label} title={label}
      onClick={() => toggle(on, set)}
      className={`grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent transition-colors hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${on ? 'text-brand-ink' : 'text-ink-muted'} ${className}`}>
      <SpeakerGlyph on={on} />
    </button>
  );
}
