import { render, screen } from '@testing-library/react';
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
