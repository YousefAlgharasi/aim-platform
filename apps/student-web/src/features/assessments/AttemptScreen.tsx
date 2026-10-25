import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { QuestionAudio } from '../placement/PlacementAudio';
import {
  fetchAssessmentQuestionAudio,
  fetchAttemptQuestions,
  resumeAssessmentAttempt,
  submitAssessmentAnswer,
  submitAssessmentAttempt,
  type AttemptQuestion,
} from './assessmentsApi';
import { assessmentErrorMessage, isErrorCode } from './assessmentErrors';
import styles from './Assessment.module.css';

type SaveState = 'saving' | 'saved' | 'error';

function formatRemaining(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mmss = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return h > 0 ? `${h}:${mmss}` : mmss;
}

/**
 * Assessment attempt (Flutter AttemptPage + SubmitAttemptPage).
 * GET .../resume → GET .../questions; each answer is sent immediately via
 * POST .../answers (upsert); POST .../submit grades on the backend.
 */
export function AttemptScreen() {
  const { assessmentId = '', attemptId = '' } = useParams<{ assessmentId: string; attemptId: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<AttemptQuestion[] | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notResumable, setNotResumable] = useState(false);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});
  const [saveError, setSaveError] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [now, setNow] = useState(() => Date.now());
  const pending = useRef(new Map<string, Promise<boolean>>());
  const debounce = useRef(new Map<string, number>());

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setNotResumable(false);
    try {
      const resumed = await resumeAssessmentAttempt(attemptId);
      setExpiresAt(resumed?.expiresAt ?? null);
      const list = await fetchAttemptQuestions(attemptId);
      setQuestions(list);
      setCurrent(0);
    } catch (err) {
      if (isErrorCode(err, 'ATTEMPT_NOT_RESUMABLE')) setNotResumable(true);
      else setError(assessmentErrorMessage(err, 'Failed to load this attempt'));
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!expiresAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  useEffect(() => {
    const timers = debounce.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const saveAnswer = useCallback((linkId: string, value: string) => {
    if (!value.trim()) return;
    setSaveState((s) => ({ ...s, [linkId]: 'saving' }));
    setSaveError('');
    const p = submitAssessmentAnswer(attemptId, linkId, value)
      .then(() => {
        setSaveState((s) => ({ ...s, [linkId]: 'saved' }));
        return true;
      })
      .catch((err) => {
        setSaveState((s) => ({ ...s, [linkId]: 'error' }));
        setSaveError(assessmentErrorMessage(err, 'Your answer could not be saved. Please try again.'));
        return false;
      })
      .finally(() => {
        if (pending.current.get(linkId) === p) pending.current.delete(linkId);
      });
    pending.current.set(linkId, p);
  }, [attemptId]);

  function selectOption(linkId: string, optionId: string) {
    setAnswers((a) => ({ ...a, [linkId]: optionId }));
    saveAnswer(linkId, optionId);
  }

  function changeText(linkId: string, text: string) {
    setAnswers((a) => ({ ...a, [linkId]: text }));
    const existing = debounce.current.get(linkId);
    if (existing) window.clearTimeout(existing);
    debounce.current.set(
      linkId,
      window.setTimeout(() => {
        debounce.current.delete(linkId);
        saveAnswer(linkId, text);
      }, 500),
    );
  }

  async function flushPending(): Promise<boolean> {
    debounce.current.forEach((t, linkId) => {
      window.clearTimeout(t);
      const value = answers[linkId];
      if (value !== undefined) saveAnswer(linkId, value);
    });
    debounce.current.clear();
    const results = await Promise.all(Array.from(pending.current.values()));
    return results.every(Boolean);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError('');
    try {
      if (!(await flushPending())) {
        setSubmitError('Some answers could not be saved. Retry saving them before submitting.');
        setSubmitting(false);
        return;
      }
      await submitAssessmentAttempt(attemptId);
      navigate(`/assessments/${assessmentId}/result/${attemptId}`, { replace: true });
    } catch (err) {
      if (isErrorCode(err, 'ATTEMPT_ALREADY_SUBMITTED')) {
        navigate(`/assessments/${assessmentId}/result/${attemptId}`, { replace: true });
        return;
      }
      setSubmitError(assessmentErrorMessage(err, 'Failed to submit your attempt'));
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (notResumable) {
    return (
      <div className={styles.attemptShell}>
        <EmptyState
          title="This attempt is closed"
          message="It has already been submitted or can no longer be continued."
          actionLabel="View result"
          onAction={() => navigate(`/assessments/${assessmentId}/result/${attemptId}`)}
        />
        <Link to={`/assessments/${assessmentId}`} className={styles.backLink}>Back to assessment</Link>
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!questions || questions.length === 0) {
    return (
      <div className={styles.attemptShell}>
        <EmptyState title="No questions yet" message="This assessment doesn't have any questions yet." />
        <Link to={`/assessments/${assessmentId}`} className={styles.backLink}>Back to assessment</Link>
      </div>
    );
  }

  const remaining = expiresAt ? Math.max(0, Math.floor((Date.parse(expiresAt) - now) / 1000)) : null;
  const timeUp = remaining === 0;
  const question = questions[current];
  const linkId = question.assessmentQuestionLinkId;
  const answeredCount = questions.filter((q) => (answers[q.assessmentQuestionLinkId] ?? '').trim()).length;
  const anySaving = Object.values(saveState).includes('saving');
  const state = saveState[linkId];

  return (
    <div className={styles.attemptShell}>
      <div className={styles.timerBar}>
        <span className={styles.attemptProgress}>
          Question {current + 1} of {questions.length} · {answeredCount} answered
        </span>
        {remaining !== null && (
          <span className={`${styles.timer} ${remaining <= 60 ? styles.timerWarning : ''}`}>
            ⏱ {formatRemaining(remaining)}
          </span>
        )}
      </div>

      {timeUp && <Banner variant="warning">Time is up. Submit your attempt now.</Banner>}
      {saveError && <Banner variant="error">{saveError}</Banner>}

      <nav className={styles.questionNav} aria-label="Questions">
        {questions.map((q, i) => {
          const answered = !!(answers[q.assessmentQuestionLinkId] ?? '').trim();
          return (
            <button
              key={q.assessmentQuestionLinkId}
              type="button"
              className={`${styles.questionDot} ${i === current ? styles.dotCurrent : ''} ${answered && i !== current ? styles.dotAnswered : ''}`}
              onClick={() => setCurrent(i)}
              aria-current={i === current ? 'step' : undefined}
              aria-label={`Question ${i + 1}${answered ? ', answered' : ''}`}
            >
              {i + 1}
            </button>
          );
        })}
      </nav>

      <Card>
        <div className={styles.questionArea}>
          <span className={styles.questionLabel}>Question {current + 1}</span>
          <h2 className={styles.questionPrompt}>{question.prompt}</h2>

          {question.type === 'listening_choice' && (
            <QuestionAudio key={question.id} load={() => fetchAssessmentQuestionAudio(question.id)} />
          )}

          {question.options.length > 0 ? (
            <fieldset className={styles.options} disabled={submitting}>
              <legend className={styles.srOnly}>Select your answer</legend>
              {question.options.map((option) => {
                const checked = answers[linkId] === option.id;
                return (
                  <label key={option.id} className={`${styles.option} ${checked ? styles.optionSelected : ''}`}>
                    <input
                      type="radio"
                      name={`answer-${linkId}`}
                      value={option.id}
                      checked={checked}
                      onChange={() => selectOption(linkId, option.id)}
                      className={styles.srOnly}
                    />
                    <span className={styles.optionKey}>{option.label}</span>
                    <span>{option.text}</span>
                  </label>
                );
              })}
            </fieldset>
          ) : (
            <label className={styles.textAnswer}>
              <span className={styles.srOnly}>Your answer</span>
              <textarea
                className={styles.textArea}
                rows={3}
                value={answers[linkId] ?? ''}
                onChange={(e) => changeText(linkId, e.target.value)}
                disabled={submitting}
                placeholder="Type your answer…"
              />
            </label>
          )}

          <span className={styles.saveStatus} aria-live="polite">
            {state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved' : state === 'error' ? (
              <button type="button" className={styles.linkButton} onClick={() => saveAnswer(linkId, answers[linkId] ?? '')}>
                Not saved — retry
              </button>
            ) : ''}
          </span>
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => setCurrent((c) => c - 1)} disabled={current === 0}>
            Previous
          </Button>
          {current < questions.length - 1 ? (
            <Button onClick={() => setCurrent((c) => c + 1)}>Next</Button>
          ) : (
            <Button onClick={() => setConfirmOpen(true)} disabled={submitting}>Review &amp; submit</Button>
          )}
        </div>
      </Card>

      <Button variant="ghost" onClick={() => setConfirmOpen(true)} disabled={submitting} fullWidth>
        Submit attempt
      </Button>

      <Modal open={confirmOpen} onClose={() => !submitting && setConfirmOpen(false)} title="Submit attempt?">
        <div className={styles.modalBody}>
          <p className={styles.description}>
            You answered {answeredCount} of {questions.length} questions. After submitting you can't change your answers.
          </p>
          {submitError && <Banner variant="error">{submitError}</Banner>}
          <Button onClick={handleSubmit} disabled={submitting} fullWidth>
            {submitting ? 'Submitting…' : anySaving ? 'Saving answers…' : 'Submit'}
          </Button>
          <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={submitting} fullWidth>
            Keep working
          </Button>
        </div>
      </Modal>
    </div>
  );
}
