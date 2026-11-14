import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { getErrorMessage } from '../../api/client';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { QuestionSkeleton } from '../../components/common/Skeleton';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { mistakesApi, type MistakeCheck, type MistakeItem } from './learnerApi';
import { PILL_PRIMARY, PILL_SECONDARY, SessionComplete } from './sessionUi';
import { Button } from '../../components/common/Button';
import { LevelBadge } from '../level/LevelBadge';
import { QuestionRenderer } from '../practice/QuestionRenderer';
import { ResultIcon, SoundToggleButton, playSound, resultCue } from '../../interaction';
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
  async function check() {
    if (!picked || result || busy) return;
    setBusy(true);
    try {
      const r = await mistakesApi.check(item.itemId, picked);
      setResult(r);
      const cue = resultCue(r.correct);
      if (cue) playSound(cue);
      if (r.correct) setFixed((n) => n + 1);
    } catch (e) { setError(getErrorMessage(e, t('Could not check your answer'))); }
    finally { setBusy(false); }
  }
  function next() { setPicked(null); setResult(null); setIndex((i) => i + 1); }

  // Same question component as lesson practice, so both look and behave the same.
  const question = {
    id: item.itemId,
    type: item.type === 'listening_choice' ? 'multiple_choice' : item.type,
    stem: item.prompt,
    difficulty: '',
    tags: [],
    options: item.options.map((o, i) => ({ id: o.id, text: o.text, order: i })),
  };
  const progressPct = Math.round(((index + (result ? 1 : 0)) / items.length) * 100);
  const heading = skill ? t('{skill}: {n} to fix', { skill: prettifySkillId(skill), n: total }) : t('{n} to fix', { n: total });

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          to="/improve"
          aria-label={t('Exit practice')}
          title={t('Exit practice')}
          className="grid size-11 shrink-0 place-items-center rounded-full text-ink-soft no-underline ring-1 ring-line-strong transition-colors hover:bg-danger-soft hover:text-danger-ink hover:ring-danger-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <span aria-hidden="true" className="text-lg leading-none">✕</span>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-sm font-medium text-ink-muted">{quick ? t('5-minute fix session') : t('My mistakes')}</h1>
          <span className="block truncate text-lg font-semibold text-ink">{heading}</span>
        </div>
        <span className="flex shrink-0 items-center gap-2">
          <SoundToggleButton />
          <LevelBadge showName={false} />
          <span className="lp-num text-base font-semibold text-ink">{index + 1}<span className="text-ink-muted">/{items.length}</span></span>
        </span>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-ink/10"
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t('Round progress')}
      >
        <div className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="flex flex-col gap-4">
        {item.yourAnswer && !result && (
          <p className="m-0 text-sm text-ink-muted">{t('Last time you answered: {answer}', { answer: `⁨${item.yourAnswer}⁩` })}</p>
        )}
        <QuestionRenderer
          key={item.itemId}
          question={question}
          questionNumber={index + 1}
          questionTotal={items.length}
          selectedAnswer={picked ?? ''}
          onAnswerChange={setPicked}
          disabled={busy || !!result}
          result={result ? result.correct : undefined}
        />

        {result && (
          <div
            key={item.itemId}
            className={`flex items-start gap-3 rounded-2xl p-4 ring-1 ${
              result.correct
                ? 'ix-fade-up bg-success-soft ring-success-line text-success-ink'
                : 'ix-settle bg-danger-soft ring-danger-line text-danger-ink'
            }`}
            role="status"
          >
            <ResultIcon correct={result.correct} className="mt-0.5 size-7" />
            <div className="min-w-0">
              <p className="m-0 text-lg font-semibold">{result.correct ? t('Right') : t('Wrong')}</p>
              {!result.correct && result.correctText && <p className="m-0 mt-1 text-base">{t('Correct answer: {answer}', { answer: `⁨${result.correctText}⁩` })}</p>}
              {result.explanation && <p className="m-0 mt-1 text-base opacity-90 [unicode-bidi:plaintext]">{result.explanation}</p>}
            </div>
          </div>
        )}

        <div className="sticky bottom-3 z-10 -mx-1 rounded-2xl bg-page/85 p-1 backdrop-blur-md">
          {result ? (
            <Button variant="primary" size="lg" fullWidth onClick={next}>
              {index + 1 < items.length ? t('Next question →') : t('Finish practice')}
            </Button>
          ) : (
            <Button variant="primary" size="lg" fullWidth onClick={() => void check()} disabled={!picked} loading={busy}>
              {busy ? t('Checking…') : t('Check answer')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
