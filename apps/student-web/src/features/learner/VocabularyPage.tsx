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
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState('');

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
      setWord(''); setMeaning(''); setAdding(false); load();
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

  const q = query.trim().toLowerCase();
  const shown = q ? words.filter((w) => w.word.toLowerCase().includes(q) || (w.meaning ?? '').toLowerCase().includes(q)) : words;
  const mastered = words.filter((w) => w.box >= 5).length;

  return (
    <div className="stagger flex w-full flex-col gap-6">
      <PageTitleBar
        title={t('My words')}
        subtitle={t('Words you saved while learning, ready to review.')}
        action={<Button size="sm" variant="secondary" onClick={() => setAdding((v) => !v)} aria-expanded={adding}>{adding ? t('Close') : t('Add a word')}</Button>}
      />

      <div className="hero-panel">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="m-0 text-sm font-bold text-on-brand">{t('Today’s review')}</p>
            <p className="m-0 mt-1 text-3xl font-semibold tabular-nums">{dueCount === 0 ? t('All caught up') : t('{n} words due', { n: dueCount })}</p>
            <p className="m-0 mt-1 text-sm text-on-brand">{t('{total} saved · {mastered} well known', { total: words.length, mastered })}</p>
          </div>
          <Button onClick={() => setReviewing(true)} disabled={dueCount === 0} size="lg" className="hero-cta !ring-0">
            {t('Start review')}
          </Button>
        </div>
      </div>

      {adding && (
        <Card>
          <form onSubmit={add} className="flex flex-col gap-3">
            <h2 className="m-0 text-xl font-semibold tracking-tight text-ink">{t('Add a word')}</h2>
            {formError && <Banner variant="error">{formError}</Banner>}
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={word} onChange={(e) => setWord(e.target.value)} maxLength={60} required autoFocus
                placeholder={t('English word or phrase')} aria-label={t('English word or phrase')} dir="auto"
                className="h-12 rounded-xl border border-line bg-field px-4 text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/30" />
              <input value={meaning} onChange={(e) => setMeaning(e.target.value)} maxLength={200}
                placeholder={t('Meaning (optional)')} aria-label={t('Meaning (optional)')} dir="auto"
                className="h-12 rounded-xl border border-line bg-field px-4 text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/30" />
            </div>
            <div><Button type="submit" size="sm" disabled={saving || !word.trim()}>{saving ? t('Saving…') : t('Save word')}</Button></div>
          </form>
        </Card>
      )}

      {words.length === 0 ? (
        <EmptyState title={t('No saved words yet')} message={t('Select a word in a lesson or an AI Teacher reply to save it here.')} />
      ) : (
        <section className="flex flex-col gap-3" aria-label={t('Saved words')}>
          <input
            type="search" value={query} onChange={(e) => setQuery(e.target.value)} dir="auto"
            placeholder={t('Search your words')} aria-label={t('Search your words')}
            className="h-12 w-full rounded-xl border border-line bg-field px-4 text-ink outline-none placeholder:text-ink-muted focus:border-focus focus:ring-2 focus:ring-focus/30"
          />
          {shown.length === 0 ? (
            <p className="m-0 py-6 text-center text-sm text-ink-muted">{t('No words match your search.')}</p>
          ) : (
            <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
              {shown.map((w) => {
                const isDue = new Date(w.nextReviewAt).getTime() <= Date.now();
                return (
                  <li key={w.id} className="flex flex-col gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="m-0 text-base font-semibold text-ink [overflow-wrap:anywhere] [unicode-bidi:plaintext]">{w.word}</p>
                        {w.meaning && <p className="m-0 mt-0.5 text-sm text-ink-soft [unicode-bidi:plaintext]">{w.meaning}</p>}
                        {w.context && <p className="m-0 mt-1 line-clamp-2 text-xs italic text-ink-muted [unicode-bidi:plaintext]">{w.context}</p>}
                      </div>
                      <button type="button" onClick={() => void remove(w.id)} aria-label={t('Delete {word}', { word: w.word })}
                        className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-ink-muted hover:bg-danger-soft hover:text-danger-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                        <span aria-hidden="true">✕</span>
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3">
                      <span className="flex gap-1" role="img" aria-label={t('Memory strength {n} of 6', { n: w.box })}>
                        {Array.from({ length: 6 }).map((_, i) => <span key={i} className={`h-1.5 w-4 rounded-full ${i < w.box ? 'bg-brand' : 'bg-surface-strong'}`} />)}
                      </span>
                      {isDue
                        ? <span className="rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-semibold text-warning-ink">{t('Due')}</span>
                        : <span className="text-xs text-ink-muted">{t('Next review: {date}', { date: formatDate(w.nextReviewAt) })}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
