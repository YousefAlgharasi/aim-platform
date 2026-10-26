import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
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
import { BackArrowIcon } from '../curriculum/CurriculumIcons';
import { useI18n } from '../../i18n/I18nContext';

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
      .then(() => setCompletion('saved'))
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

  const lessonLink = (
    <Link to={lessonId ? `/lessons/${lessonId}` : '/curriculum'} state={navState} className={linkButton}>
      {lessonId ? t('Back to lesson') : t('Browse courses')}
    </Link>
  );

  if (!lessonId) {
    return (
      <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full">
        <EmptyState
          title={t('Choose a lesson to practice')}
          message={t('Practice sessions are started from a lesson. Open a lesson and select “Start practice”.')}
          actionLabel={t('Browse courses')}
          onAction={() => navigate('/curriculum')}
        />
      </div>
    );
  }

  if (status === 'loading') return <LoadingSpinner />;

  if (status === 'locked') {
    return (
      <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full">
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
      <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full">
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
      <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full">
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
    if (!summary) return <LoadingSpinner />;
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

  if (!current) return <LoadingSpinner />;

  const answered = feedback?.questionId === current.id;
  const canSubmit = (current.options.length > 0 ? draft : draft.trim()).length > 0;
  const progressPct = Math.round(((index + (answered ? 1 : 0)) / questions.length) * 100);

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <Link
          to={`/lessons/${lessonId}`}
          state={navState}
          aria-label={t('Back to lesson')}
          className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center justify-center transition-colors shrink-0"
        >
          <BackArrowIcon />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xs font-extrabold text-[#4F46E5] dark:text-indigo-400 uppercase tracking-wider m-0">{t('Practice Session')}</h1>
          {navState.lessonTitle && (
            <span className="block text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{navState.lessonTitle}</span>
          )}
        </div>
      </div>

      <div
        className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t('Practice progress')}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r rtl:bg-gradient-to-l from-indigo-500 to-violet-500 transition-all duration-500"
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
            className={`rounded-2xl p-4 ring-1 ${
              feedback.isCorrect === false
                ? 'bg-rose-50 dark:bg-rose-950/40 ring-rose-200 dark:ring-rose-900 text-rose-800 dark:text-rose-300'
                : 'bg-emerald-50 dark:bg-emerald-950/40 ring-emerald-200 dark:ring-emerald-900 text-emerald-800 dark:text-emerald-300'
            }`}
            role="status"
          >
            <p className="font-extrabold text-base m-0">
              {feedback.isCorrect === true
                ? t('✓ Correct!')
                : feedback.isCorrect === false
                  ? t('✗ Not quite')
                  : t('Answer recorded')}
            </p>
            <p className="text-sm m-0 mt-1 opacity-90">
              {feedback.isCorrect === false
                ? t('Keep going — AIM uses this to tailor your next practice.')
                : t('Your answer was saved.')}
            </p>
          </div>
        )}

        {submitError && <Banner variant="error">{submitError}</Banner>}

        {answered ? (
          <Button variant="primary" fullWidth onClick={handleNext}>
            {index + 1 < questions.length ? t('Next question →') : t('Finish practice')}
          </Button>
        ) : (
          <Button variant="primary" fullWidth onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {submitting ? t('Checking…') : t('Check answer')}
          </Button>
        )}
      </div>
    </div>
  );
}
