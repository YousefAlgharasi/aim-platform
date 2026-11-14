import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext';
import { CheckIcon } from '../../../components/common/Icons';
import { getErrorMessage } from '../../../api/client';
import { useLearnerLevel } from '../../level/LevelContext';
import { vocabularyApi } from '../../learner/learnerApi';
import { wordOfTheDay } from './wordOfDayData';

const POS_SHORT: Record<string, string> = { noun: 'n.', verb: 'v.', adjective: 'adj.', adverb: 'adv.', preposition: 'prep.', conjunction: 'conj.', pronoun: 'pron.', phrase: 'phr.' };

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

  const pill = 'inline-flex h-14 shrink-0 items-center justify-center rounded-full px-8 text-base font-semibold no-underline transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand';

  return (
    <section data-tour="word-of-day" aria-label={t('Word of the day')} className="relative overflow-hidden rounded-2xl bg-brand p-6 text-white sm:p-8">
      <div className="flex h-full flex-col justify-between gap-8">
        <div className="min-w-0">
          <p className="m-0 text-sm font-medium text-white">{t('Word of the day')}</p>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p dir="ltr" className="lp-display m-0 text-[2rem] font-semibold [overflow-wrap:anywhere] [unicode-bidi:plaintext] sm:text-[2.75rem]">{entry.word}</p>
            <span className="text-sm italic text-white" title={entry.pos}>{locale === 'ar' ? t(entry.pos) : (POS_SHORT[entry.pos] ?? entry.pos)}</span>
            {canSpeak && (
              <button type="button" onClick={listen} aria-label={t('Listen')} title={t('Listen')} className="inline-flex size-9 cursor-pointer items-center justify-center self-center rounded-full border-0 bg-white/15 p-0 text-white transition hover:bg-white/25 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>
              </button>
            )}
          </div>
          <p className="m-0 mt-3 text-base text-white [unicode-bidi:plaintext]">{meaning}</p>
          <p dir="ltr" className="m-0 mt-2 text-sm italic text-white">“{entry.example}”</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {state === 'saved' ? (
            <span role="status" className="inline-flex h-14 items-center gap-2 rounded-full px-7 text-base font-semibold text-white ring-1 ring-white/50">
              <CheckIcon className="size-5" /> {t('Added to my words')}
            </span>
          ) : (
            <button type="button" onClick={add} disabled={state === 'saving' || state === 'checking'} className={`${pill} cursor-pointer border-0 bg-white text-brand hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70`}>
              {state === 'saving' ? t('Saving…') : t('Add to my words')}
            </button>
          )}
        </div>
        {error && <p role="alert" className="m-0 -mt-4 text-sm font-bold text-white">{error}</p>}
      </div>
    </section>
  );
}
