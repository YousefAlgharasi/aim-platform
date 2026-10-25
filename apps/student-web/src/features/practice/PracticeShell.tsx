import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { Card } from '../../components/common/Card';
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
import styles from './Practice.module.css';

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
      .catch(err => setSummaryError(getErrorMessage(err, 'Failed to load your results')));
  }, [sessionId]);

  const persistCompletion = useCallback(() => {
    setCompletion('saving');
    setCompletionError('');
    markComplete()
      .then(() => setCompletion('saved'))
      .catch(err => {
        setCompletion('failed');
        setCompletionError(
          isStatus(err, 403)
            ? getErrorMessage(err, 'Complete the previous lesson before this one can be completed.')
            : getErrorMessage(err, "We couldn't mark this lesson as complete."),
        );
      });
  }, [markComplete]);

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
        setErrorMessage(getErrorMessage(err, 'Failed to start practice session'));
        if (isStatus(err, 403)) setStatus('locked');
        else if (isStatus(err, 404)) setStatus('expired');
        else setStatus('failed');
      });
  }, [sessionId, lessonId, finish]);

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
    <Link to={lessonId ? `/lessons/${lessonId}` : '/curriculum'} state={navState} className={styles.linkButton}>
      {lessonId ? 'Back to lesson' : 'Browse courses'}
    </Link>
  );

  if (!lessonId) {
    return (
      <div className={styles.container}>
        <EmptyState
          title="Choose a lesson to practice"
          message="Practice sessions are started from a lesson. Open a lesson and select “Start practice”."
          actionLabel="Browse courses"
          onAction={() => navigate('/curriculum')}
        />
      </div>
    );
  }

  if (status === 'loading') return <LoadingSpinner />;

  if (status === 'locked') {
    return (
      <div className={styles.container}>
        <EmptyState
          title="Practice locked"
          message={errorMessage || 'This lesson is locked for you right now. Finish the earlier lessons first.'}
        />
        {lessonLink}
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className={styles.container}>
        <EmptyState
          title="This practice session has ended"
          message="The session is no longer active. Start a new one to keep practicing."
          actionLabel="Start new session"
          onAction={restart}
        />
        {lessonLink}
      </div>
    );
  }

  if (status === 'failed') return <ErrorState message={errorMessage} onRetry={load} />;

  if (status === 'empty') {
    return (
      <div className={styles.container}>
        <EmptyState
          title="No practice questions yet"
          message="This lesson doesn't have any published practice questions yet. Try the AI tutor to work through it instead."
        />
        <div className={styles.actions}>
          {lessonLink}
          <Link
            to={`/ai-teacher?lessonId=${encodeURIComponent(lessonId)}${navState.lessonTitle ? `&lessonTitle=${encodeURIComponent(navState.lessonTitle)}` : ''}`}
            className={styles.linkButtonPrimary}
          >
            Ask AI tutor
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
    <div className={styles.container}>
      <div className={styles.sessionHeader}>
        <h1 className={styles.heading}>Practice</h1>
        {navState.lessonTitle && <span className={styles.sessionMeta}>{navState.lessonTitle}</span>}
      </div>

      <div className={styles.progressHeader}>
        <span className={styles.questionCount}>Question {index + 1} of {questions.length}</span>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Practice progress"
        >
          <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <Card>
        <div className={styles.questionArea}>
          <QuestionRenderer
            question={current}
            selectedAnswer={answered ? feedback.answerValue : draft}
            onAnswerChange={updateDraft}
            disabled={submitting || answered}
          />

          {answered && (
            <div
              className={`${styles.feedbackCard} ${
                feedback.isCorrect === false ? styles.feedbackIncorrect : styles.feedbackCorrect
              }`}
              role="status"
            >
              <p className={styles.feedbackTitle}>
                {feedback.isCorrect === true
                  ? '✓ Correct!'
                  : feedback.isCorrect === false
                    ? '✗ Not quite'
                    : 'Answer recorded'}
              </p>
              <p className={styles.feedbackExplanation}>
                {feedback.isCorrect === false
                  ? 'Keep going — AIM uses this to tailor your next practice.'
                  : 'Your answer was saved.'}
              </p>
            </div>
          )}

          {submitError && <Banner variant="error">{submitError}</Banner>}

          <div className={styles.actions}>
            {answered ? (
              <Button variant="primary" onClick={handleNext}>
                {index + 1 < questions.length ? 'Next question →' : 'Finish practice'}
              </Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit || submitting}>
                {submitting ? 'Checking…' : 'Check answer'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
