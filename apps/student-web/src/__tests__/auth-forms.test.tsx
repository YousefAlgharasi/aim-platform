import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterPage } from '../features/auth/RegisterPage';
import { LoginPage } from '../features/auth/LoginPage';

const mockRegister = jest.fn();
const mockLogin = jest.fn();

jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn(), useLocation: () => ({ state: null }) }));
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ register: mockRegister, login: mockLogin, googleLogin: jest.fn() }),
}));
jest.mock('../i18n/I18nContext', () => ({
  useI18n: () => ({ t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])) }),
}));
jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));


const fill = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = (name: RegExp) => fireEvent.click(screen.getByRole('button', { name }));

beforeEach(() => jest.clearAllMocks());

describe('LoginPage validation', () => {
  const setup = () => render(<LoginPage />);

  it('blocks empty submit, shows field errors and sets aria-invalid', () => {
    setup();
    submit(/^sign in$/i);
    expect(screen.getByText('Email address is required.')).toBeTruthy();
    expect(screen.getByText('Password is required.')).toBeTruthy();
    expect(screen.getByLabelText('Email address').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByLabelText('Email address').getAttribute('aria-describedby')).toBe('login-email-error');
    expect(document.activeElement?.id).toBe('login-email');
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('rejects a malformed email without calling the API', () => {
    setup();
    fill('Email address', 'not-an-email');
    fill('Password', 'secret');
    submit(/^sign in$/i);
    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('does not trim passwords: a spaces-only password is sent as typed', async () => {
    mockLogin.mockResolvedValue(undefined);
    setup();
    fill('Email address', 'user@example.com');
    fill('Password', '        ');
    submit(/^sign in$/i);
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('user@example.com', '        '));
  });

  it('clears an error when the user edits the field and keeps values', () => {
    setup();
    submit(/^sign in$/i);
    fill('Email address', 'a@b.co');
    expect(screen.queryByText('Email address is required.')).toBeNull();
    expect((screen.getByLabelText('Email address') as HTMLInputElement).value).toBe('a@b.co');
  });

  it('submits valid credentials once even if clicked twice', async () => {
    let resolve!: () => void;
    mockLogin.mockReturnValue(new Promise<void>((r) => { resolve = r; }));
    setup();
    fill('Email address', 'user@example.com');
    fill('Password', 'secret');
    submit(/^sign in$/i);
    submit(/signing in/i);
    expect(mockLogin).toHaveBeenCalledTimes(1);
    expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'secret');
    resolve();
    await waitFor(() => expect(screen.getByRole('button', { name: /^sign in$/i })).toBeTruthy());
  });

  it('shows a server error banner on failure', async () => {
    mockLogin.mockRejectedValue({ message: 'Invalid credentials' });
    setup();
    fill('Email address', 'user@example.com');
    fill('Password', 'secret');
    submit(/^sign in$/i);
    await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeTruthy());
  });

  it('maps backend field errors onto inputs', async () => {
    mockLogin.mockRejectedValue({ message: 'Bad Request', details: ['email must be an email'] });
    setup();
    fill('Email address', 'user@example.com');
    fill('Password', 'secret');
    submit(/^sign in$/i);
    await waitFor(() => expect(screen.getByText('Enter a valid email address.')).toBeTruthy());
  });

  it('shows a fallback message on network failure', async () => {
    mockLogin.mockRejectedValue(new TypeError('Failed to fetch'));
    setup();
    fill('Email address', 'user@example.com');
    fill('Password', 'secret');
    submit(/^sign in$/i);
    await waitFor(() => expect(screen.getByText('Failed to fetch')).toBeTruthy());
  });
});

describe('RegisterPage validation', () => {
  const setup = () => render(<RegisterPage />);

  it('requires every field', () => {
    setup();
    submit(/^create account$/i);
    expect(screen.getByText('Full name is required.')).toBeTruthy();
    expect(screen.getByText('Email address is required.')).toBeTruthy();
    expect(screen.getByText('Password is required.')).toBeTruthy();
    expect(screen.getByText('Please confirm your password.')).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('rejects whitespace-only name, short password and mismatch', () => {
    setup();
    fill('Full name', '   ');
    fill('Email address', 'a@b.co');
    fill('Password', '1234567');
    fill('Confirm password', '1234568');
    submit(/^create account$/i);
    expect(screen.getByText('Full name is required.')).toBeTruthy();
    expect(screen.getByText('Password must be at least 8 characters.')).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('flags a password mismatch', () => {
    setup();
    fill('Full name', 'Sam');
    fill('Email address', 'a@b.co');
    fill('Password', '12345678');
    fill('Confirm password', '12345679');
    submit(/^create account$/i);
    expect(screen.getByText('Passwords do not match.')).toBeTruthy();
  });

  it('submits a valid form with the 8 character boundary password', async () => {
    mockRegister.mockResolvedValue({ requiresEmailConfirmation: true });
    setup();
    fill('Full name', 'Sam');
    fill('Email address', ' a@b.co ');
    fill('Password', '12345678');
    fill('Confirm password', '12345678');
    submit(/^create account$/i);
    await waitFor(() => expect(mockRegister).toHaveBeenCalledWith('a@b.co', '12345678', 'Sam'));
  });

  it('tells the user when the email is already registered', async () => {
    mockRegister.mockRejectedValue({ code: 'CONFLICT', message: 'An account with this email already exists. Try signing in instead.' });
    setup();
    fill('Full name', 'Sam');
    fill('Email address', 'a@b.co');
    fill('Password', '12345678');
    fill('Confirm password', '12345678');
    submit(/^create account$/i);
    await waitFor(() =>
      expect(screen.getByText('An account with this email already exists. Try signing in instead.')).toBeTruthy(),
    );
    expect(screen.queryByText(/check your email/i)).toBeNull();
  });
});
