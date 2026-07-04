import { useEffect, useMemo, useState } from 'react';
import './WebPilot.css';

import {
  createStudentProfile,
  getAdaptiveResult,
  getCurrentStudentProfile,
  getLesson,
  getRecommendation,
  listLessons,
  startLessonSession,
  submitSessionAttempts,
} from '../shared/api/client';
import {
  getActiveSession,
  isSupabaseConfigured,
  onAuthSessionChange,
  registerStudent,
  signInStudent,
  signOutStudent,
} from '../shared/api/supabaseClient';

const STORAGE_KEY = 'aim_web_pilot_profile';

const fallbackLessons = [
  {
    lesson_id: 'a1-routines-1',
    title: 'Daily routines',
    level: 'A1',
    estimated_minutes: 12,
    difficulty: 1,
    main_skill_id: 'GRAMMAR_VERB_FORMS',
    skill_focus: ['GRAMMAR_VERB_FORMS'],
  },
  {
    lesson_id: 'a1-questions-1',
    title: 'Simple questions',
    level: 'A1',
    estimated_minutes: 10,
    difficulty: 1,
    main_skill_id: 'GRAMMAR_QUESTION_FORMS',
    skill_focus: ['GRAMMAR_QUESTION_FORMS'],
  },
];

const sampleQuestions = [
  {
    question_id: 'a1-routines-1:q1',
    skill_id: 'GRAMMAR_VERB_FORMS',
    prompt: 'Choose the correct sentence.',
    difficulty: 1,
    choices: [
      { choice_text: 'I wake up at seven.' },
      { choice_text: 'I wakes up at seven.' },
    ],
  },
  {
    question_id: 'a1-routines-1:q2',
    skill_id: 'GRAMMAR_VERB_FORMS',
    prompt: 'Choose the correct negative sentence.',
    difficulty: 1,
    choices: [
      { choice_text: 'I do not work on Friday.' },
      { choice_text: 'I not work on Friday.' },
    ],
  },
];

function readProfile() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function persistProfile(profile) {
  const { token, ...storedProfile } = profile;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storedProfile));
}

function sessionProfile(session, currentProfile = {}) {
  const user = session?.user || {};
  const displayName =
    user.user_metadata?.display_name ||
    user.user_metadata?.name ||
    currentProfile.name ||
    '';
  return {
    ...currentProfile,
    authUserId: user.id || currentProfile.authUserId,
    email: user.email || currentProfile.email || '',
    name: displayName,
    token: session?.access_token || '',
  };
}

function routeFromPath(pathname) {
  const parts = pathname.split('/').filter(Boolean);

  if (parts[0] === 'login') return { name: 'login' };
  if (parts[0] === 'register') return { name: 'register' };
  if (parts[0] === 'lessons' && parts[1]) return { name: 'lesson', lessonId: parts[1] };
  if (parts[0] === 'sessions' && parts[1]) return { name: 'session', sessionId: parts[1] };
  if (parts[0] === 'result' && parts[1]) return { name: 'result', sessionId: parts[1] };
  return { name: 'dashboard' };
}

function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('popstate'));
}

function initials(name, email) {
  const source = name || email || 'AIM';
  return source
    .split(/[ @._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function timeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

function toPercent(value, fallback = 0) {
  const numeric = Number(value ?? fallback);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function confidencePercent(value, fallback = 0) {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'high') return 85;
    if (normalized === 'medium') return 60;
    if (normalized === 'low') return 30;
  }

  const numeric = Number(value ?? fallback);
  if (!Number.isFinite(numeric)) return fallback;
  const percent = numeric > 0 && numeric <= 1 ? numeric * 100 : numeric;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

function displayLessonId(value) {
  const text = String(value || '').trim();
  return text.includes(':') ? text.split(':')[0] : text;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ACTION_AR = {
  continue_current_skill: 'متابعة المهارة الحالية',
  review_skill: 'مراجعة المهارة',
  advance_to_next_skill: 'الانتقال للمهارة التالية',
  collect_more_evidence: 'جمع المزيد من الأدلة',
  reinforce_weak_skill: 'تعزيز المهارة الضعيفة',
  practice: 'التدريب',
  review: 'المراجعة',
  advance: 'التقدم',
  reinforce: 'التعزيز',
};

function formatAction(action) {
  const key = String(action || '').toLowerCase();
  if (ACTION_AR[key]) return ACTION_AR[key];
  const normalized = key.replace(/_/g, ' ');
  if (!normalized) return 'متابعة التدريب';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function resultProgress(result) {
  return toPercent(
    result?.updated_skill_state?.mastery ??
      result?.mastery_result?.final_mastery ??
      result?.mastery_result?.mastery ??
      result?.mastery_result?.score,
    0,
  );
}

function resultFocus(result) {
  const weakness = result?.weakness_result;
  const firstWeakness =
    weakness?.weaknesses?.[0]?.skill_id ||
    weakness?.weaknesses?.[0]?.concept ||
    weakness?.top_weaknesses?.[0]?.skill_id ||
    weakness?.primary_weakness ||
    result?.error_pattern?.dominant_error_tag ||
    result?.recommendation?.target_skill_id ||
    result?.recommendation?.skill_id;
  return firstWeakness ? formatAction(firstWeakness) : 'المهارة الحالية';
}

function resultReviewPrompt(result) {
  return (
    result?.prompt_adaptation_instruction?.instruction ||
    result?.prompt_adaptation_instruction?.message ||
    result?.recommendation?.reason ||
    'راجع المهارة الحالية مرة واحدة، ثم تابع مع مجموعة التمارين القصيرة التالية.'
  );
}

function StatusText({ status }) {
  if (!status) return null;
  return (
    <p className={`pilot-status pilot-status--${status.kind}`} role="alert">
      {status.text}
    </p>
  );
}

function PilotTopbar({ profile, onLogout }) {
  const isLoggedIn = Boolean(profile.studentId);

  return (
    <header className="pilot-topbar">
      <button
        className="pilot-brand"
        type="button"
        onClick={() => navigate(isLoggedIn ? '/dashboard' : '/')}
      >
        <span className="pilot-brand__mark">AIM</span>
        <span>تعلّم الإنجليزية</span>
      </button>

      <nav className="pilot-nav" aria-label="التنقل الرئيسي">
        {isLoggedIn && (
          <button type="button" onClick={() => navigate('/dashboard')}>
            دروسي
          </button>
        )}
      </nav>

      <div className="pilot-topbar__right">
        {isLoggedIn ? (
          <div className="pilot-user">
            <span className="pilot-user__avatar">{initials(profile.name, profile.email)}</span>
            <span className="pilot-user__meta">
              <strong>{profile.name || 'طالب'}</strong>
              <small>{profile.email || ''}</small>
            </span>
            <button
              className="pilot-icon-button"
              type="button"
              onClick={onLogout}
              aria-label="تسجيل الخروج"
              title="تسجيل الخروج"
            >
              &#8618;
            </button>
          </div>
        ) : (
          <div className="pilot-auth-nav">
            <button
              type="button"
              className="pilot-nav-btn"
              onClick={() => navigate('/login')}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              className="pilot-primary pilot-primary--sm"
              onClick={() => navigate('/register')}
            >
              إنشاء حساب
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function LoginView({ profile, onAuthenticated }) {
  const [form, setForm] = useState({
    email: profile.email || '',
    password: '',
  });
  const [status, setStatus] = useState(null);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function ensureLinkedStudent(session) {
    const token = session?.access_token;
    if (!token) return null;

    try {
      return await getCurrentStudentProfile(token);
    } catch (error) {
      if (!String(error.message).includes('404')) throw error;
      return createStudentProfile(
        {
          name: session.user?.user_metadata?.display_name || session.user?.email || 'Student',
          email: session.user?.email || form.email,
        },
        token,
      );
    }
  }

  async function submit(event) {
    event.preventDefault();
    setStatus({ kind: 'loading', text: 'جاري تسجيل الدخول...' });

    try {
      const authData = await signInStudent(form.email, form.password);
      if (!authData.session) {
        setStatus({
          kind: 'ready',
          text: 'تحقق من بريدك الإلكتروني لتأكيد حسابك، ثم سجّل الدخول.',
        });
        return;
      }

      const student = await ensureLinkedStudent(authData.session);
      onAuthenticated(authData.session, student);
      navigate('/dashboard');
    } catch (error) {
      setStatus({ kind: 'error', text: error.message });
    }
  }

  return (
    <main className="pilot-main pilot-main--narrow pilot-main--auth">
      <section className="pilot-panel pilot-panel--auth">
        <div className="pilot-auth-logo">
          <span className="pilot-brand__mark pilot-brand__mark--lg">AIM</span>
        </div>
        <div className="pilot-section-heading pilot-section-heading--center">
          <p>مرحبًا بعودتك</p>
          <h1>تسجيل دخول الطالب</h1>
        </div>
        <StatusText status={status} />
        <form className="pilot-form" onSubmit={submit}>
          <label htmlFor="login-email">
            البريد الإلكتروني
            <input
              id="login-email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="student@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label htmlFor="login-password">
            كلمة المرور
            <input
              id="login-password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="أدخل كلمة المرور"
              autoComplete="current-password"
              minLength="6"
              required
            />
          </label>
          <button
            className="pilot-primary pilot-primary--full"
            type="submit"
            disabled={!isSupabaseConfigured || status?.kind === 'loading'}
          >
            {status?.kind === 'loading' ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
        <p className="pilot-auth-switch">
          لا تملك حسابًا؟{' '}
          <button type="button" className="pilot-link-btn" onClick={() => navigate('/register')}>
            إنشاء حساب جديد
          </button>
        </p>
      </section>
    </main>
  );
}

function RegisterView({ onAuthenticated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState(null);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function ensureLinkedStudent(session, name) {
    const token = session?.access_token;
    if (!token) return null;

    try {
      return await getCurrentStudentProfile(token);
    } catch (error) {
      if (!String(error.message).includes('404')) throw error;
      return createStudentProfile(
        {
          name: name || session.user?.email || 'Student',
          email: session.user?.email || form.email,
        },
        token,
      );
    }
  }

  async function submit(event) {
    event.preventDefault();
    setStatus({ kind: 'loading', text: 'جاري إنشاء حسابك...' });

    try {
      const authData = await registerStudent(form.email, form.password, form.name);
      if (!authData.session) {
        setStatus({
          kind: 'ready',
          text: 'تم إنشاء الحساب! تحقق من بريدك الإلكتروني للتأكيد، ثم سجّل الدخول.',
        });
        return;
      }

      const student = await ensureLinkedStudent(authData.session, form.name);
      onAuthenticated(authData.session, student);
      navigate('/dashboard');
    } catch (error) {
      setStatus({ kind: 'error', text: error.message });
    }
  }

  return (
    <main className="pilot-main pilot-main--narrow pilot-main--auth">
      <section className="pilot-panel pilot-panel--auth">
        <div className="pilot-auth-logo">
          <span className="pilot-brand__mark pilot-brand__mark--lg">AIM</span>
        </div>
        <div className="pilot-section-heading pilot-section-heading--center">
          <p>ابدأ رحلتك في تعلم الإنجليزية</p>
          <h1>إنشاء حساب جديد</h1>
        </div>
        <StatusText status={status} />
        <form className="pilot-form" onSubmit={submit}>
          <label htmlFor="reg-name">
            الاسم الكامل
            <input
              id="reg-name"
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="أدخل اسمك الكامل"
              autoComplete="name"
              required
            />
          </label>
          <label htmlFor="reg-email">
            البريد الإلكتروني
            <input
              id="reg-email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="student@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label htmlFor="reg-password">
            كلمة المرور
            <input
              id="reg-password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="اختر كلمة مرور (6 أحرف على الأقل)"
              autoComplete="new-password"
              minLength="6"
              required
            />
          </label>
          <button
            className="pilot-primary pilot-primary--full"
            type="submit"
            disabled={!isSupabaseConfigured || status?.kind === 'loading'}
          >
            {status?.kind === 'loading' ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
          </button>
        </form>
        <p className="pilot-auth-switch">
          لديك حساب بالفعل؟{' '}
          <button type="button" className="pilot-link-btn" onClick={() => navigate('/login')}>
            تسجيل الدخول
          </button>
        </p>
      </section>
    </main>
  );
}

function DashboardView({ profile }) {
  const [lessons, setLessons] = useState(fallbackLessons);
  const [recommendation, setRecommendation] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!profile.studentId) return;
    let cancelled = false;

    async function loadDashboard() {
      setStatus({ kind: 'loading', text: 'جاري تحميل البيانات...' });
      try {
        const [lessonData, recommendationData] = await Promise.all([
          listLessons(profile.studentId, profile.token),
          getRecommendation(profile.studentId, profile.token).catch(() => null),
        ]);
        if (cancelled) return;
        setLessons(lessonData.lessons?.length ? lessonData.lessons : fallbackLessons);
        setRecommendation(recommendationData);
        setStatus(null);
      } catch (error) {
        if (cancelled) return;
        setStatus({ kind: 'error', text: 'تعذر الوصول إلى الخادم. عرض الدروس المحلية.' });
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [profile.studentId, profile.token]);

  const recommendationConfidence = confidencePercent(recommendation?.confidence, 0);

  return (
    <main className="pilot-main">
      <section className="pilot-band pilot-band--summary">
        <div className="pilot-section-heading">
          <p>منصة AIM التجريبية · A1</p>
          <h1>لوحة الطالب</h1>
        </div>
        <div className="pilot-metrics" aria-label="ملخص الأداء">
          <div>
            <strong>{lessons.length}</strong>
            <span>الدروس المتاحة</span>
          </div>
          <div>
            <strong>
              {recommendation?.action_type ? formatAction(recommendation.action_type) : 'جاهز'}
            </strong>
            <span>الخطوة التالية</span>
          </div>
          <div>
            <strong>{recommendationConfidence}%</strong>
            <span>مستوى الثقة</span>
          </div>
        </div>
      </section>

      <StatusText status={status} />

      <section className="pilot-layout">
        <div className="pilot-panel">
          <div className="pilot-section-heading pilot-section-heading--row">
            <div>
              <p>قائمة الدروس</p>
              <h2>الدروس المقترحة اليوم</h2>
            </div>
          </div>
          <div className="pilot-lesson-list">
            {lessons.map((lesson, index) => (
              <article className="pilot-lesson-card" key={lesson.lesson_id}>
                <div className="pilot-lesson-card__index">{String(index + 1).padStart(2, '0')}</div>
                <div>
                  <h3>{lesson.title}</h3>
                  <p>
                    {lesson.level} · {lesson.estimated_minutes || 10} دقيقة · الصعوبة{' '}
                    {lesson.difficulty}
                  </p>
                  <div className="pilot-tags">
                    {(lesson.skill_focus || [lesson.main_skill_id]).filter(Boolean).map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
                <button
                  className="pilot-primary"
                  type="button"
                  onClick={() => navigate(`/lessons/${lesson.lesson_id}`)}
                >
                  فتح الدرس
                </button>
              </article>
            ))}
          </div>
        </div>

        <aside className="pilot-panel pilot-panel--side">
          <div className="pilot-section-heading">
            <p>توصية AIM</p>
            <h2>{recommendation?.action_type ? formatAction(recommendation.action_type) : 'في انتظار البيانات'}</h2>
          </div>
          <p className="pilot-note">
            {recommendation?.reason || 'قم بجلسة درس لجمع الإشارات التكيفية التالية.'}
          </p>
          <div className="pilot-signal">
            <span style={{ width: `${confidencePercent(recommendation?.confidence, 42)}%` }} />
          </div>
        </aside>
      </section>
    </main>
  );
}

function LessonView({ lessonId, profile }) {
  const [lessonData, setLessonData] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!profile.studentId) return;
    let cancelled = false;

    async function loadLesson() {
      setStatus({ kind: 'loading', text: 'جاري تحميل الدرس...' });
      try {
        const data = await getLesson(profile.studentId, lessonId, profile.token);
        if (cancelled) return;
        setLessonData(data);
        setStatus({ kind: 'ready', text: 'الدرس جاهز.' });
      } catch (error) {
        if (cancelled) return;
        setLessonData({
          lesson: fallbackLessons.find((lesson) => lesson.lesson_id === lessonId) || fallbackLessons[0],
          questions: sampleQuestions,
        });
        setStatus({ kind: 'error', text: 'تعذر الوصول إلى الخادم. عرض معاينة.' });
      }
    }

    loadLesson();
    return () => {
      cancelled = true;
    };
  }, [lessonId, profile.studentId, profile.token]);

  async function startSession() {
    if (!profile.studentId) {
      navigate('/login');
      return;
    }
    setStatus({ kind: 'loading', text: 'جاري بدء الجلسة...' });
    try {
      const data = await startLessonSession(profile.studentId, lessonId, profile.token);
      sessionStorage.setItem(`aim_session:${data.session_id}`, JSON.stringify(data));
      navigate(`/sessions/${encodeURIComponent(data.session_id)}`);
    } catch (error) {
      const localSession = {
        lesson_id: lessonId,
        session_id: `${lessonId}:local-preview`,
        questions: lessonData?.questions || sampleQuestions,
      };
      sessionStorage.setItem(`aim_session:${localSession.session_id}`, JSON.stringify(localSession));
      setStatus({ kind: 'error', text: 'تعذر الوصول إلى الخادم. تم فتح معاينة محلية.' });
      navigate(`/sessions/${encodeURIComponent(localSession.session_id)}`);
    }
  }

  const lesson =
    lessonData?.lesson ||
    fallbackLessons.find((item) => item.lesson_id === lessonId) ||
    fallbackLessons[0];
  const questions = lessonData?.questions || sampleQuestions;

  return (
    <main className="pilot-main">
      <section className="pilot-panel">
        <div className="pilot-section-heading pilot-section-heading--row">
          <div>
            <p>
              {lesson.level || 'A1'} · {lesson.main_skill_id}
            </p>
            <h1>{lesson.title}</h1>
          </div>
          <button className="pilot-primary" type="button" onClick={startSession}>
            بدء الدرس
          </button>
        </div>
        <StatusText status={status} />
        <div className="pilot-question-preview">
          {questions.map((question, index) => (
            <article key={question.question_id}>
              <span>{index + 1}</span>
              <p>{question.prompt}</p>
              <small>
                {question.choices?.length || 0} خيار · الصعوبة {question.difficulty}
              </small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

const CHOICE_LABELS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];

function SessionView({ sessionId, profile }) {
  const [sessionStartedAt] = useState(() => Date.now());
  const storedSession = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem(`aim_session:${sessionId}`));
    } catch {
      return null;
    }
  }, [sessionId]);
  const questions = storedSession?.questions?.length ? storedSession.questions : sampleQuestions;
  const [responses, setResponses] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState(null);
  const isSubmitting = status?.kind === 'loading';

  const question = questions[currentIndex];
  const questionId = question?.question_id;
  const choices = question?.choices || [];
  const currentResponse = responses[questionId] || {};
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const answeredCount = questions.filter(
    (q) => responses[q.question_id]?.selectedAnswer || responses[q.question_id]?.skipped,
  ).length;

  function selectAnswer(qId, choiceText) {
    setResponses((current) => {
      const previous = current[qId] || {};
      const answerChanged = Boolean(previous.selectedAnswer && previous.selectedAnswer !== choiceText);
      return {
        ...current,
        [qId]: {
          ...previous,
          selectedAnswer: choiceText,
          answerChanged: previous.answerChanged || answerChanged,
          retries: answerChanged ? (previous.retries || 0) + 1 : previous.retries || 0,
          skipped: false,
          startedAt: previous.startedAt || Date.now(),
        },
      };
    });
  }

  function markHint(qId) {
    setResponses((current) => ({
      ...current,
      [qId]: {
        ...(current[qId] || {}),
        hintUsed: true,
        startedAt: current[qId]?.startedAt || Date.now(),
      },
    }));
  }

  function skipCurrent() {
    setResponses((current) => ({
      ...current,
      [questionId]: {
        ...(current[questionId] || {}),
        selectedAnswer: null,
        skipped: true,
        startedAt: current[questionId]?.startedAt || Date.now(),
      },
    }));
    if (!isLast) setCurrentIndex((i) => i + 1);
  }

  function goNext() {
    if (!isLast) setCurrentIndex((i) => i + 1);
  }

  function goPrev() {
    if (!isFirst) setCurrentIndex((i) => i - 1);
  }

  async function submit() {
    if (!profile.studentId) {
      navigate('/login');
      return;
    }

    const attempts = questions.map((q, index) => ({
      student_id: Number(profile.studentId),
      skill_id: q.skill_id,
      question_id: q.question_id,
      session_id: sessionId,
      selected_answer: responses[q.question_id]?.selectedAnswer || null,
      confidence: responses[q.question_id]?.confidence ?? 60,
      response_time: Math.max(
        1,
        Math.round(
          (Date.now() - (responses[q.question_id]?.startedAt || sessionStartedAt)) / 1000,
        ),
      ),
      attempts: Math.max(1, (responses[q.question_id]?.retries || 0) + 1),
      difficulty: q.difficulty || 1,
      hint_used: Boolean(responses[q.question_id]?.hintUsed),
      skip: Boolean(responses[q.question_id]?.skipped || !responses[q.question_id]?.selectedAnswer),
      answer_changed: Boolean(responses[q.question_id]?.answerChanged),
      time_of_day: timeOfDay(),
      session_position: index + 1,
    }));

    setStatus({ kind: 'loading', text: 'جاري إرسال الإجابات...' });
    try {
      const result = await submitSessionAttempts(
        profile.studentId,
        sessionId,
        attempts,
        profile.token,
      );
      sessionStorage.setItem(`aim_result:${sessionId}`, JSON.stringify(result));
      navigate(`/result/${encodeURIComponent(sessionId)}`);
    } catch (error) {
      setStatus({ kind: 'loading', text: 'Submitted. Loading the saved AIM result...' });
      for (let attempt = 0; attempt < 6; attempt += 1) {
        try {
          await sleep(attempt === 0 ? 500 : 1500);
          const recovered = await getAdaptiveResult(profile.studentId, sessionId, profile.token);
          sessionStorage.setItem(`aim_result:${sessionId}`, JSON.stringify(recovered));
          navigate(`/result/${encodeURIComponent(sessionId)}`);
          return;
        } catch {
          // The backend may still be committing the adaptive result.
        }
      }

      const localResult = {
        session_id: sessionId,
        lesson_id: displayLessonId(sessionId),
        attempts_saved: attempts.length,
        recommendation: { action: 'collect_more_evidence', reason: error.message },
        decision_conflict: { selected_action: 'collect_more_evidence' },
        reliability: { score: 0.2 },
      };
      sessionStorage.setItem(`aim_result:${sessionId}`, JSON.stringify(localResult));
      navigate(`/result/${encodeURIComponent(sessionId)}`);
    }
  }

  if (!question) {
    return (
      <main className="pilot-main">
        <section className="pilot-panel">
          <p>لا توجد أسئلة في هذه الجلسة.</p>
          <button className="pilot-primary" type="button" onClick={() => navigate('/dashboard')}>
            لوحة الطالب
          </button>
        </section>
      </main>
    );
  }

  const hint =
    question.metadata?.hint ||
    question.metadata?.explanation ||
    question.explanation ||
    '';

  return (
    <main className="pilot-main quiz-step-main">
      <div className="quiz-step-header">
        <div className="quiz-step-meta">
          <span className="quiz-step-lesson">{displayLessonId(storedSession?.lesson_id) || 'درس'}</span>
          <span className="quiz-step-count">
            السؤال {currentIndex + 1} من {questions.length}
          </span>
        </div>
        <div className="quiz-step-bar-wrap">
          <div className="quiz-step-bar" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="quiz-step-dots" role="tablist" aria-label="التنقل بين الأسئلة">
          {questions.map((q, i) => {
            const resp = responses[q.question_id];
            const answered = resp?.selectedAnswer || resp?.skipped;
            return (
              <button
                key={q.question_id}
                type="button"
                role="tab"
                aria-selected={i === currentIndex}
                className={`quiz-dot${i === currentIndex ? ' quiz-dot--active' : ''}${answered ? ' quiz-dot--done' : ''}`}
                onClick={() => setCurrentIndex(i)}
                aria-label={`السؤال ${i + 1}${answered ? ' - مجاب' : ''}`}
                disabled={isSubmitting}
              />
            );
          })}
        </div>
      </div>

      <section className="pilot-panel quiz-step-card">
        <p className="quiz-step-label">
          السؤال {currentIndex + 1}
          {answeredCount > 0 && (
            <span className="quiz-answered-badge">{answeredCount} / {questions.length} مجاب</span>
          )}
        </p>
        <h2 className="quiz-step-prompt" dir="ltr" lang="en">{question.prompt}</h2>

        {currentResponse.hintUsed && hint && (
          <div className="quiz-hint-box" role="note">
            <span className="quiz-hint-label">💡 تلميح</span>
            <p dir="ltr" lang="en">{hint}</p>
          </div>
        )}

        <div className="quiz-choices" role="group" aria-label="الخيارات المتاحة">
          {choices.map((choice, ci) => {
            const choiceText = choice.choice_text || String(choice);
            const isSelected = currentResponse.selectedAnswer === choiceText && !currentResponse.skipped;
            return (
              <button
                key={choiceText}
                type="button"
                className={`quiz-choice${isSelected ? ' quiz-choice--selected' : ''}`}
                onClick={() => selectAnswer(questionId, choiceText)}
                disabled={isSubmitting}
                dir="ltr"
                lang="en"
                aria-pressed={isSelected}
              >
                <span className="quiz-choice-label" dir="rtl" lang="ar">{CHOICE_LABELS[ci] || ci + 1}</span>
                <span className="quiz-choice-text">{choiceText}</span>
              </button>
            );
          })}
        </div>

        <div className="quiz-step-footer">
          <div className="quiz-step-tools">
            <button
              type="button"
              className={`quiz-btn-secondary${currentResponse.hintUsed ? ' quiz-btn-secondary--done' : ''}`}
              onClick={() => markHint(questionId)}
              disabled={currentResponse.hintUsed || isSubmitting}
              aria-pressed={currentResponse.hintUsed}
            >
              {currentResponse.hintUsed ? '✓ تلميح' : 'تلميح'}
            </button>
            <button
              type="button"
              className={`quiz-btn-secondary${currentResponse.skipped ? ' quiz-btn-secondary--done' : ''}`}
              onClick={skipCurrent}
              disabled={Boolean(currentResponse.skipped) || isSubmitting}
              aria-pressed={Boolean(currentResponse.skipped)}
            >
              {currentResponse.skipped ? '✓ تخطي' : 'تخطي'}
            </button>
          </div>
          <div className="quiz-step-nav">
            <button
              type="button"
              className="quiz-btn-secondary quiz-btn-prev"
              onClick={goPrev}
              disabled={isFirst || isSubmitting}
              aria-label="السؤال السابق"
            >
              السابق
            </button>
            {isLast ? (
              <button
                type="button"
                className="pilot-primary quiz-btn-submit"
                onClick={submit}
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting
                  ? <span className="quiz-submit-loading"><span className="quiz-spinner" aria-hidden="true" />جاري الإرسال...</span>
                  : `إرسال (${answeredCount}/${questions.length})`}
              </button>
            ) : (
              <button
                type="button"
                className="pilot-primary quiz-btn-next"
                onClick={goNext}
                disabled={isSubmitting}
                aria-label="السؤال التالي"
              >
                التالي
              </button>
            )}
          </div>
        </div>
      </section>

      <StatusText status={status} />
    </main>
  );
}

function ResultView({ sessionId, profile }) {
  const [result, setResult] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(`aim_result:${sessionId}`));
    } catch {
      return null;
    }
  });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!profile.studentId) return;
    let cancelled = false;

    async function loadResult() {
      try {
        const data = await getAdaptiveResult(profile.studentId, sessionId, profile.token);
        if (cancelled) return;
        setResult(data);
        setStatus({ kind: 'ready', text: 'تم تحميل النتيجة التكيفية.' });
      } catch (error) {
        if (cancelled) return;
        setStatus({ kind: 'error', text: error.message });
      }
    }

    loadResult();
    return () => {
      cancelled = true;
    };
  }, [profile.studentId, profile.token, sessionId]);

  const progress = resultProgress(result);
  const action =
    result?.recommendation?.action || result?.recommendation?.action_type || 'continue_current_skill';
  const nextStep = formatAction(action);
  const focus = resultFocus(result);
  const reviewPrompt = resultReviewPrompt(result);
  const attemptsSaved = result?.attempts_saved || 0;

  return (
    <main className="pilot-main">
      <section className="pilot-layout">
        <div className="pilot-panel">
          <div className="pilot-section-heading pilot-section-heading--row">
            <div>
              <p>اكتملت الجلسة</p>
              <h1>النتيجة</h1>
            </div>
            <button className="pilot-primary" type="button" onClick={() => navigate('/dashboard')}>
              لوحة الطالب
            </button>
          </div>
          <StatusText status={status} />
          <div className="pilot-progress-summary">
            <div className="pilot-progress-ring" style={{ '--progress': `${progress}%` }}>
              <strong>{progress}%</strong>
              <span>التقدم</span>
            </div>
            <div>
              <h2>{nextStep}</h2>
              <p>{reviewPrompt}</p>
            </div>
          </div>
          <dl className="pilot-student-result-grid">
            <div>
              <dt>منطقة التركيز</dt>
              <dd>{focus}</dd>
            </div>
            <div>
              <dt>التمارين المكتملة</dt>
              <dd>{attemptsSaved} إجابة</dd>
            </div>
            <div>
              <dt>الخطوة التالية</dt>
              <dd>{nextStep}</dd>
            </div>
          </dl>
        </div>
        <aside className="pilot-panel pilot-panel--side">
          <div className="pilot-section-heading">
            <p>المراجعة</p>
            <h2>ماذا تفعل الآن</h2>
          </div>
          <p className="pilot-note">{reviewPrompt}</p>
          <button className="pilot-primary" type="button" onClick={() => navigate('/dashboard')}>
            متابعة
          </button>
        </aside>
      </section>
    </main>
  );
}

export default function WebPilot() {
  const [route, setRoute] = useState(() => routeFromPath(window.location.pathname));
  const [profile, setProfile] = useState(readProfile);

  async function applySession(session) {
    if (!session) {
      setProfile((current) => ({ ...current, token: '' }));
      return;
    }

    const baseProfile = sessionProfile(session, readProfile());
    try {
      const student = await getCurrentStudentProfile(session.access_token);
      const nextProfile = {
        ...baseProfile,
        name: baseProfile.name || student.name,
        email: baseProfile.email || student.email,
        studentId: String(student.id),
      };
      persistProfile(nextProfile);
      setProfile(nextProfile);
    } catch {
      persistProfile(baseProfile);
      setProfile(baseProfile);
    }
  }

  useEffect(() => {
    function handleRouteChange() {
      setRoute(routeFromPath(window.location.pathname));
    }

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let cancelled = false;
    getActiveSession()
      .then((session) => {
        if (!cancelled) applySession(session);
      })
      .catch(() => {});

    const subscription = onAuthSessionChange((session) => {
      if (!cancelled) applySession(session);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveAuthenticatedProfile(session, student) {
    const nextProfile = {
      ...sessionProfile(session, profile),
      studentId: student?.id ? String(student.id) : profile.studentId,
      name: profile.name || student?.name || session.user?.user_metadata?.display_name || '',
      email: session.user?.email || student?.email || profile.email || '',
    };
    persistProfile(nextProfile);
    setProfile(nextProfile);
  }

  async function clearProfile() {
    await signOutStudent().catch(() => {});
    const normalized = { email: profile.email || '', name: profile.name || '' };
    localStorage.removeItem(STORAGE_KEY);
    setProfile(normalized);
    navigate('/login');
  }

  if (route.name !== 'login' && route.name !== 'register' && !profile.studentId) {
    return (
      <div className="pilot-app">
        <PilotTopbar profile={profile} onLogout={clearProfile} />
        <LoginView profile={profile} onAuthenticated={saveAuthenticatedProfile} />
      </div>
    );
  }

  return (
    <div className="pilot-app">
      <PilotTopbar profile={profile} onLogout={clearProfile} />
      {route.name === 'login' && (
        <LoginView profile={profile} onAuthenticated={saveAuthenticatedProfile} />
      )}
      {route.name === 'register' && <RegisterView onAuthenticated={saveAuthenticatedProfile} />}
      {route.name === 'dashboard' && <DashboardView profile={profile} />}
      {route.name === 'lesson' && <LessonView lessonId={route.lessonId} profile={profile} />}
      {route.name === 'session' && (
        <SessionView sessionId={decodeURIComponent(route.sessionId)} profile={profile} />
      )}
      {route.name === 'result' && (
        <ResultView sessionId={decodeURIComponent(route.sessionId)} profile={profile} />
      )}
    </div>
  );
}
