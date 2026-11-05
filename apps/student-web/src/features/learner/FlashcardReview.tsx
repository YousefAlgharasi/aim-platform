import { useEffect, useState } from 'react';
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

  if (error) return <ErrorState message={error} onRetry={onDone} />;
  if (!cards) return <QuestionSkeleton />;

  if (cards.length === 0 || index >= cards.length) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-10 text-center">
        <div className="pop-in grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-brand to-secondary text-4xl text-white shadow-xl shadow-brand/30">✓</div>
        <h1 className="m-0 text-2xl font-extrabold tracking-tight text-ink">{t('Review complete')}</h1>
        {cards.length > 0 && <p className="m-0 text-ink-muted">{t('You knew {known} of {total}.', { known, total: cards.length })}</p>}
        <Button onClick={onDone}>{t('Back to My words')}</Button>
      </div>
    );
  }

  const card = cards[index];
  async function answer(correct: boolean) {
    setBusy(true);
    try { await vocabularyApi.review(card.id, correct); } catch { /* the next sync will reschedule it */ }
    setKnown((k) => k + (correct ? 1 : 0));
    setFlipped(false);
    setIndex((i) => i + 1);
    setBusy(false);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="h-2.5 overflow-hidden rounded-full bg-control ring-1 ring-inset ring-line" role="progressbar"
        aria-valuemin={0} aria-valuemax={cards.length} aria-valuenow={index} aria-label={t('Review progress')}>
        <div className="h-full rounded-full bg-gradient-to-r from-brand to-secondary transition-all duration-300" style={{ width: `${(index / cards.length) * 100}%` }} />
      </div>
      <button type="button" onClick={() => setFlipped((f) => !f)} aria-label={flipped ? t('Show the word') : t('Show the meaning')}
        className="flex min-h-64 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-0 bg-surface p-6 text-center shadow-card ring-1 ring-line">
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
      <p className="m-0 text-center text-xs text-ink-muted tabular-nums">{index + 1} / {cards.length}</p>
    </div>
  );
}
