import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

afterEach(() => {
  window.history.pushState({}, '', '/');
  jest.restoreAllMocks();
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

test('renders the web pilot login when no student is selected', () => {
  window.history.pushState({}, '', '/');
  render(<App />);

  expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  expect(screen.getByText(/127.0.0.1:8000/i)).toBeInTheDocument();
});

test('loads the web pilot dashboard from the configured API base URL', async () => {
  window.localStorage.setItem(
    'aim_web_pilot_profile',
    JSON.stringify({ studentId: '7', name: 'Mona', token: 'token-1' }),
  );
  window.history.pushState({}, '', '/dashboard');
  jest.spyOn(global, 'fetch').mockImplementation((url) =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve(
          String(url).endsWith('/lessons')
            ? {
                lessons: [
                  {
                    lesson_id: 'a1-routines-1',
                    title: 'Daily routines',
                    level: 'A1',
                    estimated_minutes: 12,
                    difficulty: 1,
                    skill_focus: ['GRAMMAR_VERB_FORMS'],
                  },
                ],
              }
            : {
                action_type: 'continue_current_skill',
                confidence: 0.8,
                reason: 'Keep practicing the current skill.',
              },
        ),
    }),
  );

  render(<App />);

  expect(screen.getByText('Daily routines')).toBeInTheDocument();
  expect(await screen.findAllByText(/continue_current_skill/i)).toHaveLength(2);
  expect(global.fetch).toHaveBeenCalledWith(
    'http://127.0.0.1:8000/students/7/lessons',
    expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer token-1' }),
    }),
  );
});

test('submits lesson session selected answers and attempt metadata', async () => {
  const session = {
    lesson_id: 'a1-routines-1',
    session_id: 'session-test',
    questions: [
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
    ],
  };
  window.localStorage.setItem(
    'aim_web_pilot_profile',
    JSON.stringify({ studentId: '7', name: 'Mona', token: 'token-1' }),
  );
  window.sessionStorage.setItem('aim_session:session-test', JSON.stringify(session));
  window.history.pushState({}, '', '/sessions/session-test');
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        session_id: 'session-test',
        attempts_saved: 1,
        recommendation: { action: 'collect_more_evidence', reason: 'More evidence needed.' },
        decision_conflict: { selected_action: 'collect_more_evidence' },
      }),
  });

  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: 'I wake up at seven.' }));
  fireEvent.click(screen.getByRole('button', { name: /hint used/i }));
  fireEvent.change(screen.getByLabelText(/confidence/i), { target: { value: '85' } });
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/students/7/sessions/session-test/attempts',
      expect.objectContaining({
        body: expect.stringContaining('"selected_answer":"I wake up at seven."'),
      }),
    );
  });
  const requestBody = JSON.parse(global.fetch.mock.calls[0][1].body);
  expect(requestBody.attempts[0]).toEqual(
    expect.objectContaining({
      selected_answer: 'I wake up at seven.',
      confidence: 85,
      hint_used: true,
      skip: false,
      answer_changed: false,
    }),
  );
  expect(requestBody.attempts[0]).not.toHaveProperty('is_correct');
});

test('renders adaptive result as student-facing next action', async () => {
  window.localStorage.setItem(
    'aim_web_pilot_profile',
    JSON.stringify({ studentId: '7', name: 'Mona', token: 'token-1' }),
  );
  window.sessionStorage.setItem(
    'aim_result:session-result',
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
  window.history.pushState({}, '', '/result/session-result');
  jest.spyOn(global, 'fetch').mockResolvedValue({
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

  expect(await screen.findByText(/adaptive result loaded/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /result/i })).toBeInTheDocument();
  expect(screen.getByText('74%')).toBeInTheDocument();
  expect(screen.getAllByText(/continue current skill/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/present simple negative/i).length).toBeGreaterThan(0);
  expect(screen.queryByText(/decision_conflict/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/resolved action/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/reliability/i)).not.toBeInTheDocument();
});
