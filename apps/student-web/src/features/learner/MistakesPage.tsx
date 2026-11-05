import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
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
      <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-4 py-6 text-center">
        <PageTitleBar title={t('My mistakes')} />
        {items.length === 0
          ? <>
              <EmptyState title={t('Nothing to fix')} message={t('Questions you get wrong in practice will show up here so you can try them again.')} />
              <Link to="/curriculum" className="mx-auto inline-flex h-12 items-center rounded-2xl bg-brand px-6 text-[15px] font-bold text-white no-underline">{t('Keep practicing')}</Link>
            </>
          : <>
              <div className="pop-in grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-brand to-secondary text-4xl text-white shadow-xl shadow-brand/30">✓</div>
              <h2 className="m-0 text-2xl font-extrabold tracking-tight text-ink">{t('Round complete')}</h2>
              <p className="m-0 text-ink-muted">{t('You fixed {fixed} of {total}.', { fixed, total: items.length })}</p>
              <div className="mx-auto h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-control ring-1 ring-inset ring-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((fixed / items.length) * 100)} aria-label={t('Accuracy')}>
                <div className="h-full rounded-full bg-success" style={{ width: `${(fixed / items.length) * 100}%` }} />
              </div>
              <div className="flex flex-wrap justify-center gap-3"><Button onClick={load}>{t('Try the rest')}</Button>
                <Link to="/improve" className="inline-flex h-12 items-center rounded-2xl bg-brand-soft px-6 text-[15px] font-bold text-brand-ink no-underline">{t('See weak spots')}</Link>
                <Link to="/curriculum" className="inline-flex h-12 items-center rounded-2xl bg-control px-6 text-[15px] font-bold text-ink no-underline">{t('Back to courses')}</Link></div>
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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <PageTitleBar title={quick ? t('5-minute fix session') : t('My mistakes')} subtitle={t('{n} to fix', { n: total })} />
      <p className="m-0 text-center text-xs font-bold text-ink-muted" aria-live="polite">{t('Question {n} of {total}', { n: index + 1, total: items.length })}</p>
      <div className="h-2.5 overflow-hidden rounded-full bg-control ring-1 ring-inset ring-line" role="progressbar"
        aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={index} aria-label={t('Round progress')}>
        <div className="h-full rounded-full bg-gradient-to-r from-brand to-secondary transition-all duration-300" style={{ width: `${(index / items.length) * 100}%` }} />
      </div>
      <div className="flex flex-col gap-4 rounded-3xl bg-surface p-5 shadow-card ring-1 ring-line sm:p-6">
        <p className="m-0 text-lg font-bold leading-snug text-ink [unicode-bidi:plaintext]">{item.prompt}</p>
        {item.yourAnswer && !result && (
          <p className="m-0 text-xs text-ink-muted">{t('Last time you answered: {answer}', { answer: `⁨${item.yourAnswer}⁩` })}</p>
        )}
        <div className="flex flex-col gap-2" role="group" aria-label={t('Answer options')}>
          {item.options.map((o) => {
            const isPicked = picked === o.id;
            const isRight = result?.correctChoiceId === o.id;
            const tone = result
              ? isRight ? 'bg-success-soft ring-success-line text-success-ink'
                : isPicked ? 'bg-danger-soft ring-danger-line text-danger-ink' : 'bg-surface ring-line text-ink-muted'
              : 'bg-surface ring-line text-ink hover:ring-brand hover:bg-brand-soft/40';
            return (
              <button key={o.id} type="button" onClick={() => void check(o.id)} disabled={!!result || busy}
                className={`min-h-14 w-full cursor-pointer rounded-2xl border-0 px-4 py-3 text-start text-[15px] font-semibold ring-1 transition-colors disabled:cursor-default ${tone}`}>
                <span className="[unicode-bidi:plaintext]">{o.text}</span>
              </button>
            );
          })}
        </div>
        {result && (
          <div role="status" className={`rounded-2xl p-4 text-sm ${result.correct ? 'bg-success-soft text-success-ink' : 'bg-danger-soft text-danger-ink'}`}>
            <p className="m-0 font-extrabold">{result.correct ? t('Correct — fixed!') : t('Not quite')}</p>
            {!result.correct && result.correctText && <p className="m-0 mt-1">{t('Correct answer: {answer}', { answer: `⁨${result.correctText}⁩` })}</p>}
            {result.explanation && <p className="m-0 mt-1 opacity-90 [unicode-bidi:plaintext]">{result.explanation}</p>}
          </div>
        )}
      </div>
      {result && <Button size="lg" onClick={next}>{index + 1 >= items.length ? t('Finish') : t('Next question')}</Button>}
    </div>
  );
}
