import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { ErrorState } from '../../components/common/ErrorState';
import { QuestionSkeleton } from '../../components/common/Skeleton';
import { ResultIcon, playSound, resultCue } from '../../interaction';
import { QuestionRenderer } from '../practice/QuestionRenderer';
import { submitAttempt, type SessionQuestion } from '../practice/practiceApi';
import { PILL_PRIMARY, PILL_SECONDARY, SessionComplete } from '../learner/sessionUi';
import { storiesApi, type StoryDetail } from './storiesApi';
import { Cast, StoryScene } from './StoryScene';

type Phase = 'intro' | 'scene' | 'questions' | 'done';

/**
 * Reads one story scene by scene. After each scene come its questions; every answer is a real attempt
 * (POST /sessions/:id/attempt) so the AIM engine updates mastery for the course's skills. Nothing is scored here.
 */
export function StoryReaderPage() {
  const { storyId = '' } = useParams();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [phase, setPhase] = useState<Phase>('intro');
  const [sessionId, setSessionId] = useState('');
  const [scene, setScene] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [picked, setPicked] = useState('');
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [right, setRight] = useState(0);
  const [asked, setAsked] = useState(0);
  const [busy, setBusy] = useState(false);
  const [starting, setStarting] = useState(false);
  const shownAt = useRef(new Date());

  const load = useCallback(() => {
    setError(''); setLocked(false); setStory(null);
    storiesApi.get(storyId).then(setStory).catch((e: unknown) => {
      const status = (e as { statusCode?: number; status?: number })?.statusCode ?? (e as { status?: number })?.status;
      if (status === 403) setLocked(true); else setError(getErrorMessage(e, t('Could not load this story')));
    });
  }, [storyId, t]);
  useEffect(() => { load(); }, [load]);

  async function begin(fromStart: boolean) {
    if (!story || starting) return;
    setStarting(true); setError('');
    try {
      const { sessionId: sid } = await storiesApi.start(story.storyId);
      setSessionId(sid); setRight(0); setAsked(0); setQIndex(0); setPicked(''); setVerdict(null);
      setScene(fromStart ? 0 : story.resumeScene); setPhase('scene');
    } catch (e) { setError(getErrorMessage(e, t('Could not start this story'))); }
    finally { setStarting(false); }
  }

  if (locked) {
    return (
      <div className="flex w-full flex-col gap-6">
        <SessionComplete title={t('This story is locked')} score={0} total={0} summary={t('Finish the earlier courses to unlock it. Meanwhile, read the stories that are open.')}>
          <Link to="/stories" className={PILL_PRIMARY}>{t('Back to stories')}</Link>
        </SessionComplete>
      </div>
    );
  }
  if (error && !story) return <ErrorState message={error} onRetry={load} />;
  if (!story) return <QuestionSkeleton />;

  const title = (locale === 'ar' && story.titleAr) || story.title;
  const summary = (locale === 'ar' && story.summaryAr) || story.summary;
  const total = story.sceneList.length;
  const current = story.sceneList[scene];

  if (phase === 'intro') {
    return (
      <div className="flex w-full flex-col gap-6">
        <section className="flex flex-col items-center gap-4 rounded-2xl bg-surface px-6 py-8 text-center ring-1 ring-line">
          <Cast size="size-14" />
          <p className="m-0 text-sm font-bold text-brand-ink">{story.cefrCode ?? story.courseTitle}</p>
          <h1 className="lp-display m-0 text-[1.75rem] font-semibold text-ink [unicode-bidi:plaintext] sm:text-[2.25rem]">{title}</h1>
          <p className="m-0 max-w-prose text-base leading-relaxed text-ink-muted [unicode-bidi:plaintext]">{summary}</p>
          <p className="m-0 text-xs font-semibold text-ink-muted">{t('{n} scenes', { n: story.scenes })} · {t('{n} min', { n: story.minutes })} · {t('{n} questions', { n: story.questions })}</p>
          {error && <p role="alert" className="m-0 rounded-xl bg-danger-soft p-3 text-sm font-semibold text-danger-ink">{error}</p>}
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" className={PILL_PRIMARY} disabled={starting} onClick={() => void begin(story.completed)}>
              {starting ? t('Preparing…') : story.completed ? t('Read again') : story.answered > 0 ? t('Continue') : t('Start reading')}
            </button>
            <Link to="/stories" className={PILL_SECONDARY}>{t('Back to stories')}</Link>
          </div>
        </section>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="flex w-full flex-col gap-6">
        <SessionComplete title={t('Story complete')} score={right} total={asked}
          summary={t('You finished "{title}". Your answers count toward your skills.', { title })}>
          <button type="button" className={PILL_PRIMARY} onClick={() => void begin(true)}>{t('Read again')}</button>
          <Link to="/stories" className={PILL_SECONDARY}>{t('Back to stories')}</Link>
          <Link to="/improve" className={PILL_SECONDARY}>{t('See my skills')}</Link>
        </SessionComplete>
      </div>
    );
  }

  const questions = current?.questions ?? [];
  const sceneFraction = phase === 'questions' && questions.length ? (qIndex + (verdict !== null ? 1 : 0)) / questions.length : 0;
  const pct = Math.round(((scene + (phase === 'scene' ? 0 : 0.5 + sceneFraction / 2)) / total) * 100);

  function nextAfterScene() {
    if (questions.length > 0) { setQIndex(0); setPicked(''); setVerdict(null); shownAt.current = new Date(); setPhase('questions'); }
    else goNextScene();
  }
  function goNextScene() {
    if (scene + 1 >= total) setPhase('done');
    else { setScene((s) => s + 1); setPhase('scene'); }
  }

  const header = (
    <>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={t('Exit story')} title={t('Exit story')} onClick={() => navigate('/stories')}
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-ink-soft ring-1 ring-line-strong transition-colors hover:bg-danger-soft hover:text-danger-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <span aria-hidden="true" className="text-lg leading-none">✕</span>
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="m-0 truncate text-sm font-medium text-ink-muted [unicode-bidi:plaintext]">{title}</h1>
          <span className="block text-lg font-semibold text-ink">{t('Scene {n} of {total}', { n: scene + 1, total })}</span>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={t('Story progress')}>
        <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${Math.max(pct, 3)}%` }} />
      </div>
    </>
  );

  if (phase === 'scene' && current) {
    return (
      <div className="flex w-full flex-col gap-6">
        {header}
        <StoryScene setting={(locale === 'ar' && current.settingAr) || current.setting} lines={current.lines} />
        <div className="sticky bottom-3 z-10 -mx-1 rounded-2xl bg-page/85 p-1 backdrop-blur-md">
          <Button variant="primary" size="lg" fullWidth onClick={nextAfterScene}>
            {questions.length > 0 ? t('Answer the questions') : scene + 1 >= total ? t('Finish story') : t('Next scene')}
          </Button>
        </div>
      </div>
    );
  }

  // questions phase
  const item = questions[qIndex];
  if (!item) { goNextScene(); return null; }
  const question: SessionQuestion = { id: item.itemId, type: item.type, stem: item.prompt, difficulty: '', tags: [], options: item.options.map((o, i) => ({ id: o.id, text: o.text, order: i })) };
  async function check() {
    if (!picked || verdict !== null || busy) return;
    setBusy(true); setError('');
    try {
      const startedAt = new Date(Math.min(shownAt.current.getTime() - 2000, Date.now())).toISOString();
      const res = await submitAttempt(sessionId, { itemId: item.itemId, answerValue: picked, startedAt });
      const ok = !!res.isCorrect;
      setVerdict(ok); setAsked((n) => n + 1);
      const cue = resultCue(ok); if (cue) playSound(cue);
      if (ok) setRight((n) => n + 1);
    } catch (e) { setError(getErrorMessage(e, t('Could not check your answer'))); }
    finally { setBusy(false); }
  }
  function next() {
    setPicked(''); setVerdict(null); shownAt.current = new Date();
    if (qIndex + 1 < questions.length) setQIndex((i) => i + 1); else goNextScene();
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {header}
      <details className="rounded-2xl bg-surface-muted p-3 ring-1 ring-line">
        <summary className="cursor-pointer text-sm font-semibold text-ink-muted">{t('Read the scene again')}</summary>
        <div className="mt-3"><StoryScene setting={(locale === 'ar' && current?.settingAr) || current?.setting || ''} lines={current?.lines ?? []} /></div>
      </details>
      <QuestionRenderer key={item.itemId} question={question} questionNumber={qIndex + 1} questionTotal={questions.length}
        selectedAnswer={picked} onAnswerChange={setPicked} disabled={busy || verdict !== null} result={verdict ?? undefined} />
      {error && <p role="alert" className="m-0 rounded-xl bg-danger-soft p-3 text-sm font-semibold text-danger-ink">{error}</p>}
      {verdict !== null && (
        <div role="status" className={`flex items-center gap-3 rounded-2xl p-4 ring-1 ${verdict ? 'bg-success-soft ring-success-line text-success-ink' : 'bg-danger-soft ring-danger-line text-danger-ink'}`}>
          <ResultIcon correct={verdict} className="size-7" />
          <p className="m-0 text-lg font-semibold">{verdict ? t('Right') : t('Not quite')}</p>
        </div>
      )}
      <div className="sticky bottom-3 z-10 -mx-1 rounded-2xl bg-page/85 p-1 backdrop-blur-md">
        {verdict !== null ? (
          <Button variant="primary" size="lg" fullWidth onClick={next}>
            {qIndex + 1 < questions.length ? t('Next question →') : scene + 1 >= total ? t('Finish story') : t('Next scene')}
          </Button>
        ) : (
          <Button variant="primary" size="lg" fullWidth onClick={() => void check()} disabled={!picked} loading={busy}>{busy ? t('Checking…') : t('Check answer')}</Button>
        )}
      </div>
    </div>
  );
}
