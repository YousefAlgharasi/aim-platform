import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { getErrorMessage } from '../../api/client';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { QuestionSkeleton } from '../../components/common/Skeleton';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { mistakesApi, type MistakeCheck, type MistakeItem } from './learnerApi';
import { ChoiceRow, PILL_PRIMARY, PILL_SECONDARY, SessionComplete, SessionProgress, type ChoiceState } from './sessionUi';
import { ResultIcon, playSound, resultCue } from '../../interaction';
import { prettifySkillId } from '../progress/aimApi';
import { loadSkillTitles } from '../progress/skillTitles';

/** Retry the questions you got wrong, one at a time. A drill only: it does not change your level or progress. */
export function MistakesPage() {
  const { t } = useI18n();
  const params = useSearchParams()[0];
  const quick = params.get('quick') === '1';
  // Opened from a weak spot on the Improve page: only the mistakes that train this skill.
  const skill = params.get('skill') || undefined;
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
    Promise.all([mistakesApi.list(skill), skill ? loadSkillTitles() : Promise.resolve()])
      .then(([r]) => { setItems(quick ? r.items.slice(0, 5) : r.items); setTotal(quick ? Math.min(5, r.total) : r.total); })
      .catch((e) => setError(getErrorMessage(e, t('Could not load your mistakes'))));
  }, [t, quick, skill]);
  useEffect(() => { load(); }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!items) return <QuestionSkeleton />;

  if (items.length === 0) {
    return (
      <div className="flex min-h-[calc(100dvh-9rem)] w-full flex-col gap-4 md:min-h-[calc(100dvh-8rem)]">
        <PageTitleBar title={t('My mistakes')} />
        <EmptyState fill title={t('Nothing to fix')} message={t('Questions you get wrong in practice will show up here so you can try them again.')}>
          <Link to="/curriculum" className={PILL_PRIMARY}>{t('Keep practicing')}</Link>
        </EmptyState>
      </div>
    );
  }

  if (index >= items.length) {
    return (
      <div className="flex w-full flex-col gap-6">
        <PageTitleBar title={t('My mistakes')} />
        <SessionComplete
          title={t('Round complete')}
          score={fixed}
          total={items.length}
          summary={fixed === items.length ? t('You fixed every one. Nice work.') : t('You fixed {fixed} of {total}.', { fixed, total: items.length })}
        >
          {fixed < items.length && <button type="button" onClick={load} className={PILL_PRIMARY}>{t('Try the rest')}</button>}
          <Link to="/improve" className={fixed < items.length ? PILL_SECONDARY : PILL_PRIMARY}>{t('See weak spots')}</Link>
          <Link to="/curriculum" className={PILL_SECONDARY}>{t('Back to courses')}</Link>
        </SessionComplete>
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
      const cue = resultCue(r.correct);
      if (cue) playSound(cue);
      if (r.correct) setFixed((n) => n + 1);
    } catch (e) { setError(getErrorMessage(e, t('Could not check your answer'))); }
    finally { setBusy(false); }
  }
  function next() { setPicked(null); setResult(null); setIndex((i) => i + 1); }

  const stateOf = (id: string): ChoiceState => {
    if (!result) return picked === id ? 'picked' : 'idle';
    if (result.correctChoiceId === id) return 'right';
    return picked === id ? 'wrong' : 'dim';
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <PageTitleBar title={quick ? t('5-minute fix session') : t('My mistakes')} subtitle={skill ? t('{skill}: {n} to fix', { skill: prettifySkillId(skill), n: total }) : t('{n} to fix', { n: total })} />
      <SessionProgress done={index} total={items.length} label={t('Round progress')} text={t('Question {n} of {total}', { n: index + 1, total: items.length })} />

      <section className="flex flex-col gap-6 rounded-2xl bg-surface p-5 ring-1 ring-line sm:p-8" aria-label={t('Question {n} of {total}', { n: index + 1, total: items.length })}>
        <div className="flex flex-col gap-2">
          <h2 className="lp-display m-0 text-[1.625rem] font-semibold leading-snug text-ink [unicode-bidi:plaintext] sm:text-[2rem]">{item.prompt}</h2>
          {item.yourAnswer && !result && (
            <p className="m-0 text-sm text-ink-muted">{t('Last time you answered: {answer}', { answer: `⁨${item.yourAnswer}⁩` })}</p>
          )}
        </div>

        <div className="flex flex-col gap-3" role="group" aria-label={t('Answer options')}>
          {item.options.map((o, i) => (
            <ChoiceRow key={o.id} letter={String.fromCharCode(65 + i)} text={o.text} state={stateOf(o.id)} disabled={!!result || busy} onClick={() => void check(o.id)} />
          ))}
        </div>

        {result && (
          <div role="status" className={`flex items-start gap-3 rounded-2xl p-4 text-sm ${result.correct ? 'ix-fade-up bg-success-soft text-success-ink' : 'ix-settle bg-danger-soft text-danger-ink'}`}>
            <ResultIcon correct={result.correct} className="mt-0.5 size-6" />
            <div className="min-w-0">
              <p className="m-0 text-base font-semibold">{result.correct ? t('Correct — fixed!') : t('Not quite')}</p>
              {!result.correct && result.correctText && <p className="m-0 mt-1">{t('Correct answer: {answer}', { answer: `⁨${result.correctText}⁩` })}</p>}
              {result.explanation && <p className="m-0 mt-1 opacity-90 [unicode-bidi:plaintext]">{result.explanation}</p>}
            </div>
          </div>
        )}

        {result && (
          <button type="button" onClick={next} className={`${PILL_PRIMARY} self-center`}>
            {index + 1 >= items.length ? t('Finish') : t('Next question')}
          </button>
        )}
      </section>
    </div>
  );
}
