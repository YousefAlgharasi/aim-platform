import { useEffect, useMemo, useState } from 'react';

import {
  API_BASE_URL,
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

function StatusText({ status }) {
  if (!status) return null;
  return <p className={`pilot-status pilot-status--${status.kind}`}>{status.text}</p>;
}

function PilotTopbar({ profile, onLogout }) {
  return (
    <header className="pilot-topbar">
      <button className="pilot-brand" type="button" onClick={() => navigate('/dashboard')}>
        <span className="pilot-brand__mark">AIM</span>
        <span>Web Pilot</span>
      </button>
      <nav className="pilot-nav" aria-label="Pilot navigation">
        <button type="button" onClick={() => navigate('/dashboard')}>
          Dashboard
        </button>
        <button type="button" onClick={() => navigate('/login')}>
          Login
        </button>
      </nav>
      <div className="pilot-user">
        <span className="pilot-user__avatar">{initials(profile.name, profile.email)}</span>
        <span className="pilot-user__meta">
          <strong>{profile.name || 'Pilot student'}</strong>
          <small>{profile.studentId ? `Student ${profile.studentId}` : 'No student selected'}</small>
        </span>
        <button className="pilot-icon-button" type="button" onClick={onLogout} aria-label="Clear pilot profile">
          x
        </button>
      </div>
    </header>
  );
}

function LoginView({ profile, onAuthenticated }) {
  const [mode, setMode] = useState('sign-in');
  const [form, setForm] = useState({
    name: profile.name || '',
    email: profile.email || '',
    password: '',
  });
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
          name: name || session.user?.email || 'Pilot student',
          email: session.user?.email || form.email,
        },
        token,
      );
    }
  }

  async function submit(event) {
    event.preventDefault();
    setStatus({ kind: 'loading', text: mode === 'register' ? 'Creating account...' : 'Signing in...' });

    try {
      const authData =
        mode === 'register'
          ? await registerStudent(form.email, form.password, form.name)
          : await signInStudent(form.email, form.password);
      if (!authData.session) {
        setStatus({ kind: 'ready', text: 'Check your email to confirm the account.' });
        return;
      }

      const student = await ensureLinkedStudent(authData.session, form.name);
      onAuthenticated(authData.session, student);
      setStatus({ kind: 'ready', text: 'Signed in.' });
      navigate('/dashboard');
    } catch (error) {
      setStatus({ kind: 'error', text: error.message });
    }
  }

  return (
    <main className="pilot-main pilot-main--narrow">
      <section className="pilot-panel">
        <div className="pilot-section-heading">
          <p>Student access</p>
          <h1>Login</h1>
        </div>
        <p className="pilot-api-line">API {API_BASE_URL}</p>
        <p className="pilot-api-line">
          Supabase {isSupabaseConfigured ? 'configured' : 'needs REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_PUBLISHABLE_KEY'}
        </p>
        <div className="pilot-mode-switch" role="tablist" aria-label="Auth mode">
          <button className={mode === 'sign-in' ? 'is-selected' : ''} type="button" onClick={() => setMode('sign-in')}>
            Sign in
          </button>
          <button className={mode === 'register' ? 'is-selected' : ''} type="button" onClick={() => setMode('register')}>
            Register
          </button>
        </div>
        <StatusText status={status} />
        <form className="pilot-form" onSubmit={submit}>
          {mode === 'register' && (
            <label>
              Name
              <input name="name" value={form.name} onChange={updateField} placeholder="Pilot student" required />
            </label>
          )}
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={updateField} placeholder="student@example.com" required />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={updateField} minLength="6" required />
          </label>
          <button className="pilot-primary" type="submit" disabled={!isSupabaseConfigured || status?.kind === 'loading'}>
            {mode === 'register' ? 'Create account' : 'Sign in'}
          </button>
        </form>
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
      setStatus({ kind: 'loading', text: 'Loading pilot data...' });
      try {
        const [lessonData, recommendationData] = await Promise.all([
          listLessons(profile.studentId, profile.token),
          getRecommendation(profile.studentId, profile.token).catch(() => null),
        ]);
        if (cancelled) return;
        setLessons(lessonData.lessons?.length ? lessonData.lessons : fallbackLessons);
        setRecommendation(recommendationData);
        setStatus({ kind: 'ready', text: `Connected to ${API_BASE_URL}` });
      } catch (error) {
        if (cancelled) return;
        setStatus({ kind: 'error', text: `${error.message}. Showing local lesson shell.` });
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [profile.studentId, profile.token]);

  return (
    <main className="pilot-main">
      <section className="pilot-band pilot-band--summary">
        <div className="pilot-section-heading">
          <p>A1 English pilot</p>
          <h1>Dashboard</h1>
        </div>
        <div className="pilot-metrics" aria-label="Pilot summary">
          <div>
            <strong>{lessons.length}</strong>
            <span>Lessons</span>
          </div>
          <div>
            <strong>{recommendation?.action_type || 'ready'}</strong>
            <span>Next action</span>
          </div>
          <div>
            <strong>{API_BASE_URL.replace(/^https?:\/\//, '')}</strong>
            <span>API base</span>
          </div>
        </div>
      </section>

      <StatusText status={status} />

      <section className="pilot-layout">
        <div className="pilot-panel">
          <div className="pilot-section-heading pilot-section-heading--row">
            <div>
              <p>Lesson queue</p>
              <h2>Today</h2>
            </div>
            <button type="button" onClick={() => navigate('/login')}>
              Student profile
            </button>
          </div>
          <div className="pilot-lesson-list">
            {lessons.map((lesson, index) => (
              <article className="pilot-lesson-card" key={lesson.lesson_id}>
                <div className="pilot-lesson-card__index">{String(index + 1).padStart(2, '0')}</div>
                <div>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.level} · {lesson.estimated_minutes || 10} min · Difficulty {lesson.difficulty}</p>
                  <div className="pilot-tags">
                    {(lesson.skill_focus || [lesson.main_skill_id]).filter(Boolean).map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
                <button className="pilot-primary" type="button" onClick={() => navigate(`/lessons/${lesson.lesson_id}`)}>
                  Open
                </button>
              </article>
            ))}
          </div>
        </div>

        <aside className="pilot-panel pilot-panel--side">
          <div className="pilot-section-heading">
            <p>AIM recommendation</p>
            <h2>{recommendation?.action_type || 'Waiting for evidence'}</h2>
          </div>
          <p className="pilot-note">{recommendation?.reason || 'Run a lesson session to collect the next adaptive signal.'}</p>
          <div className="pilot-signal">
            <span style={{ width: `${Math.round((recommendation?.confidence || 0.42) * 100)}%` }} />
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
      setStatus({ kind: 'loading', text: 'Loading lesson...' });
      try {
        const data = await getLesson(profile.studentId, lessonId, profile.token);
        if (cancelled) return;
        setLessonData(data);
        setStatus({ kind: 'ready', text: 'Lesson ready.' });
      } catch (error) {
        if (cancelled) return;
        setLessonData({
          lesson: fallbackLessons.find((lesson) => lesson.lesson_id === lessonId) || fallbackLessons[0],
          questions: sampleQuestions,
        });
        setStatus({ kind: 'error', text: `${error.message}. Using local preview questions.` });
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
    setStatus({ kind: 'loading', text: 'Starting session...' });
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
      setStatus({ kind: 'error', text: `${error.message}. Opened local session preview.` });
      navigate(`/sessions/${encodeURIComponent(localSession.session_id)}`);
    }
  }

  const lesson = lessonData?.lesson || fallbackLessons.find((item) => item.lesson_id === lessonId) || fallbackLessons[0];
  const questions = lessonData?.questions || sampleQuestions;

  return (
    <main className="pilot-main">
      <section className="pilot-panel">
        <div className="pilot-section-heading pilot-section-heading--row">
          <div>
            <p>{lesson.level || 'A1'} · {lesson.main_skill_id}</p>
            <h1>{lesson.title}</h1>
          </div>
          <button className="pilot-primary" type="button" onClick={startSession}>
            Start
          </button>
        </div>
        <StatusText status={status} />
        <div className="pilot-question-preview">
          {questions.map((question, index) => (
            <article key={question.question_id}>
              <span>{index + 1}</span>
              <p>{question.prompt}</p>
              <small>{question.choices?.length || 0} choices · Difficulty {question.difficulty}</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function SessionView({ sessionId, profile }) {
  const storedSession = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem(`aim_session:${sessionId}`));
    } catch {
      return null;
    }
  }, [sessionId]);
  const questions = storedSession?.questions?.length ? storedSession.questions : sampleQuestions;
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState(null);

  function selectAnswer(questionId, choiceText) {
    setAnswers((current) => ({ ...current, [questionId]: choiceText }));
  }

  async function submit() {
    if (!profile.studentId) {
      navigate('/login');
      return;
    }

    const startedAt = Date.now();
    const attempts = questions.map((question, index) => ({
      student_id: Number(profile.studentId),
      skill_id: question.skill_id,
      question_id: question.question_id,
      session_id: sessionId,
      is_correct: false,
      response_time: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
      attempts: answers[question.question_id] ? 1 : 0,
      difficulty: question.difficulty || 1,
      hint_used: false,
      skip: !answers[question.question_id],
      answer_changed: false,
      time_of_day: 'morning',
      session_position: index + 1,
    }));

    setStatus({ kind: 'loading', text: 'Submitting attempts...' });
    try {
      const result = await submitSessionAttempts(profile.studentId, sessionId, attempts, profile.token);
      sessionStorage.setItem(`aim_result:${sessionId}`, JSON.stringify(result));
      navigate(`/result/${encodeURIComponent(sessionId)}`);
    } catch (error) {
      const localResult = {
        session_id: sessionId,
        attempts_saved: attempts.length,
        recommendation: { action: 'collect_more_evidence', reason: error.message },
        decision_conflict: { selected_action: 'collect_more_evidence' },
        reliability: { score: 0.2 },
      };
      sessionStorage.setItem(`aim_result:${sessionId}`, JSON.stringify(localResult));
      navigate(`/result/${encodeURIComponent(sessionId)}`);
    }
  }

  return (
    <main className="pilot-main">
      <section className="pilot-panel">
        <div className="pilot-section-heading pilot-section-heading--row">
          <div>
            <p>{storedSession?.lesson_id || 'Pilot session'}</p>
            <h1>Quiz</h1>
          </div>
          <button className="pilot-primary" type="button" onClick={submit}>
            Submit
          </button>
        </div>
        <StatusText status={status} />
        <div className="pilot-quiz">
          {questions.map((question, index) => (
            <fieldset key={question.question_id}>
              <legend>{index + 1}. {question.prompt}</legend>
              <div className="pilot-choice-grid">
                {(question.choices || []).map((choice) => {
                  const choiceText = choice.choice_text || String(choice);
                  return (
                    <button
                      className={answers[question.question_id] === choiceText ? 'is-selected' : ''}
                      key={choiceText}
                      type="button"
                      onClick={() => selectAnswer(question.question_id, choiceText)}
                    >
                      {choiceText}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      </section>
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
        setStatus({ kind: 'ready', text: 'Adaptive result loaded.' });
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

  const action = result?.recommendation?.action || result?.recommendation?.action_type || 'collect_more_evidence';
  const selectedAction = result?.decision_conflict?.selected_action || action;

  return (
    <main className="pilot-main">
      <section className="pilot-layout">
        <div className="pilot-panel">
          <div className="pilot-section-heading">
            <p>{sessionId}</p>
            <h1>Result</h1>
          </div>
          <StatusText status={status} />
          <dl className="pilot-result-grid">
            <div>
              <dt>Recommendation</dt>
              <dd>{action}</dd>
            </div>
            <div>
              <dt>Resolved action</dt>
              <dd>{selectedAction}</dd>
            </div>
            <div>
              <dt>Attempts</dt>
              <dd>{result?.attempts_saved || 0}</dd>
            </div>
            <div>
              <dt>Reliability</dt>
              <dd>{result?.reliability?.score ?? result?.reliability ?? 'pending'}</dd>
            </div>
          </dl>
        </div>
        <aside className="pilot-panel pilot-panel--side">
          <div className="pilot-section-heading">
            <p>Reason</p>
            <h2>AIM signal</h2>
          </div>
          <p className="pilot-note">{result?.recommendation?.reason || 'No recommendation detail yet.'}</p>
          <button className="pilot-primary" type="button" onClick={() => navigate('/dashboard')}>
            Dashboard
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
    // The auth subscription should be registered once for the app shell.
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

  if (route.name !== 'login' && !profile.studentId) {
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
      {route.name === 'login' && <LoginView profile={profile} onAuthenticated={saveAuthenticatedProfile} />}
      {route.name === 'dashboard' && <DashboardView profile={profile} />}
      {route.name === 'lesson' && <LessonView lessonId={route.lessonId} profile={profile} />}
      {route.name === 'session' && <SessionView sessionId={decodeURIComponent(route.sessionId)} profile={profile} />}
      {route.name === 'result' && <ResultView sessionId={decodeURIComponent(route.sessionId)} profile={profile} />}
    </div>
  );
}
