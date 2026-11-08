import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext';
import { CheckIcon } from '../../../components/common/Icons';
import { getErrorMessage } from '../../../api/client';
import { useLearnerLevel } from '../../level/LevelContext';
import { vocabularyApi } from '../../learner/learnerApi';
import { wordOfTheDay } from './wordOfDayData';

/** Today's word with its meaning and a one-tap "Add to My Words". The word follows the learner's level and the date. */
export function WordOfDayWidget() {
  const { t, locale } = useI18n();
  const { band } = useLearnerLevel();
  const entry = useMemo(() => wordOfTheDay(band, new Date()), [band]);
  const meaning = locale === 'ar' ? entry.ar : entry.en;

  // 'checking' until we know whether the word is already in My Words, so the button never flashes the wrong state.
  const [state, setState] = useState<'checking' | 'idle' | 'saving' | 'saved'>('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setState('checking');
    vocabularyApi.list()
      .then((r) => { if (!cancelled) setState(r.words.some((w) => w.word.trim().toLowerCase() === entry.word) ? 'saved' : 'idle'); })
      .catch(() => { if (!cancelled) setState('idle'); });
    return () => { cancelled = true; };
  }, [entry.word]);

  async function add() {
    setState('saving');
    setError('');
    try {
      await vocabularyApi.save({ word: entry.word, meaning, context: entry.example, source: 'manual' });
      setState('saved');
    } catch (e) {
      setError(getErrorMessage(e, t('Could not save this word.')));
      setState('idle');
    }
  }

  function listen() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(entry.word);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  }
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const pill = 'inline-flex h-14 shrink-0 items-center justify-center rounded-full px-8 text-base font-semibold no-underline transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand dark:focus-visible:ring-ink-inverse dark:focus-visible:ring-offset-white';

  return (
    <section aria-label={t('Word of the day')} className="relative overflow-hidden rounded-2xl bg-brand p-6 text-white dark:bg-white dark:text-ink-inverse sm:p-8">
      <div className="flex h-full flex-col justify-between gap-8">
        <div className="min-w-0">
          <p className="m-0 text-sm font-medium text-white dark:text-ink-inverse/70">{t('Word of the day')}</p>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p dir="ltr" className="lp-display m-0 text-[2rem] font-semibold [overflow-wrap:anywhere] [unicode-bidi:plaintext] sm:text-[2.75rem]">{entry.word}</p>
            <span className="text-sm text-white dark:text-ink-inverse/70">{t(entry.pos)}</span>
            {canSpeak && (
              <button type="button" onClick={listen} className="rounded border-0 bg-transparent p-0 text-sm font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white dark:text-ink-inverse dark:decoration-ink-inverse/40 dark:hover:decoration-ink-inverse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white dark:focus-visible:ring-ink-inverse">
                {t('Listen')}
              </button>
            )}
          </div>
          <p className="m-0 mt-3 text-base text-white dark:text-ink-inverse/70 [unicode-bidi:plaintext]">{meaning}</p>
          <p dir="ltr" className="m-0 mt-2 text-sm italic text-white dark:text-ink-inverse/70">“{entry.example}”</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {state === 'saved' ? (
            <span role="status" className="inline-flex h-14 items-center gap-2 rounded-full px-7 text-base font-semibold text-white ring-1 ring-white/50 dark:text-ink-inverse dark:ring-ink-inverse/30">
              <CheckIcon className="size-5" /> {t('Added to my words')}
            </span>
          ) : (
            <button type="button" onClick={add} disabled={state === 'saving' || state === 'checking'} className={`${pill} cursor-pointer border-0 bg-white text-brand hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-ink-inverse dark:text-ink dark:hover:opacity-90`}>
              {state === 'saving' ? t('Saving…') : t('Add to my words')}
            </button>
          )}
        </div>
        {error && <p role="alert" className="m-0 -mt-4 text-sm font-bold text-white dark:text-ink-inverse">{error}</p>}
      </div>
    </section>
  );
}
