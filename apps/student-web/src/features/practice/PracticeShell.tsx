import { LevelBadge } from '../level/LevelBadge';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { QuestionSkeleton } from '../../components/common/Skeleton';
import type { ApiError } from '../../types';
import type { LessonRouteState } from '../lessons/LessonPlayerShell';
import { useLessonProgress } from '../lessons/useLessonProgress';
import { PracticeFeedback, type CompletionStatus } from './PracticeFeedback';
import { QuestionRenderer } from './QuestionRenderer';
import { useAnswerDraft } from './useAnswerDraft';
import { usePracticeSubmit } from './usePracticeSubmit';
import {
  fetchSessionQuestions,
  fetchSessionSummary,
  type SessionQuestion,
  type SessionSummary,
} from './practiceApi';
import { linkButton, linkButtonPrimary } from './practiceStyles';
import { useI18n } from '../../i18n/I18nContext';
import { ResultIcon, SoundToggleButton, playSound, reportLearningCompleted, resultCue, useSoundOn } from '../../interaction';

type Status = 'loading' | 'locked' | 'expired' | 'failed' | 'empty' | 'active' | 'finished';

function isStatus(err: unknown, code: number) {
  return (err as Partial<ApiError> | null)?.statusCode === code;
}

/**
 * Route: /practice/:sessionId?lessonId=…
 * Port of Flutter's practice session flow (PracticeSessionNotifier):
 * load lesson questions for the session → answer each (backend-evaluated
 * attempt) → after each question record partial progress (≤99%) → at the end
 * record 100% and POST /lessons/:id/complete → show the backend summary.
 * Already-attempted questions (from GET /sessions/:id/summary) are skipped so
 * a reload resumes the session.
 */
export function PracticeShell() {
  const { sessionId = '' } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get('lessonId') ?? '';
  const location = useLocation();
  const navigate = useNavigate();
  const navState = (location.state ?? {}) as LessonRouteState;
  const { t } = useI18n();

  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [questions, setQuestions] = useState<SessionQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [summaryError, setSummaryError] = useState('');
  const [completion, setCompletion] = useState<CompletionStatus>('saving');
  const [completionError, setCompletionError] = useState('');
  const shownAtRef = useRef(new Date());

  const { syncProgress, markComplete } = useLessonProgress(lessonId);
  const { submitAnswer, submitting, error: submitError, feedback, clearFeedback } = usePracticeSubmit(sessionId);

  const current = status === 'active' ? questions[index] : undefined;
  const { draft, updateDraft, clearDraft } = useAnswerDraft(`${sessionId}:${current?.id ?? ''}`);

  const loadSummary = useCallback(() => {
    setSummaryError('');
    fetchSessionSummary(sessionId)
      .then(setSummary)
      .catch(err => setSummaryError(getErrorMessage(err, t('Failed to load your results'))));
  }, [sessionId, t]);

  const persistCompletion = useCallback(() => {
    setCompletion('saving');
    setCompletionError('');
    markComplete()
      .then(() => {
        setCompletion('saved');
        // Server-confirmed completion: soft cue, then let the streak celebrate if this is today's first.
        playSound('complete');
        void reportLearningCompleted();
      })
      .catch(err => {
        setCompletion('failed');
        setCompletionError(
          isStatus(err, 403)
            ? getErrorMessage(err, t('Complete the previous lesson before this one can be completed.'))
            : getErrorMessage(err, t("We couldn't mark this lesson as complete.")),
        );
      });
  }, [markComplete, t]);

  const finish = useCallback(() => {
    setStatus('finished');
    loadSummary();
    persistCompletion();
  }, [loadSummary, persistCompletion]);

  const load = useCallback(() => {
    if (!lessonId) return;
    setStatus('loading');
    setErrorMessage('');
    Promise.all([
      fetchSessionQuestions(sessionId, lessonId),
      fetchSessionSummary(sessionId).catch(() => null),
    ])
      .then(([qs, prior]) => {
        setQuestions(qs);
        if (qs.length === 0) {
          setStatus('empty');
          return;
        }
        const attempted = new Set(prior?.attempts.map(a => a.itemId) ?? []);
        const firstOpen = qs.findIndex(q => !attempted.has(q.id));
        if (firstOpen < 0) {
          setIndex(qs.length - 1);
          finish();
          return;
        }
        setIndex(firstOpen);
        shownAtRef.current = new Date();
        setStatus('active');
      })
      .catch(err => {
        setErrorMessage(getErrorMessage(err, t('Failed to start practice session')));
        if (isStatus(err, 403)) setStatus('locked');
        else if (isStatus(err, 404)) setStatus('expired');
        else setStatus('failed');
      });
  }, [sessionId, lessonId, finish, t]);

  useEffect(() => { load(); }, [load]);

  function handleSubmit() {
    if (!current || submitting) return;
    const isOptionBased = current.options.length > 0;
    const answer = isOptionBased ? draft : draft.trim();
    if (!answer) return;
    submitAnswer(current.id, answer, shownAtRef.current)
      .then(() => clearDraft())
      .catch(() => undefined);
  }

  function handleNext() {
    clearFeedback();
    if (index + 1 < questions.length) {
      const next = index + 1;
      setIndex(next);
      shownAtRef.current = new Date();
      // Flutter: partial progress after each question, capped below 100.
      void syncProgress(Math.min(Math.round((next / questions.length) * 100), 99));
    } else {
      finish();
    }
  }

  function restart() {
    navigate(`/practice/lesson/${lessonId}`, { state: navState });
  }

  // Optional cue once per checked answer (keyed by question, so re-renders stay silent).
  useSoundOn(resultCue(feedback?.isCorrect), feedback?.isCorrect == null ? null : feedback.questionId);

  const lessonLink = (
    <Link to={lessonId ? `/lessons/${lessonId}` : '/curriculum'} state={navState} className={linkButton}>
      {lessonId ? t('Back to lesson') : t('Browse courses')}
    </Link>
  );

  if (!lessonId) {
    return (
      <div className="flex w-full flex-col gap-6">
        <EmptyState
          title={t('Choose a lesson to practice')}
          message={t('Practice sessions are started from a lesson. Open a lesson and select “Start practice”.')}
          actionLabel={t('Browse courses')}
          onAction={() => navigate('/curriculum')}
        />
      </div>
    );
  }

  if (status === 'loading') return <QuestionSkeleton />;

  if (status === 'locked') {
    return (
      <div className="flex w-full flex-col gap-6">
        <EmptyState
          title={t('Practice locked')}
          message={errorMessage || t('This lesson is locked for you right now. Finish the earlier lessons first.')}
        />
        {lessonLink}
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="flex w-full flex-col gap-6">
        <EmptyState
          title={t('This practice session has ended')}
          message={t('The session is no longer active. Start a new one to keep practicing.')}
          actionLabel={t('Start new session')}
          onAction={restart}
        />
        {lessonLink}
      </div>
    );
  }

  if (status === 'failed') return <ErrorState message={errorMessage} onRetry={load} />;

  if (status === 'empty') {
    return (
      <div className="flex w-full flex-col gap-6">
        <EmptyState
          title={t('No practice questions yet')}
          message={t("This lesson doesn't have any published practice questions yet. Try the AI tutor to work through it instead.")}
        />
        <div className="flex flex-wrap gap-3">
          {lessonLink}
          <Link
            to={`/ai-teacher?lessonId=${encodeURIComponent(lessonId)}${navState.lessonTitle ? `&lessonTitle=${encodeURIComponent(navState.lessonTitle)}` : ''}`}
            className={linkButtonPrimary}
          >
            {t('Ask AI tutor')}
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    if (summaryError) return <ErrorState message={summaryError} onRetry={loadSummary} />;
    if (!summary) return <QuestionSkeleton />;
    return (
      <PracticeFeedback
        summary={summary}
        questions={questions}
        lessonId={lessonId}
        lessonTitle={navState.lessonTitle}
        courseId={navState.courseId}
        completion={completion}
        completionError={completionError}
        onRetryCompletion={persistCompletion}
        onPracticeAgain={restart}
      />
    );
  }

  if (!current) return <QuestionSkeleton />;

  const answered = feedback?.questionId === current.id;
  const canSubmit = (current.options.length > 0 ? draft : draft.trim()).length > 0;
  const progressPct = Math.round(((index + (answered ? 1 : 0)) / questions.length) * 100);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          to={lessonId ? `/lessons/${lessonId}` : '/curriculum'}
          state={{ courseId: navState.courseId }}
          aria-label={t('Exit practice')}
          title={t('Exit practice')}
          className="grid size-11 shrink-0 place-items-center rounded-full text-ink-soft no-underline ring-1 ring-line-strong transition-colors hover:bg-danger-soft hover:text-danger-ink hover:ring-danger-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <span aria-hidden="true" className="text-lg leading-none">✕</span>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-sm font-medium text-ink-muted">{t('Practice Session')}</h1>
          {navState.lessonTitle && (
            <span className="block truncate text-lg font-semibold text-ink">{navState.lessonTitle}</span>
          )}
        </div>
        <span className="flex shrink-0 items-center gap-2">
          <SoundToggleButton />
          <LevelBadge showName={false} />
          <span className="lp-num text-base font-semibold text-ink">{index + 1}<span className="text-ink-muted">/{questions.length}</span></span>
        </span>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-ink/10"
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t('Practice progress')}
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <QuestionRenderer
          question={current}
          questionNumber={index + 1}
          questionTotal={questions.length}
          selectedAnswer={answered ? feedback.answerValue : draft}
          onAnswerChange={updateDraft}
          disabled={submitting || answered}
          result={answered ? feedback.isCorrect : undefined}
        />

        {answered && (
          <div
            key={feedback.questionId}
            className={`flex items-start gap-3 rounded-2xl p-4 ring-1 ${
              feedback.isCorrect === false
                ? 'ix-settle bg-danger-soft ring-danger-line text-danger-ink'
                : 'ix-fade-up bg-success-soft ring-success-line text-success-ink'
            }`}
            role="status"
          >
            {feedback.isCorrect != null && <ResultIcon correct={feedback.isCorrect} className="mt-0.5 size-7" />}
            <div className="min-w-0">
              <p className="m-0 text-lg font-semibold">
                {feedback.isCorrect === true
                  ? t('Right')
                  : feedback.isCorrect === false
                    ? t('Wrong')
                    : t('Answer recorded')}
              </p>
            </div>
          </div>
        )}

        {submitError && <Banner variant="error">{submitError}</Banner>}

        <div className="sticky bottom-3 z-10 -mx-1 rounded-2xl bg-page/85 p-1 backdrop-blur-md">
        {answered ? (
          <Button variant="primary" size="lg" fullWidth onClick={handleNext}>
            {index + 1 < questions.length ? t('Next question →') : t('Finish practice')}
          </Button>
        ) : (
          <Button variant="primary" size="lg" fullWidth onClick={handleSubmit} disabled={!canSubmit} loading={submitting}>
            {submitting ? t('Checking…') : t('Check answer')}
          </Button>
        )}
        </div>
      </div>
    </div>
  );
}
