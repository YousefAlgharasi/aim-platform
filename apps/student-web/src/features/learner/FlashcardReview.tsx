import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { ErrorState } from '../../components/common/ErrorState';
import { QuestionSkeleton } from '../../components/common/Skeleton';
import { vocabularyApi, type SavedWord } from './learnerApi';

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
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-10 text-center">
        <div className="grid size-20 place-items-center rounded-3xl bg-success text-4xl text-white shadow-xl shadow-success/30">✓</div>
        <h1 className="m-0 text-2xl font-extrabold tracking-tight text-ink">{t('Review complete')}</h1>
        {cards.length > 0 && <p className="m-0 text-ink-muted">{t('You knew {known} of {total}.', { known, total: cards.length })}</p>}
        <Button onClick={onDone}>{t('Back to My words')}</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onDone} className="min-h-10 cursor-pointer rounded-xl border-0 bg-control px-4 text-sm font-bold text-ink-soft hover:bg-brand-soft hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">{t('Close')}</button>
        <span className="text-sm font-extrabold tabular-nums text-ink-muted">{index + 1} / {cards.length}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-control ring-1 ring-inset ring-line" role="progressbar"
        aria-valuemin={0} aria-valuemax={cards.length} aria-valuenow={index} aria-label={t('Review progress')}>
        <div className="h-full rounded-full bg-gradient-to-r from-brand to-secondary transition-all duration-300" style={{ width: `${(index / cards.length) * 100}%` }} />
      </div>
      <button type="button" onClick={() => setFlipped((f) => !f)} aria-label={flipped ? t('Show the word') : t('Show the meaning')}
        className="flex min-h-72 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-0 bg-surface p-8 text-center shadow-card ring-1 ring-line transition-colors hover:ring-brand-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        {!flipped ? (
          <>
            <span className="text-xs font-bold text-ink-muted">{t('What does this mean?')}</span>
            <span className="text-3xl font-extrabold tracking-tight text-ink [unicode-bidi:plaintext]">{card.word}</span>
            <span className="text-xs text-ink-muted">{t('Tap to flip')}</span>
          </>
        ) : (
          <>
            {card.meaning
              ? <span className="text-2xl font-extrabold text-ink [unicode-bidi:plaintext]">{card.meaning}</span>
              : <span className="text-sm text-ink-muted">{t('No meaning saved.')}</span>}
            {card.context && <span className="text-sm italic text-ink-soft [unicode-bidi:plaintext]">{card.context}</span>}
            {!card.meaning && (
              <Link to={`/ai-teacher?ask=${encodeURIComponent(card.word)}`} onClick={(e) => e.stopPropagation()}
                className="text-sm font-bold text-brand-ink">{t('Ask AI Teacher')}</Link>
            )}
          </>
        )}
      </button>
      {flipped ? (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" size="lg" disabled={busy} onClick={() => void answer(false)}>{t('Not yet')}</Button>
          <Button size="lg" disabled={busy} onClick={() => void answer(true)}>{t('I knew it')}</Button>
        </div>
      ) : (
        <Button variant="secondary" size="lg" onClick={() => setFlipped(true)}>{t('Show the meaning')}</Button>
      )}
      <p className="m-0 hidden text-center text-xs text-ink-muted md:block">{t('Shortcuts: Space flips · 1 not yet · 2 I knew it')}</p>
    </div>
  );
}
