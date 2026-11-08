import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { getErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/common/ErrorState';
import { QuestionSkeleton } from '../../components/common/Skeleton';
import { vocabularyApi, type SavedWord } from './learnerApi';
import { CheckIcon } from '../../components/common/Icons';
import { CrossIcon, PILL_PRIMARY, PILL_SECONDARY, SessionComplete, SessionProgress } from './sessionUi';

/** One card at a time: see the word, try to recall, flip, then say whether you knew it. */
export function FlashcardReview({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const [cards, setCards] = useState<SavedWord[] | null>(null);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    vocabularyApi.due().then((r) => setCards(r.cards)).catch((e) => setError(getErrorMessage(e, t('Could not load your words'))));
  }, [t]);

  const card = cards?.[index];
  const answer = useCallback(async (correct: boolean) => {
    if (!card) return;
    setBusy(true);
    try { await vocabularyApi.review(card.id, correct); } catch { /* the next sync will reschedule it */ }
    setKnown((k) => k + (correct ? 1 : 0));
    setFlipped(false);
    setIndex((i) => i + 1);
    setBusy(false);
  }, [card]);

  // Keyboard: Space flips, 1 = not yet, 2 = I knew it.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || busy || !card) return;
      if (e.key === ' ' && tag !== 'BUTTON') { e.preventDefault(); setFlipped((f) => !f); }
      else if (flipped && e.key === '1') void answer(false);
      else if (flipped && e.key === '2') void answer(true);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [card, flipped, busy, answer]);

  if (error) return <ErrorState message={error} onRetry={onDone} />;
  if (!cards) return <QuestionSkeleton />;

  if (cards.length === 0 || index >= cards.length || !card) {
    return (
      <SessionComplete
        title={t('Review complete')}
        score={known}
        total={cards.length}
        summary={cards.length === 0 ? t('No words are due right now.') : known === cards.length ? t('You knew every word. Great memory.') : t('You knew {known} of {total}.', { known, total: cards.length })}
      >
        <button type="button" onClick={onDone} className={PILL_PRIMARY}>{t('Back to My words')}</button>
      </SessionComplete>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onDone} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border-0 bg-transparent px-4 text-sm font-semibold text-ink-soft ring-1 ring-line-strong transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <CrossIcon className="size-3.5" />{t('Close')}
        </button>
        <span className="lp-num text-sm font-semibold text-ink-muted">{index + 1} / {cards.length}</span>
      </div>
      <SessionProgress done={index} total={cards.length} label={t('Review progress')} text={flipped ? t('Did you know it?') : t('What does this mean?')} />

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? t('Show the word') : `${card.word}: ${t('Tap to flip')}`}
        className={`flex min-h-80 w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-0 p-8 text-center ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${flipped ? 'bg-brand-soft ring-brand' : 'bg-surface ring-line hover:ring-line-strong'}`}
      >
        {!flipped ? (
          <>
            <span className="text-sm font-semibold text-ink-muted">{t('Word')}</span>
            <span className="lp-display text-[2.5rem] font-semibold leading-tight text-ink [overflow-wrap:anywhere] [unicode-bidi:plaintext] sm:text-5xl">{card.word}</span>
            <span className="mt-2 text-sm text-ink-muted">{t('Tap to flip')}</span>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-brand-ink">{card.word}</span>
            {card.meaning
              ? <span className="lp-display text-[2rem] font-semibold leading-snug text-ink [overflow-wrap:anywhere] [unicode-bidi:plaintext] sm:text-4xl">{card.meaning}</span>
              : <span className="text-base text-ink-muted">{t('No meaning saved.')}</span>}
            {card.context && <span className="max-w-md text-base italic text-ink-soft [unicode-bidi:plaintext]">“{card.context}”</span>}
            {!card.meaning && (
              <Link to={`/ai-teacher?ask=${encodeURIComponent(card.word)}`} onClick={(e) => e.stopPropagation()}
                className="text-sm font-semibold text-brand-ink underline underline-offset-4">{t('Ask AI Teacher')}</Link>
            )}
          </>
        )}
      </button>

      {flipped ? (
        <div className="grid grid-cols-2 gap-3">
          <button type="button" disabled={busy} onClick={() => void answer(false)} className={PILL_SECONDARY}>
            <CrossIcon className="size-3.5" />{t('Not yet')}
          </button>
          <button type="button" disabled={busy} onClick={() => void answer(true)} className={PILL_PRIMARY}>
            <CheckIcon className="size-4" />{t('I knew it')}
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setFlipped(true)} className={`${PILL_PRIMARY} w-full`}>{t('Show the meaning')}</button>
      )}
      <p className="m-0 hidden text-center text-xs text-ink-muted md:block">{t('Shortcuts: Space flips · 1 not yet · 2 I knew it')}</p>
    </div>
  );
}
