import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  clearPlacementProgress,
  completePlacementAttempt,
  errorCode,
  fetchPlacementQuestionAudio,
  fetchPlacementQuestions,
  fetchPlacementSections,
  loadPlacementProgress,
  savePlacementProgress,
  submitPlacementAnswer,
  submitPlacementSpeakingAnswer,
  type PlacementProgress,
  type PlacementQuestion,
  type PlacementSection,
} from './placementApi';
import { QuestionAudio, SpeakingRecorder } from './PlacementAudio';
import { ClockIcon } from '../../components/common/Icons';
import { useI18n } from '../../i18n/I18nContext';
import { BODY, CARD, ChoiceRow, EYEBROW, H2, PageHeader, ProgressBar, TEXTAREA, TimerPill } from './ui';

const SHELL = 'mx-auto w-full max-w-2xl flex flex-col gap-4';

type Phase = 'section' | 'questions' | 'review';

const FALLBACK_LETTERS = ['A', 'B', 'C', 'D'];

function useCountdown(expiresAt: string | null) {
  const target = expiresAt ? Date.parse(expiresAt) : NaN;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (Number.isNaN(target)) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [target]);
  if (Number.isNaN(target)) return null;
  return Math.max(0, Math.floor((target - now) / 1000));
}

function formatRemaining(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mmss = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return h > 0 ? `${h}:${mmss}` : mmss;
}

/**
 * Placement attempt flow (Flutter PlacementSectionPage → PlacementQuestionPage → PlacementSubmitPage).
 * Sections are taken in order; each question is submitted individually; the
 * countdown is derived from the server-issued expires_at.
 */
export function PlacementQuestionUI() {
  const { t, plural } = useI18n();
  const { id: attemptId = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const stateExpiresAt = (location.state as { expiresAt?: string | null } | null)?.expiresAt ?? null;

  const initialProgress = useRef<PlacementProgress | null>(loadPlacementProgress(attemptId));
  const [expiresAt] = useState<string | null>(stateExpiresAt ?? initialProgress.current?.expiresAt ?? null);

  const [sections, setSections] = useState<PlacementSection[] | null>(null);
  const [sectionIndex, setSectionIndex] = useState(initialProgress.current?.sectionIndex ?? 0);
  const [questions, setQuestions] = useState<PlacementQuestion[] | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('section');
  const [answered, setAnswered] = useState(initialProgress.current?.answered ?? 0);
  const [skipped, setSkipped] = useState(initialProgress.current?.skipped ?? 0);

  const [selected, setSelected] = useState<string>('');
  const [recording, setRecording] = useState<Blob | null>(null);
  const [recorderKey, setRecorderKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [expired, setExpired] = useState(false);
  const [inactive, setInactive] = useState(false);
  const [completing, setCompleting] = useState(false);

  const remaining = useCountdown(expiresAt);
  useEffect(() => {
    if (remaining === 0) setExpired(true);
  }, [remaining]);

  // Persist position so a reload resumes in the same section.
  useEffect(() => {
    if (!attemptId) return;
    savePlacementProgress(attemptId, {
      expiresAt,
      sectionIndex,
      questionIndex: phase === 'questions' ? questionIndex : 0,
      answered,
      skipped,
    });
  }, [attemptId, expiresAt, sectionIndex, questionIndex, phase, answered, skipped]);

  const loadSections = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const list = await fetchPlacementSections();
      setSections(list);
      setSectionIndex((i) => Math.min(i, Math.max(0, list.length - 1)));
    } catch (err) {
      setLoadError(getErrorMessage(err, t('Failed to load placement sections')));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { loadSections(); }, [loadSections]);

  const currentSection = sections?.[sectionIndex] ?? null;

  const loadQuestions = useCallback(async (resumeIndex = 0) => {
    if (!currentSection) return;
    setLoading(true);
    setLoadError('');
    try {
      const list = await fetchPlacementQuestions(currentSection.id);
      setQuestions(list);
      setQuestionIndex(Math.min(resumeIndex, Math.max(0, list.length - 1)));
      setSelected('');
      setRecording(null);
      setPhase('questions');
    } catch (err) {
      setLoadError(getErrorMessage(err, t('Failed to load questions')));
    } finally {
      setLoading(false);
    }
  }, [currentSection, t]);

  // Resume directly into the saved question when returning mid-section.
  const resumed = useRef(false);
  useEffect(() => {
    if (resumed.current || !currentSection) return;
    resumed.current = true;
    const saved = initialProgress.current;
    if (saved && saved.questionIndex > 0 && saved.sectionIndex === sectionIndex) {
      loadQuestions(saved.questionIndex);
    }
  }, [currentSection, sectionIndex, loadQuestions]);

  function advance() {
    setSelected('');
    setRecording(null);
    setRecorderKey((k) => k + 1);
    setSubmitError('');
    if (questions && questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      return;
    }
    // Section complete.
    setQuestions(null);
    setQuestionIndex(0);
    if (sections && sectionIndex < sections.length - 1) {
      setSectionIndex(sectionIndex + 1);
      setPhase('section');
    } else {
      setPhase('review');
    }
  }

  function handleAnswerError(err: unknown) {
    const code = errorCode(err);
    if (code === 'DUPLICATE_ANSWER') {
      advance();
      return;
    }
    if (code === 'ATTEMPT_EXPIRED') {
      setExpired(true);
      return;
    }
    if (code === 'ATTEMPT_NOT_ACTIVE' || code === 'ATTEMPT_NOT_FOUND') {
      setInactive(true);
      return;
    }
    setSubmitError(getErrorMessage(err, t('Failed to submit your answer')));
  }

  async function handleSubmit() {
    if (!questions) return;
    const question = questions[questionIndex];
    setSubmitting(true);
    setSubmitError('');
    try {
      if (question.type === 'speaking') {
        if (!recording) return;
        await submitPlacementSpeakingAnswer(attemptId, question.id, recording);
      } else {
        const value = selected.trim();
        if (!value) return;
        await submitPlacementAnswer(attemptId, question.id, value);
      }
      setAnswered((n) => n + 1);
      advance();
    } catch (err) {
      handleAnswerError(err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleSkip() {
    setSkipped((n) => n + 1);
    advance();
  }

  async function handleComplete() {
    setCompleting(true);
    setSubmitError('');
    try {
      await completePlacementAttempt(attemptId);
    } catch (err) {
      const code = errorCode(err);
      if (code !== 'ATTEMPT_ALREADY_SUBMITTED') {
        setSubmitError(getErrorMessage(err, t('Failed to finish the placement test')));
        setCompleting(false);
        return;
      }
    }
    clearPlacementProgress(attemptId);
    navigate(`/placement/${attemptId}/result`, { replace: true });
  }

  // ---------------------------------------------------------------------------

  const timer = remaining !== null && <TimerPill warning={remaining <= 300}>{formatRemaining(remaining)}</TimerPill>;

  if (inactive) {
    return (
      <div className={SHELL}>
        <EmptyState
          title={t('This attempt is no longer active')}
          message={t('It may have been submitted or replaced by a newer attempt.')}
          actionLabel={t('Back to placement test')}
          onAction={() => navigate('/placement')}
        />
      </div>
    );
  }

  if (expired) {
    return (
      <div className={SHELL}>
        <PageHeader eyebrow={t('Placement Test')} title={t("Time's up")} />
        {submitError && <Banner variant="error">{submitError}</Banner>}
        <Card>
          <div className="flex flex-col gap-3">
            <div className="size-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ClockIcon className="size-5" />
            </div>
            <p className={BODY}>
              {t('The time limit for this placement test has been reached. Your answers so far have been saved — finish now to see your level.')}
            </p>
            <Button size="lg" onClick={handleComplete} disabled={completing}>
              {completing ? t('Finishing…') : t('See my result')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;
  if (loadError) {
    return (
      <ErrorState
        message={loadError}
        onRetry={phase === 'section' && sections ? () => loadQuestions(0) : loadSections}
      />
    );
  }
  if (!sections || sections.length === 0) {
    return (
      <div className={SHELL}>
        <EmptyState
          title={t('No sections found')}
          message={t('This placement test has no sections yet.')}
          actionLabel={t('Back')}
          onAction={() => navigate('/placement')}
        />
      </div>
    );
  }

  const countText = (n: number) =>
    plural(n, {
      one: t('1 question'),
      two: t('2 questions'),
      few: t('{n} questions#few', { n }),
      other: t('{n} questions', { n }),
    });

  const progressValue = phase === 'review' ? sections.length : sectionIndex;
  const header = (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {phase === 'review'
            ? t('All sections complete')
            : t('Section {current} of {total}', { current: sectionIndex + 1, total: sections.length })}
        </span>
        {timer}
      </div>
      <ProgressBar value={progressValue} total={sections.length} label={t('Section progress')} />
    </div>
  );

  // ---- Review / submit -------------------------------------------------------
  if (phase === 'review') {
    return (
      <div className={SHELL}>
        {header}
        {submitError && <Banner variant="error">{submitError}</Banner>}
        <Card>
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 opacity-20 blur-lg" />
              <div className="relative size-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/25 rotate-3">
                <svg className="size-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
            </div>
            <h2 className={H2}>{t('Ready to submit?')}</h2>
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm text-start">
              <div className="rounded-2xl ring-1 ring-slate-200/80 dark:ring-slate-700 bg-white/80 dark:bg-slate-800/80 p-4">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('Answered')}</span>
                <span className="block mt-0.5 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{answered}</span>
              </div>
              <div className="rounded-2xl ring-1 ring-slate-200/80 dark:ring-slate-700 bg-white/80 dark:bg-slate-800/80 p-4">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('Skipped')}</span>
                <span className="block mt-0.5 text-xl font-extrabold text-amber-600 dark:text-amber-400">{skipped}</span>
              </div>
            </div>
            <p className={`${BODY} max-w-sm`}>
              {skipped > 0
                ? t('You answered {answered} and skipped {skipped}. Once submitted, AIM will calculate your level.', {
                    answered: countText(answered),
                    skipped,
                  })
                : t('You answered {answered}. Once submitted, AIM will calculate your level.', {
                    answered: countText(answered),
                  })}
            </p>
            <Button size="lg" onClick={handleComplete} disabled={completing} fullWidth>
              {completing ? t('Submitting…') : t('Submit placement test')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ---- Section intro ---------------------------------------------------------
  if (phase === 'section' || !questions) {
    const section = sections[sectionIndex];
    return (
      <div className={SHELL}>
        {header}
        <Card>
          <div className="flex flex-col gap-3">
            <span className={EYEBROW}>{t('Section {n}', { n: sectionIndex + 1 })}</span>
            <h2 className={H2}>{t(section.title)}</h2>
            <p className={BODY}>
              {t('{count}. The timer keeps running between sections.', { count: countText(section.total_questions) })}
            </p>
            <Button size="lg" onClick={() => loadQuestions(0)}>{t('Start section')}</Button>
          </div>
        </Card>
        <Link to="/placement" className="text-center text-sm font-semibold text-[#4F46E5] dark:text-indigo-400 hover:underline">
          {t('Exit — you can continue later')}
        </Link>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className={SHELL}>
        {header}
        <EmptyState
          title={t('No questions in this section')}
          message={t('This section has no questions yet.')}
          actionLabel={t('Continue')}
          onAction={advance}
        />
      </div>
    );
  }

  // ---- Question --------------------------------------------------------------
  const question = questions[questionIndex];
  const isSpeaking = question.type === 'speaking';
  const isChoice = question.type === 'multiple_choice' || question.type === 'listening_choice';
  const isTrueFalse = question.type === 'true_false';
  const isText = question.type === 'fill_blank' || question.type === 'writing';
  const isKnownType = isSpeaking || isChoice || isTrueFalse || isText;
  const canSubmit = !submitting && (isSpeaking ? !!recording : isKnownType && selected.trim().length > 0);

  const choiceOptions = isChoice
    ? question.options.length > 0
      ? question.options
      : FALLBACK_LETTERS.map((l) => ({ id: l, text: l }))
    : isTrueFalse
      ? [{ id: 'true', text: t('True') }, { id: 'false', text: t('False') }]
      : [];

  return (
    <div className={SHELL}>
      {header}

      {submitError && <Banner variant="error">{submitError}</Banner>}

      <div className={`${CARD} p-4 sm:p-5 flex flex-col gap-3.5`}>
        <p className={`m-0 ${EYEBROW} !font-semibold !text-[11px]`}>
          {t(sections[sectionIndex].title)} · {t('Question {current} of {total}', { current: questionIndex + 1, total: questions.length })}
        </p>
        <h2
          className={`m-0 text-base sm:text-lg leading-snug text-[#0F172A] dark:text-white ${
            question.type === 'reading' ? 'font-normal italic text-slate-500 dark:text-slate-400' : 'font-medium'
          }`}
        >
          {question.text}
        </h2>

        {question.type === 'listening_choice' && (
          <QuestionAudio
            key={question.id}
            available={question.has_listening_audio}
            load={() => fetchPlacementQuestionAudio(question.id)}
          />
        )}

        {isText && (
          <label className="block">
            <span className="sr-only">{t('Your answer')}</span>
            <textarea
              className={TEXTAREA}
              rows={question.type === 'writing' ? 8 : 3}
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              disabled={submitting}
              placeholder={question.type === 'writing' ? t('Type your response here…') : t('Type your answer here…')}
            />
          </label>
        )}

        {isSpeaking && (
          <SpeakingRecorder key={`${question.id}-${recorderKey}`} disabled={submitting} onRecorded={setRecording} />
        )}

        {!isKnownType && (
          <p className={BODY}>{t("This question type ({type}) can't be answered here. Please skip it.", { type: question.type })}</p>
        )}
      </div>

      {choiceOptions.length > 0 && (
        <fieldset className="m-0 p-0 border-0 min-w-0 flex flex-col gap-2.5" disabled={submitting}>
          <legend className="sr-only">{t('Select your answer')}</legend>
          {choiceOptions.map((option) => (
            <ChoiceRow
              key={option.id}
              name={`answer-${question.id}`}
              value={option.id}
              selected={selected === option.id}
              onChange={() => setSelected(option.id)}
              keyLabel={isChoice && option.text !== option.id ? option.id : undefined}
            >
              {option.text}
            </ChoiceRow>
          ))}
        </fieldset>
      )}

      <div className="flex gap-3 pt-1">
        <Button variant="secondary" size="lg" className="flex-1" onClick={handleSkip} disabled={submitting}>{t('Skip')}</Button>
        <Button size="lg" className="flex-[2]" onClick={handleSubmit} disabled={!canSubmit}>
          {submitting
            ? isSpeaking ? t('Uploading…') : t('Submitting…')
            : questionIndex === questions.length - 1 ? t('Submit & finish section') : t('Submit answer')}
        </Button>
      </div>
    </div>
  );
}
