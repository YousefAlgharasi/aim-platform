import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { QuestionSkeleton } from '../../components/common/Skeleton';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { useI18n } from '../../i18n/I18nContext';
import { countWords, isPracticeLocked, practiceTopicsApi, type PracticeTopic, type WritingResult } from './practiceTopicsApi';

function mmss(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** /practice/writing/:topicId — write, submit, see the AI's 0-100 score, corrections and XP. */
export function WritingPracticePage() {
  const { topicId } = useParams<{ topicId: string }>();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<PracticeTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [locked, setLocked] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<WritingResult | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError('');
    practiceTopicsApi
      .list('writing')
      .then((all) => {
        const found = all.find((x) => x.id === topicId) ?? null;
        setTopic(found);
        setSecondsLeft(found?.timeLimitSeconds ?? null);
      })
      .catch((err) => (isPracticeLocked(err) ? setLocked(true) : setLoadError(getErrorMessage(err, t('Failed to load topics')))))
      .finally(() => setLoading(false));
  }, [topicId, t]);

  useEffect(() => { load(); }, [load]);

  // Writing time is a guide: the clock runs down and stops at 0 (the student can still submit).
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0 || result) return undefined;
    const id = window.setTimeout(() => setSecondsLeft((s) => (s === null ? s : s - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft, result]);

  const words = countWords(text);
  const minWords = topic?.minWords ?? 1;
  const canSubmit = !submitting && words >= minWords;

  async function submit() {
    if (!topic || !canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      setResult(await practiceTopicsApi.submitWriting(topic.id, text.trim()));
    } catch (err) {
      setError(getErrorMessage(err, t('We could not mark your paragraph right now. Please try again.')));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <QuestionSkeleton />;
  if (locked) {
    return (
      <EmptyState
        title={t('Start a course to unlock this')}
        message={t('Practice Speaking and Write a Paragraph are part of your course. Start a course to use them.')}
        actionLabel={t('Choose a course')}
        onAction={() => navigate('/curriculum')}
      />
    );
  }
  if (loadError) return <ErrorState message={loadError} onRetry={load} />;
  if (!topic) {
    return <EmptyState title={t('Topic not found')} message={t('This topic is no longer available.')} actionLabel={t('Back to topics')} onAction={() => navigate('/practice/writing')} />;
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      <PageTitleBar title={topic.title} subtitle={topic.description} fallback="/practice/writing" />

      {!result && (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className={`lp-num font-semibold ${words >= minWords ? 'text-success-ink' : 'text-ink-muted'}`}>
                {t('{n} words', { n: words })}{topic.minWords ? `, ${t('at least {n}', { n: topic.minWords })}` : ''}
              </span>
              {secondsLeft !== null && (
                <span className={`lp-num rounded-full px-3 py-1 text-sm font-semibold ring-1 ${secondsLeft > 0 && secondsLeft <= 30 ? 'text-danger-ink ring-danger-line' : 'text-ink ring-line-strong'}`}>
                  {secondsLeft > 0 ? mmss(secondsLeft) : t("Time's up")}
                </span>
              )}
            </div>
            {topic.minWords ? (
              <div className="h-2 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuemin={0} aria-valuemax={minWords} aria-valuenow={Math.min(words, minWords)} aria-label={t('Words written')}>
                <div className={`h-full rounded-full transition-[width] duration-300 ${words >= minWords ? 'bg-success' : 'bg-brand'}`} style={{ width: `${Math.min(100, (words / minWords) * 100)}%` }} />
              </div>
            ) : null}
          </div>
          <textarea
            className="w-full min-h-[280px] resize-y rounded-2xl border-0 bg-surface p-5 text-base leading-relaxed text-ink outline-none ring-1 ring-line transition-shadow placeholder:text-ink-muted focus:ring-2 focus:ring-brand"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={6000}
            placeholder={t('Write your paragraph here…')}
            aria-label={t('Your paragraph')}
            disabled={submitting}
          />
          {error && <Banner variant="error">{error}</Banner>}
          <Button onClick={submit} disabled={!canSubmit} fullWidth>
            {submitting ? t('Marking your paragraph…') : t('Submit for marking')}
          </Button>
        </>
      )}

      {result && (
        <section className="flex flex-col gap-4" aria-label={t('Your result')}>
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface p-6 text-center ring-1 ring-line sm:p-8">
            <p className="m-0 text-sm text-ink-muted">{t('Your score')}</p>
            <p className={`lp-num m-0 text-6xl font-semibold tracking-tight ${result.score >= 70 ? 'text-success-ink' : result.score >= 40 ? 'text-warning-ink' : 'text-danger-ink'}`}>{result.score}<span className="text-xl text-ink-muted">/100</span></p>
            <div className="w-full max-w-xs h-2 rounded-full bg-ink/10 overflow-hidden" role="img" aria-label={`${result.score} / 100`}>
              <div className="h-full bg-brand rounded-full" style={{ width: `${result.score}%` }} />
            </div>
            {result.xpAwarded > 0
              ? <span className="rounded-full px-3 py-1 text-sm font-semibold text-brand-ink ring-1 ring-brand-line">{t('+{xp} XP', { xp: result.xpAwarded })}</span>
              : <span className="text-xs text-ink-muted">{t('You already earned XP for this topic today.')}</span>}
            <p className="m-0 mt-2 text-sm leading-relaxed text-ink-soft max-w-xl">{result.summary}</p>
          </div>

          {result.corrections.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="m-0 text-xl font-semibold text-ink">{t('What to fix')}</h2>
              <ul className="m-0 p-0 list-none flex flex-col gap-2">
                {result.corrections.map((c, i) => (
                  <li key={i} className="rounded-2xl bg-surface ring-1 ring-line p-3 text-sm flex flex-col gap-1" dir="auto">
                    <span><span className="line-through text-danger-ink">{c.original}</span> → <span className="font-bold text-success-ink">{c.correction}</span></span>
                    {c.explanation && <span className="text-ink-muted">{c.explanation}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => { setResult(null); setText(''); setSecondsLeft(topic.timeLimitSeconds); }}>{t('Try again')}</Button>
            <Button onClick={() => navigate('/practice/writing')}>{t('More topics')}</Button>
          </div>
        </section>
      )}
    </div>
  );
}
