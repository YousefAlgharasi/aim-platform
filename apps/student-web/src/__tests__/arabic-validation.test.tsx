import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { getErrorMessage } from '../api/client';
import { setCurrentLocale } from '../i18n';
import { localizeValidationMessage, mapApiFieldErrors } from '../utils/validation';
import { LoginPage } from '../features/auth/LoginPage';

const mockLogin = jest.fn();

jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn(), useLocation: () => ({ state: null }) }));
jest.mock('../hooks/useAuth', () => ({ useAuth: () => ({ login: mockLogin, googleLogin: jest.fn() }) }));
jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
// Real translate() is used so these tests exercise the actual Arabic dictionary.
jest.mock('../i18n/I18nContext', () => {
  const { t } = jest.requireActual('../i18n');
  return { useI18n: () => ({ t }) };
});

const ARABIC = /[؀-ۿ]/;
const hasNoLatinWords = (s: string) => !/[A-Za-z]{3,}/.test(s);

beforeEach(() => {
  jest.clearAllMocks();
  setCurrentLocale('ar');
});
afterAll(() => setCurrentLocale('en'));

describe('Arabic: no English validation or error text', () => {
  it('localizes class-validator messages', () => {
    const cases = [
      'email must be an email',
      'password must be longer than or equal to 8 characters',
      'subject must be shorter than or equal to 500 characters',
      'subject should not be empty',
      'something weird must be a banana',
    ];
    for (const c of cases) {
      const out = localizeValidationMessage(c);
      expect(ARABIC.test(out)).toBe(true);
      expect(hasNoLatinWords(out)).toBe(true);
    }
    expect(localizeValidationMessage('password must be longer than or equal to 8 characters')).toContain('8');
  });

  it('maps backend field details to Arabic, never raw English', () => {
    const out = mapApiFieldErrors({ details: ['email must be an email'] }, ['email'] as const);
    expect(ARABIC.test(out.email as string)).toBe(true);
    expect(out.email).not.toContain('must be');
  });

  it('translates known backend messages and hides unknown English ones', () => {
    expect(getErrorMessage({ message: 'Incorrect email or password.' }, 'Login failed')).toMatch(ARABIC);
    expect(getErrorMessage({ message: 'Validation failed' })).toMatch(ARABIC);
    // Unknown English backend text falls back to the caller's localized fallback.
    const out = getErrorMessage({ message: 'Some brand new English error' }, 'Login failed');
    expect(out).toMatch(ARABIC);
    expect(out).not.toContain('brand new');
    // Messages that are already Arabic pass through.
    expect(getErrorMessage({ message: 'رسالة جاهزة' })).toBe('رسالة جاهزة');
  });

  it('keeps showing the backend message in English for English users', () => {
    setCurrentLocale('en');
    expect(getErrorMessage({ message: 'Some brand new English error' }, 'Login failed')).toBe('Some brand new English error');
  });

  it('login form shows only Arabic text for client and server errors', async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /تسجيل الدخول/ }));
    const alerts = screen.getAllByRole('alert').map((a) => a.textContent ?? '');
    expect(alerts.length).toBeGreaterThanOrEqual(2);
    alerts.forEach((a) => expect(hasNoLatinWords(a)).toBe(true));

    mockLogin.mockRejectedValue({ message: 'Totally unknown server failure', details: ['email must be an email'] });
    fireEvent.change(screen.getByLabelText('البريد الإلكتروني'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('كلمة المرور'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /تسجيل الدخول/ }));
    await waitFor(() => expect(mockLogin).toHaveBeenCalled());
    await waitFor(() => {
      const texts = screen.getAllByRole('alert').map((a) => a.textContent ?? '');
      expect(texts.length).toBeGreaterThan(0);
      texts.forEach((a) => expect(hasNoLatinWords(a)).toBe(true));
    });
  });

  it('shows the wrong-credentials server message in Arabic on the login form', async () => {
    mockLogin.mockRejectedValue({ code: 'UNAUTHORIZED', statusCode: 401, message: 'Incorrect email or password.' });
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('البريد الإلكتروني'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('كلمة المرور'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /تسجيل الدخول/ }));
    await waitFor(() => expect(screen.getByText('البريد الإلكتروني أو كلمة المرور غير صحيحة.')).toBeTruthy());
    expect(screen.queryByText(/Incorrect email/)).toBeNull();
  });
});
