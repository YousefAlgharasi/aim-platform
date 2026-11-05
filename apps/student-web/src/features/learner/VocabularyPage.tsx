import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { ListSkeleton } from '../../components/common/Skeleton';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { Banner } from '../../components/common/Banner';
import { vocabularyApi, type SavedWord } from './learnerApi';
import { FlashcardReview } from './FlashcardReview';

export function VocabularyPage() {
  const { t, formatDate } = useI18n();
  const [words, setWords] = useState<SavedWord[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(() => {
    setError('');
    vocabularyApi.list()
      .then((r) => { setWords(r.words); setDueCount(r.dueCount); })
      .catch((e) => setError(getErrorMessage(e, t('Could not load your words'))))
      .finally(() => setLoading(false));
  }, [t]);
  useEffect(() => { load(); }, [load]);

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!word.trim()) return;
    setSaving(true); setFormError('');
    try {
      await vocabularyApi.save({ word, meaning: meaning || undefined, source: 'manual' });
      setWord(''); setMeaning(''); load();
    } catch (err) { setFormError(getErrorMessage(err, t('Could not save the word'))); }
    finally { setSaving(false); }
  }

  async function remove(id: string) {
    setWords((w) => w.filter((x) => x.id !== id));
    try { await vocabularyApi.remove(id); load(); } catch { load(); }
  }

  if (loading) return <ListSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (reviewing) return <FlashcardReview onDone={() => { setReviewing(false); load(); }} />;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <PageTitleBar title={t('My words')} subtitle={t('Words you saved while learning, ready to review.')} />

      <div className="hero-surface relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-secondary p-5 text-white shadow-xl shadow-brand/25 sm:p-6">
        <p className="m-0 text-sm font-bold text-on-brand">{t('Today’s review')}</p>
        <p className="m-0 mt-1 text-3xl font-extrabold tabular-nums">{dueCount === 0 ? t('All caught up') : t('{n} words due', { n: dueCount })}</p>
        <div className="mt-4">
          <Button onClick={() => setReviewing(true)} disabled={dueCount === 0} className="!bg-white !text-brand !bg-none">
            {t('Start review')}
          </Button>
        </div>
      </div>

      <Card>
        <form onSubmit={add} className="flex flex-col gap-3">
          <h2 className="m-0 text-base font-extrabold tracking-tight text-ink">{t('Add a word')}</h2>
          {formError && <Banner variant="error">{formError}</Banner>}
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={word} onChange={(e) => setWord(e.target.value)} maxLength={60} required
              placeholder={t('English word or phrase')} aria-label={t('English word or phrase')} dir="auto"
              className="h-12 rounded-2xl border border-line bg-field px-4 text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/30" />
            <input value={meaning} onChange={(e) => setMeaning(e.target.value)} maxLength={200}
              placeholder={t('Meaning (optional)')} aria-label={t('Meaning (optional)')} dir="auto"
              className="h-12 rounded-2xl border border-line bg-field px-4 text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/30" />
          </div>
          <div><Button type="submit" size="sm" disabled={saving || !word.trim()}>{saving ? t('Saving…') : t('Save word')}</Button></div>
        </form>
      </Card>

      {words.length === 0 ? (
        <EmptyState title={t('No saved words yet')} message={t('Select a word in a lesson or an AI Teacher reply to save it here.')} />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {words.map((w) => (
            <li key={w.id} className="flex items-start gap-3 rounded-[20px] bg-surface p-4 ring-1 ring-line shadow-card">
              <div className="min-w-0 flex-1">
                <p className="m-0 text-base font-extrabold text-ink [unicode-bidi:plaintext]">{w.word}</p>
                {w.meaning && <p className="m-0 mt-0.5 text-sm text-ink-soft [unicode-bidi:plaintext]">{w.meaning}</p>}
                {w.context && <p className="m-0 mt-1 line-clamp-2 text-xs italic text-ink-muted [unicode-bidi:plaintext]">{w.context}</p>}
                <p className="m-0 mt-2 text-xs text-ink-muted">
                  {t('Next review: {date}', { date: formatDate(w.nextReviewAt) })}
                </p>
              </div>
              <button type="button" onClick={() => void remove(w.id)} aria-label={t('Delete {word}', { word: w.word })}
                className="size-10 shrink-0 cursor-pointer rounded-xl border-0 bg-transparent text-ink-muted hover:bg-danger-soft hover:text-danger-ink">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
