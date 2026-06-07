import { useMemo, useState } from 'react';
import {
  API_BASE_URL,
  getPilotLesson,
  listPilotLessons,
  startPilotLessonSession,
  submitPilotSessionAttempts,
} from '../shared/api/client';

const MANUAL_CORRECTNESS_OPTIONS = [
  { value: 'unknown', label: 'تحتاج مراجعة' },
  { value: 'correct', label: 'إجابة صحيحة' },
  { value: 'wrong', label: 'إجابة تحتاج تصحيحا' },
];

function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'غير متوفر';
  }

  if (typeof value === 'boolean') {
    return value ? 'نعم' : 'لا';
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }

  return String(value);
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function getTimeOfDay() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'morning';
  }

  if (hour >= 12 && hour < 17) {
    return 'afternoon';
  }

  if (hour >= 17 && hour < 21) {
    return 'evening';
  }

  return 'night';
}

function secondsSince(startedAt) {
  if (!startedAt) {
    return 1;
  }

  const elapsed = (Date.now() - startedAt) / 1000;
  return Math.max(1, Math.round(elapsed * 10) / 10);
}

function clampDifficulty(value) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return 1;
  }

  return Math.max(1, Math.min(5, Math.round(numeric)));
}

function safeStudentId(value) {
  const numeric = Number(value);

  if (!Number.isInteger(numeric) || numeric <= 0) {
    return null;
  }

  return numeric;
}

function getQuestionId(question) {
  return String(question.question_id || question.id || '');
}

function getChoiceText(choice) {
  if (typeof choice === 'string') {
    return choice;
  }

  return String(
    choice?.choice_text ||
      choice?.text ||
      choice?.label ||
      choice?.value ||
      choice?.answer ||
      '',
  );
}

function getChoiceMetadata(choice) {
  if (typeof choice === 'string') {
    return {};
  }

  return choice?.metadata || choice?.metadata_json || {};
}

function readBooleanLike(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', 'yes', 'correct', '1'].includes(normalized)) {
      return true;
    }

    if (['false', 'no', 'wrong', '0'].includes(normalized)) {
      return false;
    }
  }

  return null;
}

function getCorrectAnswerFromQuestion(question) {
  const metadata = question.metadata || {};

  return (
    question.correct_answer ||
    question.correctAnswer ||
    metadata.correct_answer ||
    metadata.correctAnswer ||
    metadata.answer ||
    metadata.expected_answer ||
    metadata.expectedAnswer ||
    ''
  );
}

function getQuestionHint(question) {
  const metadata = question.metadata || {};

  return (
    metadata.hint ||
    metadata.help ||
    metadata.teaching_hint ||
    metadata.teachingHint ||
    metadata.explanation ||
    question.explanation ||
    ''
  );
}

function inferCorrectness(question, answerState) {
  if (answerState.skip) {
    return {
      value: false,
      source: 'skip',
      label: 'تم تجاوز السؤال',
    };
  }

  if (!answerState.selectedAnswer) {
    return {
      value: null,
      source: 'missing_answer',
      label: 'لم يتم اختيار إجابة بعد',
    };
  }

  const choices = Array.isArray(question.choices) ? question.choices : [];
  const selectedChoice = choices.find(
    (choice) => normalizeText(getChoiceText(choice)) === normalizeText(answerState.selectedAnswer),
  );

  if (selectedChoice) {
    const metadata = getChoiceMetadata(selectedChoice);
    const metadataKeys = [
      'is_correct',
      'isCorrect',
      'correct',
      'is_answer',
      'isAnswer',
      'answer',
    ];

    for (const key of metadataKeys) {
      const parsed = readBooleanLike(metadata[key]);
      if (parsed !== null) {
        return {
          value: parsed,
          source: `choice.metadata.${key}`,
          label: parsed ? 'صحيحة حسب بيانات الاختيار' : 'تحتاج تصحيحا حسب بيانات الاختيار',
        };
      }
    }
  }

  const correctAnswer = getCorrectAnswerFromQuestion(question);
  if (correctAnswer) {
    const isCorrect = normalizeText(correctAnswer) === normalizeText(answerState.selectedAnswer);
    return {
      value: isCorrect,
      source: 'question.correct_answer',
      label: isCorrect ? 'صحيحة حسب مفتاح الإجابة' : 'تحتاج تصحيحا حسب مفتاح الإجابة',
    };
  }

  if (answerState.correctness === 'correct') {
    return {
      value: true,
      source: 'manual_review',
      label: 'صحيحة حسب المراجعة اليدوية',
    };
  }

  if (answerState.correctness === 'wrong') {
    return {
      value: false,
      source: 'manual_review',
      label: 'تحتاج تصحيحا حسب المراجعة اليدوية',
    };
  }

  return {
    value: null,
    source: 'manual_required',
    label: 'تحتاج مراجعة يدوية قبل الإرسال',
  };
}

function createEmptyAnswerState() {
  return {
    selectedAnswer: '',
    skip: false,
    hintUsed: false,
    attempts: 1,
    answerChanged: false,
    confidence: 3,
    correctness: 'unknown',
    startedAt: Date.now(),
    responseTime: null,
  };
}

function buildAttemptPayload({
  question,
  answerState,
  correctness,
  studentId,
  sessionId,
  lesson,
  index,
}) {
  return {
    student_id: studentId,
    skill_id: String(question.skill_id || lesson?.main_skill_id || 'unknown_skill'),
    question_id: getQuestionId(question),
    session_id: sessionId,
    is_correct: Boolean(correctness.value),
    response_time: Math.max(1, Number(answerState.responseTime || secondsSince(answerState.startedAt))),
    attempts: Math.max(1, Number(answerState.attempts) || 1),
    difficulty: clampDifficulty(question.difficulty || lesson?.difficulty || 1),
    hint_used: Boolean(answerState.hintUsed),
    skip: Boolean(answerState.skip),
    answer_changed: Boolean(answerState.answerChanged),
    time_of_day: getTimeOfDay(),
    session_position: index + 1,
  };
}

function Badge({ children, tone = 'blue' }) {
  return <span className={`lesson-session-badge lesson-session-badge--${tone}`}>{children}</span>;
}

function Field({ label, value }) {
  return (
    <div className="lesson-session-field">
      <span>{label}</span>
      <strong>{formatValue(value)}</strong>
    </div>
  );
}

function Meter({ label, value }) {
  const numeric = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className="lesson-session-meter">
      <div>
        <span>{label}</span>
        <strong>{formatValue(numeric)}%</strong>
      </div>
      <div className="lesson-session-meter__track">
        <span style={{ width: `${numeric}%` }} />
      </div>
    </div>
  );
}

function renderContentValue(value, keyPrefix = 'content') {
  if (value === null || value === undefined || value === '') {
    return <p className="lesson-session-muted">لا يوجد محتوى درس متاح بعد.</p>;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return <p>{formatValue(value)}</p>;
  }

  if (Array.isArray(value)) {
    return (
      <div className="lesson-session-content-list">
        {value.map((item, index) => (
          <div key={`${keyPrefix}-${index}`} className="lesson-session-content-item">
            {renderContentValue(item, `${keyPrefix}-${index}`)}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === 'object') {
    return (
      <div className="lesson-session-content-grid">
        {Object.entries(value).map(([key, nestedValue]) => (
          <div key={`${keyPrefix}-${key}`} className="lesson-session-content-item">
            <span>{key.replaceAll('_', ' ')}</span>
            {renderContentValue(nestedValue, `${keyPrefix}-${key}`)}
          </div>
        ))}
      </div>
    );
  }

  return <p>{String(value)}</p>;
}

function LessonOverview({ lesson }) {
  if (!lesson) {
    return (
      <section className="lesson-session-panel">
        <h2>لم يتم اختيار درس</h2>
        <p className="lesson-session-muted">
          حمّل دروس الاختبار ثم ابدأ جلسة لعرض محتوى الدرس والأسئلة.
        </p>
      </section>
    );
  }

  return (
    <section className="lesson-session-panel">
      <div className="lesson-session-panel__header">
        <div>
          <p>الدرس</p>
          <h2>{lesson.title || lesson.lesson_id}</h2>
        </div>
        <Badge tone="blue">{lesson.level || 'المستوى'}</Badge>
      </div>

      <div className="lesson-session-fields">
        <Field label="رقم الدرس" value={lesson.lesson_id} />
        <Field label="المسار" value={lesson.course_id} />
        <Field label="المهارة الرئيسية" value={lesson.main_skill_id} />
        <Field label="مستوى الصعوبة" value={lesson.difficulty} />
        <Field label="الدقائق المتوقعة" value={lesson.estimated_minutes} />
      </div>

      <div className="lesson-session-content">
        <h3>محتوى الدرس</h3>
        {renderContentValue(lesson.content)}
      </div>
    </section>
  );
}

function QuestionCard({
  question,
  index,
  answerState,
  onSelectChoice,
  onUseHint,
  onRetry,
  onSkip,
  onCorrectnessChange,
  onConfidenceChange,
}) {
  const questionId = getQuestionId(question);
  const choices = Array.isArray(question.choices) ? question.choices : [];
  const correctness = inferCorrectness(question, answerState);
  const hint = getQuestionHint(question);
  const shouldAskForManualCorrectness =
    correctness.source === 'manual_required' || correctness.source === 'manual_review';

  return (
    <section className="lesson-session-question">
      <div className="lesson-session-question__top">
        <div>
          <p>السؤال {index + 1}</p>
          <h3>{question.prompt}</h3>
        </div>
        <div className="lesson-session-question__badges">
          <Badge tone="blue">{question.question_type || 'سؤال'}</Badge>
          <Badge tone="purple">الصعوبة {question.difficulty || 1}</Badge>
        </div>
      </div>

      <div className="lesson-session-choice-list">
        {choices.length > 0 ? (
          choices.map((choice) => {
            const choiceText = getChoiceText(choice);
            const isSelected = answerState.selectedAnswer === choiceText && !answerState.skip;

            return (
              <button
                key={`${questionId}-${choiceText}`}
                type="button"
                className={isSelected ? 'is-selected' : ''}
                onClick={() => onSelectChoice(questionId, choiceText)}
              >
                {choiceText}
              </button>
            );
          })
        ) : (
          <label className="lesson-session-free-answer">
            <span>الإجابة</span>
            <textarea
              value={answerState.selectedAnswer}
              onChange={(event) => onSelectChoice(questionId, event.target.value)}
              placeholder="اكتب إجابة الطالب هنا"
              rows={4}
            />
          </label>
        )}
      </div>

      <div className="lesson-session-question-actions">
        <button type="button" onClick={() => onUseHint(questionId)}>
          {answerState.hintUsed ? 'تم استخدام التلميح' : 'استخدام تلميح'}
        </button>
        <button type="button" onClick={() => onRetry(questionId)}>
          إضافة محاولة
        </button>
        <button type="button" onClick={() => onSkip(questionId)}>
          {answerState.skip ? 'تم التجاوز' : 'تجاوز السؤال'}
        </button>
      </div>

      {answerState.hintUsed && (
        <div className="lesson-session-hint">
          <strong>تلميح</strong>
          <p>{hint || 'لا يوجد تلميح محفوظ لهذا السؤال.'}</p>
        </div>
      )}

      <div className="lesson-session-review-grid">
        <label>
          <span>مراجعة الإجابة</span>
          <select
            value={answerState.correctness}
            onChange={(event) => onCorrectnessChange(questionId, event.target.value)}
            disabled={answerState.skip}
          >
            {MANUAL_CORRECTNESS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>مستوى الثقة</span>
          <input
            type="range"
            min="1"
            max="5"
            value={answerState.confidence}
            onChange={(event) => onConfidenceChange(questionId, Number(event.target.value))}
          />
          <strong>{answerState.confidence}/5</strong>
        </label>

        <Field label="عدد المحاولات" value={answerState.attempts} />
        <Field label="زمن الإجابة" value={`${formatValue(answerState.responseTime || secondsSince(answerState.startedAt))}ث`} />
      </div>

      <div className="lesson-session-correctness-note">
        <Badge tone={correctness.value === null && shouldAskForManualCorrectness ? 'amber' : correctness.value ? 'green' : 'red'}>
          {correctness.label}
        </Badge>
        {shouldAskForManualCorrectness && !answerState.skip && (
          <p>
            راجع الإجابة قبل الإرسال لأن الواجهة الخلفية تحتاج قيمة `is_correct` ولا يوجد مفتاح إجابة مؤكد.
          </p>
        )}
      </div>
    </section>
  );
}

function AdaptiveResultSummary({ result }) {
  if (!result) {
    return (
      <section className="lesson-session-panel">
        <h2>نتيجة AIM التكيفية</h2>
        <p className="lesson-session-muted">
          أرسل محاولات الجلسة لعرض نتيجة AIM من الواجهة الخلفية.
        </p>
      </section>
    );
  }

  const primaryResult = Array.isArray(result.adaptive_results) && result.adaptive_results.length > 0
    ? result.adaptive_results[0]
    : result;

  const mastery = primaryResult.mastery_result || {};
  const weakness = primaryResult.weakness_result || {};
  const recommendation = primaryResult.recommendation || {};
  const difficulty = primaryResult.difficulty_decision || {};
  const emotional = primaryResult.safe_emotional_signal || {};
  const retention = primaryResult.retention_result || {};
  const reliability = primaryResult.reliability || {};
  const confidenceScore =
    recommendation.confidence ??
    mastery.decision_confidence ??
    reliability.score ??
    emotional.confidence_level ??
    0;

  return (
    <section className="lesson-session-panel lesson-session-result">
      <div className="lesson-session-panel__header">
        <div>
          <p>نتيجة AIM التكيفية</p>
          <h2>{recommendation.action || recommendation.action_type || 'التوصية جاهزة'}</h2>
        </div>
        <Badge tone="green">{result.attempts_saved || 0} محاولة محفوظة</Badge>
      </div>

      <div className="lesson-session-result-grid">
        <div>
          <Meter label="نسبة الإتقان" value={mastery.mastery || mastery.final_mastery || 0} />
          <Field label="الإتقان السابق" value={mastery.previous_mastery} />
          <Field label="مستوى الثقة" value={confidenceScore} />
        </div>

        <div>
          <Meter label="مهارة تحتاج تدريب" value={weakness.weakness_score || 0} />
          <Field label="مهارات تحتاج إلى تدريب" value={(weakness.main_weaknesses || []).join(', ')} />
          <Field label="درجة الأولوية" value={weakness.severity} />
        </div>

        <div>
          <Field label="التوصية التالية" value={recommendation.reason} />
          <Field label="الدرس المقترح التالي" value={recommendation.target_skill_id || recommendation.skill_id} />
          <Field label="الأولوية" value={recommendation.decision_priority} />
        </div>

        <div>
          <Field label="مستوى الصعوبة الحالي" value={difficulty.current_difficulty || difficulty.difficulty} />
          <Field label="مستوى الصعوبة المقترح" value={difficulty.target_difficulty} />
          <Field label="حان وقت المراجعة" value={retention.due_at} />
        </div>

        <div>
          <Meter label="يحتاج إلى تبسيط أو إبطاء" value={emotional.frustration_score || 0} />
          <Field label="إشارة تعليمية" value={emotional.emotional_signal} />
          <Field label="مستوى الثقة" value={emotional.confidence_level} />
        </div>

        <div>
          <Field label="رقم سجل التفسير" value={primaryResult.explanation_log_id} />
          <Field label="رقم الجلسة" value={result.session_id} />
          <Field label="عدد نتائج التكيف" value={(result.adaptive_results || []).length || 1} />
        </div>
      </div>

      <details className="lesson-session-debug">
        <summary>عرض البيانات الخام للمطور</summary>
        <pre dir="ltr">{JSON.stringify(result, null, 2)}</pre>
      </details>
    </section>
  );
}

function LessonSession() {
  const [studentId, setStudentId] = useState('1');
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [lessonPayload, setLessonPayload] = useState(null);
  const [sessionPayload, setSessionPayload] = useState(null);
  const [answers, setAnswers] = useState({});
  const [adaptiveResult, setAdaptiveResult] = useState(null);
  const [status, setStatus] = useState('جاهز');
  const [error, setError] = useState('');
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeLesson = sessionPayload?.lesson || lessonPayload?.lesson || null;
  const activeQuestions = useMemo(() => {
    if (Array.isArray(sessionPayload?.questions)) {
      return sessionPayload.questions;
    }

    if (Array.isArray(lessonPayload?.questions)) {
      return lessonPayload.questions;
    }

    return [];
  }, [lessonPayload, sessionPayload]);

  const sessionId = sessionPayload?.session_id || '';
  const studentIdNumber = safeStudentId(studentId);

  const answeredCount = activeQuestions.filter((question) => {
    const questionId = getQuestionId(question);
    const answerState = answers[questionId] || createEmptyAnswerState();

    return Boolean(answerState.skip || answerState.selectedAnswer);
  }).length;

  const payloadPreview = useMemo(() => {
    if (!sessionId || !studentIdNumber || activeQuestions.length === 0) {
      return [];
    }

    return activeQuestions
      .map((question, index) => {
        const questionId = getQuestionId(question);
        const answerState = answers[questionId] || createEmptyAnswerState();
        const correctness = inferCorrectness(question, answerState);

        if (correctness.value === null) {
          return null;
        }

        return buildAttemptPayload({
          question,
          answerState,
          correctness,
          studentId: studentIdNumber,
          sessionId,
          lesson: activeLesson,
          index,
        });
      })
      .filter(Boolean);
  }, [activeLesson, activeQuestions, answers, sessionId, studentIdNumber]);

  function resetSessionState() {
    setSessionPayload(null);
    setAnswers({});
    setAdaptiveResult(null);
  }

  async function handleLoadLessons() {
    const numericStudentId = safeStudentId(studentId);
    if (!numericStudentId) {
      setError('رقم الطالب يجب أن يكون رقما صحيحا أكبر من صفر.');
      return;
    }

    setIsLoadingLessons(true);
    setError('');
    setStatus('جاري تحميل الدروس النشطة');

    try {
      const data = await listPilotLessons(numericStudentId);
      const loadedLessons = Array.isArray(data.lessons) ? data.lessons : [];
      setLessons(loadedLessons);
      setSelectedLessonId((current) => current || loadedLessons[0]?.lesson_id || '');
      setLessonPayload(null);
      resetSessionState();
      setStatus(loadedLessons.length > 0 ? 'تم تحميل الدروس' : 'لا توجد دروس نشطة حاليا');
    } catch (requestError) {
      setError(`تعذر تحميل الدروس: ${requestError.message}`);
      setStatus('تعذر تحميل الدروس');
    } finally {
      setIsLoadingLessons(false);
    }
  }

  async function handlePreviewLesson() {
    const numericStudentId = safeStudentId(studentId);
    if (!numericStudentId) {
      setError('رقم الطالب يجب أن يكون رقما صحيحا أكبر من صفر.');
      return;
    }

    if (!selectedLessonId) {
      setError('اختر درسا أولا.');
      return;
    }

    setError('');
    setStatus('جاري تحميل معاينة الدرس');

    try {
      const data = await getPilotLesson(numericStudentId, selectedLessonId);
      setLessonPayload(data);
      resetSessionState();
      setStatus('Lesson preview loaded');
    } catch (requestError) {
      setError(`تعذر تحميل معاينة الدرس: ${requestError.message}`);
      setStatus('تعذر تحميل المعاينة');
    }
  }

  async function handleStartSession() {
    const numericStudentId = safeStudentId(studentId);
    if (!numericStudentId) {
      setError('رقم الطالب يجب أن يكون رقما صحيحا أكبر من صفر.');
      return;
    }

    if (!selectedLessonId) {
      setError('اختر درسا قبل بدء الجلسة.');
      return;
    }

    setIsStartingSession(true);
    setError('');
    setStatus('جاري بدء جلسة الدرس');

    try {
      const data = await startPilotLessonSession(numericStudentId, selectedLessonId);
      const nextAnswers = {};

      for (const question of data.questions || []) {
        nextAnswers[getQuestionId(question)] = createEmptyAnswerState();
      }

      setSessionPayload(data);
      setLessonPayload({
        student_id: numericStudentId,
        lesson: data.lesson,
        questions: data.questions || [],
      });
      setAnswers(nextAnswers);
      setAdaptiveResult(null);
      setStatus('بدأت الجلسة');
    } catch (requestError) {
      setError(`تعذر بدء الجلسة: ${requestError.message}`);
      setStatus('تعذر بدء الجلسة');
    } finally {
      setIsStartingSession(false);
    }
  }

  function updateAnswer(questionId, updater) {
    setAnswers((current) => {
      const previous = current[questionId] || createEmptyAnswerState();
      const next = typeof updater === 'function' ? updater(previous) : updater;

      return {
        ...current,
        [questionId]: {
          ...previous,
          ...next,
        },
      };
    });
  }

  function handleSelectChoice(questionId, selectedAnswer) {
    updateAnswer(questionId, (previous) => {
      const hadPreviousAnswer = Boolean(previous.selectedAnswer);
      const changedAnswer = hadPreviousAnswer && previous.selectedAnswer !== selectedAnswer;

      return {
        selectedAnswer,
        skip: false,
        answerChanged: previous.answerChanged || changedAnswer,
        attempts: changedAnswer ? previous.attempts + 1 : previous.attempts,
        responseTime: secondsSince(previous.startedAt),
      };
    });
  }

  function handleUseHint(questionId) {
    updateAnswer(questionId, (previous) => ({
      hintUsed: true,
      responseTime: secondsSince(previous.startedAt),
    }));
  }

  function handleRetry(questionId) {
    updateAnswer(questionId, (previous) => ({
      attempts: previous.attempts + 1,
      responseTime: secondsSince(previous.startedAt),
    }));
  }

  function handleSkip(questionId) {
    updateAnswer(questionId, (previous) => ({
      selectedAnswer: '',
      skip: true,
      correctness: 'wrong',
      responseTime: secondsSince(previous.startedAt),
    }));
  }

  function handleCorrectnessChange(questionId, correctness) {
    updateAnswer(questionId, {
      correctness,
    });
  }

  function handleConfidenceChange(questionId, confidence) {
    updateAnswer(questionId, {
      confidence,
    });
  }

  async function handleSubmitAttempts() {
    const numericStudentId = safeStudentId(studentId);
    if (!numericStudentId) {
      setError('رقم الطالب يجب أن يكون رقما صحيحا أكبر من صفر.');
      return;
    }

    if (!sessionPayload || !sessionId) {
      setError('ابدأ جلسة الدرس قبل إرسال المحاولات.');
      return;
    }

    if (activeQuestions.length === 0) {
      setError('لا توجد أسئلة نشطة في هذه الجلسة لإرسالها.');
      return;
    }

    const validationErrors = [];
    const attempts = activeQuestions.map((question, index) => {
      const questionId = getQuestionId(question);
      const answerState = answers[questionId] || createEmptyAnswerState();
      const correctness = inferCorrectness(question, answerState);

      if (!answerState.skip && !answerState.selectedAnswer) {
        validationErrors.push(`السؤال ${index + 1} يحتاج إجابة أو قرار تجاوز.`);
      }

      if (correctness.value === null) {
        validationErrors.push(`السؤال ${index + 1} يحتاج مراجعة الإجابة قبل الإرسال.`);
      }

      return correctness.value === null
        ? null
        : buildAttemptPayload({
            question,
            answerState,
            correctness,
            studentId: numericStudentId,
            sessionId,
            lesson: activeLesson,
            index,
          });
    });

    if (validationErrors.length > 0) {
      setError(validationErrors.join(' '));
      setStatus('توجد ملاحظات قبل الإرسال');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setStatus('جاري إرسال المحاولات إلى AIM');

    try {
      const result = await submitPilotSessionAttempts(
        numericStudentId,
        sessionId,
        attempts.filter(Boolean),
      );

      setAdaptiveResult(result);
      setStatus('تم استلام نتيجة AIM التكيفية');
    } catch (requestError) {
      setError(`تعذر إرسال المحاولات: ${requestError.message}`);
      setStatus('تعذر إرسال المحاولات');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="lesson-session">
      <style>{styles}</style>

      <header className="lesson-session-header">
        <div>
          <p>اختبار AIM التعليمي</p>
          <h1>جلسة اختبار الدرس</h1>
          <span>حمّل الدرس، اجمع محاولات الطالب، ثم أرسلها إلى محرك AIM دون تغيير الحسابات الخلفية.</span>
        </div>
        <div className="lesson-session-header__badges">
          <Badge tone="blue">{API_BASE_URL}</Badge>
          <Badge tone={error ? 'red' : adaptiveResult ? 'green' : 'amber'}>
            {status}
          </Badge>
        </div>
      </header>

      <section className="lesson-session-toolbar">
        <label>
          <span>رقم الطالب</span>
          <input
            type="number"
            min="1"
            value={studentId}
            onChange={(event) => {
              setStudentId(event.target.value);
              resetSessionState();
            }}
          />
        </label>

        <label>
          <span>الدرس</span>
          <select
            value={selectedLessonId}
            onChange={(event) => {
              setSelectedLessonId(event.target.value);
              setLessonPayload(null);
              resetSessionState();
            }}
          >
            <option value="">اختر درسا</option>
            {lessons.map((lesson) => (
              <option key={lesson.lesson_id} value={lesson.lesson_id}>
                {lesson.title || lesson.lesson_id}
              </option>
            ))}
          </select>
        </label>

        <button type="button" onClick={handleLoadLessons} disabled={isLoadingLessons}>
          {isLoadingLessons ? 'جاري التحميل...' : 'تحميل الدروس'}
        </button>

        <button type="button" onClick={handlePreviewLesson} disabled={!selectedLessonId}>
          معاينة الدرس
        </button>

        <button type="button" onClick={handleStartSession} disabled={!selectedLessonId || isStartingSession}>
          {isStartingSession ? 'جاري البدء...' : 'بدء الجلسة'}
        </button>
      </section>

      {error && (
        <section className="lesson-session-error" role="alert">
          {error}
        </section>
      )}

      <section className="lesson-session-progress">
        <div>
          <span>رقم الجلسة</span>
          <strong>{sessionId || 'لا توجد جلسة نشطة'}</strong>
        </div>
        <div>
          <span>عدد الأسئلة</span>
          <strong>{activeQuestions.length}</strong>
        </div>
        <div>
          <span>تمت الإجابة / التجاوز</span>
          <strong>
            {answeredCount} / {activeQuestions.length}
          </strong>
        </div>
        <div>
          <span>محاولات جاهزة للإرسال</span>
          <strong>{payloadPreview.length}</strong>
        </div>
      </section>

      <div className="lesson-session-layout">
        <div className="lesson-session-main">
          <LessonOverview lesson={activeLesson} />

          <section className="lesson-session-panel">
            <div className="lesson-session-panel__header">
              <div>
                <p>جمع المحاولات</p>
                <h2>أسئلة الدرس</h2>
              </div>
              <Badge tone={sessionId ? 'green' : 'amber'}>
                {sessionId ? 'الجلسة نشطة' : 'ابدأ الجلسة أولا'}
              </Badge>
            </div>

            {activeQuestions.length === 0 ? (
              <p className="lesson-session-muted">
                لا توجد أسئلة محملة. اعرض معاينة الدرس أو ابدأ جلسة درس.
              </p>
            ) : (
              <div className="lesson-session-question-list">
                {activeQuestions.map((question, index) => {
                  const questionId = getQuestionId(question);

                  return (
                    <QuestionCard
                      key={questionId}
                      question={question}
                      index={index}
                      answerState={answers[questionId] || createEmptyAnswerState()}
                      onSelectChoice={handleSelectChoice}
                      onUseHint={handleUseHint}
                      onRetry={handleRetry}
                      onSkip={handleSkip}
                      onCorrectnessChange={handleCorrectnessChange}
                      onConfidenceChange={handleConfidenceChange}
                    />
                  );
                })}
              </div>
            )}

            <div className="lesson-session-submit-row">
              <button
                type="button"
                className="lesson-session-primary"
                onClick={handleSubmitAttempts}
                disabled={!sessionId || isSubmitting || activeQuestions.length === 0}
              >
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال المحاولات'}
              </button>
            </div>
          </section>
        </div>

        <aside className="lesson-session-side">
          <AdaptiveResultSummary result={adaptiveResult} />

          <section className="lesson-session-panel">
            <div className="lesson-session-panel__header">
              <div>
                <p>معاينة بيانات الإرسال</p>
                <h2>شكل المحاولات للواجهة الخلفية</h2>
              </div>
              <Badge tone="blue">{payloadPreview.length}</Badge>
            </div>

            <details className="lesson-session-debug" open>
              <summary>عرض البيانات الخام للمطور</summary>
              <pre dir="ltr">{JSON.stringify({ attempts: payloadPreview }, null, 2)}</pre>
            </details>
          </section>
        </aside>
      </div>
    </main>
  );
}

const styles = `
.lesson-session {
  background: #eef3f7;
  color: #172328;
  direction: rtl;
  min-height: 100vh;
  padding: 28px;
  text-align: right;
}

.lesson-session-header,
.lesson-session-toolbar,
.lesson-session-progress,
.lesson-session-layout {
  margin: 0 auto;
  max-width: 1320px;
}

.lesson-session-header {
  align-items: flex-start;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 22px;
}

.lesson-session-header p,
.lesson-session-panel__header p,
.lesson-session-question__top p {
  color: #116a63;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0;
  margin: 0 0 8px;
}

.lesson-session-header h1 {
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1;
  margin: 0 0 10px;
}

.lesson-session-header span {
  color: #64748b;
  display: block;
  font-weight: 700;
}

.lesson-session-header__badges {
  align-items: flex-end;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
  max-width: 560px;
}

.lesson-session-toolbar,
.lesson-session-progress,
.lesson-session-panel,
.lesson-session-error {
  background: #ffffff;
  border: 1px solid #dbe4ef;
  border-radius: 12px;
  box-shadow: 0 18px 48px rgba(31, 57, 87, 0.08);
}

.lesson-session-toolbar {
  align-items: end;
  display: grid;
  gap: 14px;
  grid-template-columns: 130px minmax(220px, 1fr) repeat(3, auto);
  margin-bottom: 16px;
  padding: 16px;
}

.lesson-session-toolbar label,
.lesson-session-review-grid label,
.lesson-session-free-answer {
  display: grid;
  gap: 8px;
}

.lesson-session-toolbar span,
.lesson-session-review-grid span,
.lesson-session-free-answer span,
.lesson-session-progress span,
.lesson-session-field span,
.lesson-session-content-item > span {
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 900;
}

.lesson-session-toolbar input,
.lesson-session-toolbar select,
.lesson-session-review-grid select,
.lesson-session-free-answer textarea {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  color: #172328;
  min-height: 44px;
  padding: 0 12px;
  width: 100%;
}

.lesson-session-free-answer textarea {
  line-height: 1.5;
  min-height: 110px;
  padding: 12px;
  resize: vertical;
}

.lesson-session-toolbar button,
.lesson-session-question-actions button,
.lesson-session-primary {
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 900;
  min-height: 44px;
  padding: 0 14px;
}

.lesson-session-toolbar button,
.lesson-session-question-actions button {
  background: #e8f3f1;
  color: #116a63;
}

.lesson-session-toolbar button:disabled,
.lesson-session-primary:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.lesson-session-error {
  color: #b91c1c;
  font-weight: 800;
  margin: 0 auto 16px;
  max-width: 1320px;
  padding: 14px 16px;
}

.lesson-session-progress {
  display: grid;
  gap: 1px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 16px;
  overflow: hidden;
}

.lesson-session-progress > div {
  display: grid;
  gap: 8px;
  padding: 16px;
}

.lesson-session-progress strong {
  font-size: 1.1rem;
  overflow-wrap: anywhere;
}

.lesson-session-layout {
  align-items: start;
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1.45fr) minmax(360px, 0.85fr);
}

.lesson-session-main,
.lesson-session-side,
.lesson-session-question-list {
  display: grid;
  gap: 18px;
}

.lesson-session-panel {
  padding: 20px;
}

.lesson-session-panel__header,
.lesson-session-question__top {
  align-items: flex-start;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 18px;
}

.lesson-session-panel__header h2,
.lesson-session-question__top h3,
.lesson-session-content h3 {
  line-height: 1.25;
  margin: 0;
}

.lesson-session-fields,
.lesson-session-result-grid,
.lesson-session-review-grid {
  display: grid;
  gap: 12px;
}

.lesson-session-fields {
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin-bottom: 18px;
}

.lesson-session-field {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: grid;
  gap: 6px;
  padding: 12px;
}

.lesson-session-field strong {
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.lesson-session-content {
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}

.lesson-session-content-grid,
.lesson-session-content-list {
  display: grid;
  gap: 12px;
}

.lesson-session-content-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: grid;
  gap: 8px;
  padding: 12px;
}

.lesson-session-content-item p {
  margin: 0;
}

.lesson-session-question {
  border: 1px solid #dbe4ef;
  border-radius: 12px;
  padding: 18px;
}

.lesson-session-question__badges,
.lesson-session-correctness-note {
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.lesson-session-choice-list {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.lesson-session-choice-list button {
  background: #f8fafc;
  border: 1px solid #dbe4ef;
  border-radius: 10px;
  color: #172328;
  cursor: pointer;
  font-weight: 800;
  min-height: 52px;
  padding: 12px;
  text-align: right;
}

.lesson-session-choice-list button.is-selected {
  background: #eaf2ff;
  border-color: #2563eb;
  color: #164da8;
}

.lesson-session-question-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.lesson-session-hint {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 10px;
  color: #9a3412;
  display: grid;
  gap: 6px;
  margin-top: 14px;
  padding: 12px;
}

.lesson-session-hint p {
  margin: 0;
}

.lesson-session-review-grid {
  grid-template-columns: minmax(160px, 1fr) minmax(180px, 1fr) repeat(2, minmax(120px, 0.7fr));
  margin-top: 14px;
}

.lesson-session-review-grid input[type='range'] {
  width: 100%;
}

.lesson-session-correctness-note {
  justify-content: flex-start;
  margin-top: 14px;
}

.lesson-session-correctness-note p {
  color: #64748b;
  font-weight: 700;
  margin: 0;
}

.lesson-session-submit-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.lesson-session-primary {
  background: #172328;
  color: #ffffff;
  min-width: 180px;
}

.lesson-session-badge {
  border: 1px solid;
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.8rem;
  font-weight: 900;
  line-height: 1.1;
  padding: 8px 10px;
}

.lesson-session-badge--blue {
  background: #eef4ff;
  border-color: #bfdbfe;
  color: #164da8;
}

.lesson-session-badge--green {
  background: #ecfdf5;
  border-color: #86efac;
  color: #166534;
}

.lesson-session-badge--amber {
  background: #fff7ed;
  border-color: #fed7aa;
  color: #9a3412;
}

.lesson-session-badge--red {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}

.lesson-session-badge--purple {
  background: #f5f3ff;
  border-color: #ddd6fe;
  color: #5b21b6;
}

.lesson-session-muted {
  color: #64748b;
  font-weight: 700;
}

.lesson-session-result-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.lesson-session-result-grid > div {
  display: grid;
  gap: 10px;
}

.lesson-session-meter {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: grid;
  gap: 8px;
  padding: 12px;
}

.lesson-session-meter > div:first-child {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.lesson-session-meter span {
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
}

.lesson-session-meter__track {
  background: #e6edf5;
  border-radius: 999px;
  height: 12px;
  overflow: hidden;
}

.lesson-session-meter__track span {
  background: #2563eb;
  display: block;
  height: 100%;
}

.lesson-session-debug {
  margin-top: 14px;
}

.lesson-session-debug summary {
  cursor: pointer;
  font-weight: 900;
}

.lesson-session-debug pre {
  background: #101820;
  border-radius: 10px;
  color: #dbeafe;
  direction: ltr;
  font-size: 0.78rem;
  line-height: 1.45;
  max-height: 520px;
  overflow: auto;
  padding: 14px;
  text-align: left;
}

@media (max-width: 1180px) {
  .lesson-session-toolbar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .lesson-session-layout {
    grid-template-columns: 1fr;
  }

  .lesson-session-side {
    grid-row: auto;
  }
}

@media (max-width: 860px) {
  .lesson-session {
    padding: 16px;
  }

  .lesson-session-header,
  .lesson-session-panel__header,
  .lesson-session-question__top {
    align-items: flex-start;
    flex-direction: column;
  }

  .lesson-session-header__badges,
  .lesson-session-question__badges {
    justify-content: flex-start;
  }

  .lesson-session-progress,
  .lesson-session-fields,
  .lesson-session-result-grid,
  .lesson-session-review-grid,
  .lesson-session-choice-list {
    grid-template-columns: 1fr;
  }

  .lesson-session-toolbar {
    grid-template-columns: 1fr;
  }
}
`;

export default LessonSession;
