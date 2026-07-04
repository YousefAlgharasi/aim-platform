import { render, screen } from '@testing-library/react';
import App from './App';
import { supabase } from './shared/supabase/client';

jest.mock('./shared/supabase/client', () => ({
  SUPABASE_URL: 'https://test.supabase.co',
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
  supabase.auth.onAuthStateChange.mockReturnValue({
    data: {
      subscription: {
        unsubscribe: jest.fn(),
      },
    },
  });
});

afterEach(() => {
  window.history.pushState({}, '', '/');
  jest.clearAllMocks();
  delete global.fetch;
});

test('renders the AIM visual demo dashboard', () => {
  window.history.pushState({}, '', '/aim-demo');
  render(<App />);

  expect(
    screen.getByRole('heading', {
      name: /aim adaptive pipeline dashboard/i,
    }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /run aim demo/i })).toBeInTheDocument();
  expect(screen.getByText(/mock demo data/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Student Profile' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Submitted Attempts' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Prompt Adaptation Instruction' })).toBeInTheDocument();
});

test('renders the web pilot login when no student is selected', async () => {
  window.history.pushState({}, '', '/login');
  render(<App />);

  expect(screen.getByRole('heading', { name: /تسجيل دخول الطالب/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/البريد الإلكتروني/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/كلمة المرور/i)).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /تسجيل الدخول/i }).length).toBeGreaterThan(0);
});

test('loads the admin dashboard from the configured API base URL', async () => {
  window.localStorage.setItem('aim_supabase_access_token', 'token-1');
  window.history.pushState({}, '', '/admin');
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    text: () =>
      Promise.resolve(
        JSON.stringify({
          summary: {
            students: 1,
            sessions: 1,
            attempts: 2,
            recommendations: 1,
            outcomes: 1,
            audit_events: 1,
          },
          students: [
            {
              id: 7,
              name: 'Mona',
              email: 'mona@example.com',
              latest_mastery: 74,
              latest_reliability: 0.82,
              latest_skill_id: 'GRAMMAR_VERB_FORMS',
            },
          ],
          sessions: [
            {
              session_id: 'session-test',
              student_id: 7,
              attempt_count: 2,
              accuracy: 50,
              latest_attempt_at: '2026-06-05T12:00:00',
            },
          ],
          mastery_changes: [
            {
              student_id: 7,
              skill_id: 'GRAMMAR_VERB_FORMS',
              mastery: 74,
              retention: 81,
              current_difficulty: 2,
              updated_at: '2026-06-05T12:00:00',
            },
          ],
          recommendations: [
            {
              id: 11,
              student_id: 7,
              action_type: 'continue_current_skill',
              skill_id: 'GRAMMAR_VERB_FORMS',
              difficulty: 2,
              was_followed: true,
              created_at: '2026-06-05T12:00:00',
            },
          ],
          outcomes: [
            {
              id: 21,
              recommendation_id: 11,
              outcome: 'successful',
              mastery_delta: 4,
              retention_delta: 1,
              weakness_delta: -3,
            },
          ],
          events: [
            {
              id: 31,
              action: 'adaptive_result',
              entity_type: 'web_session',
              entity_id: 'session-test',
              student_id: 7,
              created_at: '2026-06-05T12:00:00',
            },
          ],
        }),
      ),
  });

  render(<App />);

  expect(await screen.findByRole('heading', { name: /admin dashboard/i })).toBeInTheDocument();
  expect(await screen.findByText('Mona')).toBeInTheDocument();
  expect(screen.getAllByText('session-test').length).toBeGreaterThan(0);
  expect(screen.getAllByText(/continue current skill/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/successful/i)).toBeInTheDocument();
  expect(screen.getByText(/adaptive result/i)).toBeInTheDocument();

  expect(global.fetch).toHaveBeenCalledWith(
    'http://127.0.0.1:8000/admin/pilot/overview',
    expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer token-1' }),
    }),
  );
});

test('renders adaptive result as student-facing next action', async () => {
  window.localStorage.setItem(
    'aim_web_pilot_profile',
    JSON.stringify({ studentId: '7', name: 'Mona', token: 'token-1' }),
  );
  window.localStorage.setItem(
    'aim_last_adaptive_result',
    JSON.stringify({
      session_id: 'session-result',
      attempts_saved: 2,
      updated_skill_state: { mastery: 74 },
      weakness_result: { primary_weakness: 'present_simple_negative' },
      recommendation: {
        action: 'continue_current_skill',
        reason: 'Review present simple negatives, then continue.',
      },
      decision_conflict: { selected_action: 'continue_current_skill' },
      reliability: { score: 0.8 },
    }),
  );
  window.localStorage.setItem(
    'aim_last_adaptive_result_meta',
    JSON.stringify({ studentId: '7', sessionId: 'session-result' }),
  );
  window.history.pushState({}, '', '/adaptive-result?studentId=7&sessionId=session-result');
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        session_id: 'session-result',
        attempts_saved: 2,
        updated_skill_state: { mastery: 74 },
        weakness_result: { primary_weakness: 'present_simple_negative' },
        recommendation: {
          action: 'continue_current_skill',
          reason: 'Review present simple negatives, then continue.',
        },
      }),
  });

  render(<App />);

  expect(await screen.findByText(/تم عرض النتيجة المحفوظة/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /نتيجة التكيف الذكي/i })).toBeInTheDocument();
  expect(screen.getByText('74%')).toBeInTheDocument();
  expect(screen.getAllByText(/متابعة المهارة الحالية/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/present simple negative/i).length).toBeGreaterThan(0);
  expect(screen.getByText('عرض البيانات الخام للمطور')).toBeInTheDocument();
  expect(screen.getAllByText(/نسبة الإتقان/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/مهارات تحتاج إلى تدريب/i).length).toBeGreaterThan(0);
});
