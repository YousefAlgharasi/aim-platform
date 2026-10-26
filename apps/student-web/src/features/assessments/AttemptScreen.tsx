import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { useI18n } from '../../i18n/I18nContext';
import { assessmentErrorMessage, isErrorCode } from './assessmentErrors';
import { BODY, CARD, ChoiceRow, EYEBROW, ProgressBar, TEXTAREA, TimerPill } from '../placement/ui';

const SHELL = 'mx-auto w-full max-w-2xl flex flex-col gap-4';
const LINK_BTN = 'border-0 bg-transparent p-0 font-semibold text-[#4F46E5] dark:text-indigo-400 underline cursor-pointer';

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
  const { t, formatNumber } = useI18n();
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
      else setError(assessmentErrorMessage(err, t('Failed to load this attempt')));
    } finally {
      setLoading(false);
    }
  }, [attemptId, t]);

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
        setSaveError(assessmentErrorMessage(err, t('Your answer could not be saved. Please try again.')));
        return false;
      })
      .finally(() => {
        if (pending.current.get(linkId) === p) pending.current.delete(linkId);
      });
    pending.current.set(linkId, p);
  }, [attemptId, t]);

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
        setSubmitError(t('Some answers could not be saved. Retry saving them before submitting.'));
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
      setSubmitError(assessmentErrorMessage(err, t('Failed to submit your attempt')));
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (notResumable) {
    return (
      <div className={SHELL}>
        <EmptyState
          title={t('This attempt is closed')}
          message={t('It has already been submitted or can no longer be continued.')}
          actionLabel={t('View result')}
          onAction={() => navigate(`/assessments/${assessmentId}/result/${attemptId}`)}
        />
        <Link to={`/assessments/${assessmentId}`} className="text-center text-sm font-semibold text-[#4F46E5] dark:text-indigo-400 hover:underline">{t('Back to assessment')}</Link>
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!questions || questions.length === 0) {
    return (
      <div className={SHELL}>
        <EmptyState title={t('No questions yet')} message={t("This assessment doesn't have any questions yet.")} />
        <Link to={`/assessments/${assessmentId}`} className="text-center text-sm font-semibold text-[#4F46E5] dark:text-indigo-400 hover:underline">{t('Back to assessment')}</Link>
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
    <div className={SHELL}>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('Question {current} of {total} · {answered} answered', { current: formatNumber(current + 1), total: formatNumber(questions.length), answered: formatNumber(answeredCount) })}
          </span>
          {remaining !== null && <TimerPill warning={remaining <= 60}>{formatRemaining(remaining)}</TimerPill>}
        </div>
        <ProgressBar value={answeredCount} total={questions.length} label={t('Answered questions')} />
      </div>

      {timeUp && <Banner variant="warning">{t('Time is up. Submit your attempt now.')}</Banner>}
      {saveError && <Banner variant="error">{saveError}</Banner>}

      <nav className="flex flex-wrap gap-1.5" aria-label={t('Questions')}>
        {questions.map((q, i) => {
          const answered = !!(answers[q.assessmentQuestionLinkId] ?? '').trim();
          const isCurrent = i === current;
          return (
            <button
              key={q.assessmentQuestionLinkId}
              type="button"
              className={`size-10 rounded-xl text-xs font-bold cursor-pointer transition-all duration-150 ${
                isCurrent
                  ? 'bg-[#4F46E5] text-white border-0 shadow-md'
                  : answered
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-900 border-0'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 ring-1 ring-[#E2E8F0] dark:ring-slate-700 border-0 hover:ring-[#C7D2FE]'
              }`}
              onClick={() => setCurrent(i)}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={answered ? t('Question {n}, answered', { n: i + 1 }) : t('Question {n}', { n: i + 1 })}
            >
              {formatNumber(i + 1)}
            </button>
          );
        })}
      </nav>

      <div className={`${CARD} p-4 sm:p-5 flex flex-col gap-3.5`}>
        <span className={EYEBROW}>{t('Question {n}', { n: formatNumber(current + 1) })}</span>
        <h2 className="m-0 text-base sm:text-lg font-medium leading-snug text-[#0F172A] dark:text-white">{question.prompt}</h2>

        {question.type === 'listening_choice' && (
          <QuestionAudio key={question.id} load={() => fetchAssessmentQuestionAudio(question.id)} />
        )}

        {question.options.length === 0 && (
          <label className="block">
            <span className="sr-only">{t('Your answer')}</span>
            <textarea
              className={TEXTAREA}
              rows={3}
              value={answers[linkId] ?? ''}
              onChange={(e) => changeText(linkId, e.target.value)}
              disabled={submitting}
              placeholder={t('Type your answer…')}
            />
          </label>
        )}

        <span className="min-h-4 text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
          {state === 'saving' ? t('Saving…') : state === 'saved' ? t('Saved') : state === 'error' ? (
            <button type="button" className={LINK_BTN} onClick={() => saveAnswer(linkId, answers[linkId] ?? '')}>
              {t('Not saved — retry')}
            </button>
          ) : ''}
        </span>
      </div>

      {question.options.length > 0 && (
        <fieldset className="m-0 p-0 border-0 min-w-0 flex flex-col gap-2.5" disabled={submitting}>
          <legend className="sr-only">{t('Select your answer')}</legend>
          {question.options.map((option) => (
            <ChoiceRow
              key={option.id}
              name={`answer-${linkId}`}
              value={option.id}
              selected={answers[linkId] === option.id}
              onChange={() => selectOption(linkId, option.id)}
              keyLabel={option.label}
            >
              {option.text}
            </ChoiceRow>
          ))}
        </fieldset>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" size="lg" className="flex-1" onClick={() => setCurrent((c) => c - 1)} disabled={current === 0}>
          {t('Previous')}
        </Button>
        {current < questions.length - 1 ? (
          <Button size="lg" className="flex-[2]" onClick={() => setCurrent((c) => c + 1)}>{t('Next')}</Button>
        ) : (
          <Button size="lg" className="flex-[2]" onClick={() => setConfirmOpen(true)} disabled={submitting}>{t('Review & submit')}</Button>
        )}
      </div>

      <Button variant="ghost" onClick={() => setConfirmOpen(true)} disabled={submitting} fullWidth>
        {t('Submit attempt')}
      </Button>

      <Modal open={confirmOpen} onClose={() => !submitting && setConfirmOpen(false)} title={t('Submit attempt?')}>
        <div className="flex flex-col gap-3">
          <p className={BODY}>
            {t("You answered {answered} of {total} questions. After submitting you can't change your answers.", { answered: formatNumber(answeredCount), total: formatNumber(questions.length) })}
          </p>
          {submitError && <Banner variant="error">{submitError}</Banner>}
          <Button onClick={handleSubmit} disabled={submitting} fullWidth>
            {submitting ? t('Submitting…') : anySaving ? t('Saving answers…') : t('Submit')}
          </Button>
          <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={submitting} fullWidth>
            {t('Keep working')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
