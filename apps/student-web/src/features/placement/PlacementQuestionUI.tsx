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
import styles from './Placement.module.css';

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
      setLoadError(getErrorMessage(err, 'Failed to load placement sections'));
    } finally {
      setLoading(false);
    }
  }, []);

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
      setLoadError(getErrorMessage(err, 'Failed to load questions'));
    } finally {
      setLoading(false);
    }
  }, [currentSection]);

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
    setSubmitError(getErrorMessage(err, 'Failed to submit your answer'));
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
        setSubmitError(getErrorMessage(err, 'Failed to finish the placement test'));
        setCompleting(false);
        return;
      }
    }
    clearPlacementProgress(attemptId);
    navigate(`/placement/${attemptId}/result`, { replace: true });
  }

  // ---------------------------------------------------------------------------

  const timer = remaining !== null && (
    <span className={`${styles.timer} ${remaining <= 300 ? styles.timerWarning : ''}`} aria-live="off">
      ⏱ {formatRemaining(remaining)}
    </span>
  );

  if (inactive) {
    return (
      <div className={styles.container}>
        <EmptyState
          title="This attempt is no longer active"
          message="It may have been submitted or replaced by a newer attempt."
          actionLabel="Back to placement test"
          onAction={() => navigate('/placement')}
        />
      </div>
    );
  }

  if (expired) {
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>Time's up</h1>
        {submitError && <Banner variant="error">{submitError}</Banner>}
        <Card>
          <div className={styles.entryContent}>
            <p className={styles.description}>
              The time limit for this placement test has been reached. Your answers so far have been
              saved — finish now to see your level.
            </p>
            <Button onClick={handleComplete} disabled={completing}>
              {completing ? 'Finishing…' : 'See my result'}
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
      <div className={styles.container}>
        <EmptyState
          title="No sections found"
          message="This placement test has no sections yet."
          actionLabel="Back"
          onAction={() => navigate('/placement')}
        />
      </div>
    );
  }

  const header = (
    <div className={styles.progressHeader}>
      <div className={styles.headerRow}>
        <span className={styles.questionCount}>
          {phase === 'review' ? 'All sections complete' : `Section ${sectionIndex + 1} of ${sections.length}`}
        </span>
        {timer}
      </div>
      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{ width: `${((phase === 'review' ? sections.length : sectionIndex) / sections.length) * 100}%` }}
          role="progressbar"
          aria-valuenow={phase === 'review' ? sections.length : sectionIndex}
          aria-valuemin={0}
          aria-valuemax={sections.length}
        />
      </div>
    </div>
  );

  // ---- Review / submit -------------------------------------------------------
  if (phase === 'review') {
    return (
      <div className={styles.container}>
        {header}
        {submitError && <Banner variant="error">{submitError}</Banner>}
        <Card>
          <div className={styles.entryContent}>
            <h2 className={styles.subtitle}>Ready to submit?</h2>
            <p className={styles.description}>
              You answered {answered} question{answered === 1 ? '' : 's'}
              {skipped > 0 ? ` and skipped ${skipped}` : ''}. Once submitted, AIM will calculate your level.
            </p>
            <Button onClick={handleComplete} disabled={completing}>
              {completing ? 'Submitting…' : 'Submit placement test'}
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
      <div className={styles.container}>
        {header}
        <Card>
          <div className={styles.entryContent}>
            <span className={styles.resultLabel}>Section {sectionIndex + 1}</span>
            <h2 className={styles.subtitle}>{section.title}</h2>
            <p className={styles.description}>
              {section.total_questions} question{section.total_questions === 1 ? '' : 's'}. The timer keeps running
              between sections.
            </p>
            <Button onClick={() => loadQuestions(0)}>Start section</Button>
          </div>
        </Card>
        <Link to="/placement" className={styles.backLink}>Exit — you can continue later</Link>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className={styles.container}>
        {header}
        <EmptyState
          title="No questions in this section"
          message="This section has no questions yet."
          actionLabel="Continue"
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
      ? [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }]
      : [];

  return (
    <div className={styles.container}>
      {header}
      <span className={styles.questionCount}>
        {sections[sectionIndex].title} · Question {questionIndex + 1} of {questions.length}
      </span>

      {submitError && <Banner variant="error">{submitError}</Banner>}

      <Card>
        <div className={styles.questionContent}>
          <h2 className={`${styles.questionText} ${question.type === 'reading' ? styles.questionReading : ''}`}>
            {question.text}
          </h2>

          {question.type === 'listening_choice' && (
            <QuestionAudio
              key={question.id}
              available={question.has_listening_audio}
              load={() => fetchPlacementQuestionAudio(question.id)}
            />
          )}

          {choiceOptions.length > 0 && (
            <fieldset className={styles.options} disabled={submitting}>
              <legend className={styles.srOnly}>Select your answer</legend>
              {choiceOptions.map((option) => (
                <label
                  key={option.id}
                  className={`${styles.option} ${selected === option.id ? styles.optionSelected : ''}`}
                >
                  <input
                    type="radio"
                    name={`answer-${question.id}`}
                    value={option.id}
                    checked={selected === option.id}
                    onChange={() => setSelected(option.id)}
                    className={styles.srOnly}
                  />
                  <span className={styles.optionRadio} />
                  <span>
                    {isChoice && option.text !== option.id && <strong className={styles.optionKey}>{option.id}.</strong>}
                    {option.text}
                  </span>
                </label>
              ))}
            </fieldset>
          )}

          {isText && (
            <label className={styles.textAnswer}>
              <span className={styles.srOnly}>Your answer</span>
              <textarea
                className={styles.textArea}
                rows={question.type === 'writing' ? 8 : 3}
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                disabled={submitting}
                placeholder={question.type === 'writing' ? 'Type your response here…' : 'Type your answer here…'}
              />
            </label>
          )}

          {isSpeaking && (
            <SpeakingRecorder key={`${question.id}-${recorderKey}`} disabled={submitting} onRecorded={setRecording} />
          )}

          {!isKnownType && (
            <p className={styles.description}>This question type ({question.type}) can't be answered here. Please skip it.</p>
          )}
        </div>
      </Card>

      <div className={styles.actionRow}>
        <Button variant="ghost" onClick={handleSkip} disabled={submitting}>Skip</Button>
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {submitting
            ? isSpeaking ? 'Uploading…' : 'Submitting…'
            : questionIndex === questions.length - 1 ? 'Submit & finish section' : 'Submit answer'}
        </Button>
      </div>
    </div>
  );
}
