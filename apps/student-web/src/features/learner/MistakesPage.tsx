import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { buttonClasses } from '../../components/common/buttonStyles';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { QuestionSkeleton } from '../../components/common/Skeleton';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { mistakesApi, type MistakeCheck, type MistakeItem } from './learnerApi';

/** Retry the questions you got wrong, one at a time. A drill only: it does not change your level or progress. */
export function MistakesPage() {
  const { t } = useI18n();
  const quick = useSearchParams()[0].get('quick') === '1';
  const [items, setItems] = useState<MistakeItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<MistakeCheck | null>(null);
  const [fixed, setFixed] = useState(0);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError(''); setItems(null); setIndex(0); setPicked(null); setResult(null); setFixed(0);
    mistakesApi.list().then((r) => { setItems(quick ? r.items.slice(0, 5) : r.items); setTotal(quick ? Math.min(5, r.total) : r.total); })
      .catch((e) => setError(getErrorMessage(e, t('Could not load your mistakes'))));
  }, [t, quick]);
  useEffect(() => { load(); }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!items) return <QuestionSkeleton />;

  if (items.length === 0 || index >= items.length) {
    return (
      <div className={`flex w-full flex-col gap-4 ${items.length === 0 ? 'min-h-[calc(100dvh-9rem)] md:min-h-[calc(100dvh-8rem)]' : 'items-start'}`}>
        <PageTitleBar title={t('My mistakes')} />
        {items.length === 0
          ? <EmptyState fill title={t('Nothing to fix')} message={t('Questions you get wrong in practice will show up here so you can try them again.')}>
              <Link to="/curriculum" className={buttonClasses('primary', 'md')}>{t('Keep practicing')}</Link>
            </EmptyState>
          : <>
              <h2 className="m-0 text-2xl font-semibold tracking-tight text-ink">{t('Round complete')}</h2>
              <p className="m-0 text-ink-muted">{t('You fixed {fixed} of {total}.', { fixed, total: items.length })}</p>
              <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((fixed / items.length) * 100)} aria-label={t('Accuracy')}>
                <div className="h-full rounded-full bg-brand" style={{ width: `${(fixed / items.length) * 100}%` }} />
              </div>
              <div className="flex flex-wrap gap-3"><Button onClick={load}>{t('Try the rest')}</Button>
                <Link to="/improve" className={buttonClasses('secondary', 'md')}>{t('See weak spots')}</Link>
                <Link to="/curriculum" className={buttonClasses('secondary', 'md')}>{t('Back to courses')}</Link></div>
            </>}
      </div>
    );
  }

  const item = items[index];
  async function check(optionId: string) {
    if (result || busy) return;
    setPicked(optionId); setBusy(true);
    try {
      const r = await mistakesApi.check(item.itemId, optionId);
      setResult(r);
      if (r.correct) setFixed((n) => n + 1);
    } catch (e) { setError(getErrorMessage(e, t('Could not check your answer'))); }
    finally { setBusy(false); }
  }
  function next() { setPicked(null); setResult(null); setIndex((i) => i + 1); }

  return (
    <div className="flex min-h-[calc(100dvh-9rem)] w-full flex-col gap-4 md:min-h-[calc(100dvh-8rem)]">
      <PageTitleBar title={quick ? t('5-minute fix session') : t('My mistakes')} subtitle={t('{n} to fix', { n: total })} />
      <p className="m-0 text-sm text-ink-muted" aria-live="polite">{t('Question {n} of {total}', { n: index + 1, total: items.length })}</p>
      <div className="h-2 overflow-hidden rounded-full bg-ink/10" role="progressbar"
        aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={index} aria-label={t('Round progress')}>
        <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${(index / items.length) * 100}%` }} />
      </div>
      <div className="flex flex-1 flex-col gap-4 rounded-2xl bg-surface p-5 ring-1 ring-line sm:p-8">
        <p className="m-0 text-xl font-semibold leading-snug text-ink [unicode-bidi:plaintext]">{item.prompt}</p>
        {item.yourAnswer && !result && (
          <p className="m-0 text-xs text-ink-muted">{t('Last time you answered: {answer}', { answer: `⁨${item.yourAnswer}⁩` })}</p>
        )}
        <div className="flex flex-col gap-3" role="group" aria-label={t('Answer options')}>
          {item.options.map((o) => {
            const isPicked = picked === o.id;
            const isRight = result?.correctChoiceId === o.id;
            const tone = result
              ? isRight ? 'bg-success-soft ring-success-line text-success-ink'
                : isPicked ? 'bg-danger-soft ring-danger-line text-danger-ink' : 'bg-surface ring-line text-ink-muted'
              : 'bg-surface ring-line text-ink hover:ring-line-strong hover:bg-surface-muted';
            return (
              <button key={o.id} type="button" onClick={() => void check(o.id)} disabled={!!result || busy}
                className={`min-h-14 w-full cursor-pointer rounded-2xl border-0 px-4 py-3 text-start text-base font-medium ring-1 transition-colors disabled:cursor-default ${tone}`}>
                <span className="[unicode-bidi:plaintext]">{o.text}</span>
              </button>
            );
          })}
        </div>
        {result && (
          <div role="status" className={`rounded-2xl p-4 text-sm ${result.correct ? 'bg-success-soft text-success-ink' : 'bg-danger-soft text-danger-ink'}`}>
            <p className="m-0 font-semibold">{result.correct ? t('Correct — fixed!') : t('Not quite')}</p>
            {!result.correct && result.correctText && <p className="m-0 mt-1">{t('Correct answer: {answer}', { answer: `⁨${result.correctText}⁩` })}</p>}
            {result.explanation && <p className="m-0 mt-1 opacity-90 [unicode-bidi:plaintext]">{result.explanation}</p>}
          </div>
        )}
        {result && <Button size="lg" className="mt-auto self-center" onClick={next}>{index + 1 >= items.length ? t('Finish') : t('Next question')}</Button>}
      </div>
    </div>
  );
}
