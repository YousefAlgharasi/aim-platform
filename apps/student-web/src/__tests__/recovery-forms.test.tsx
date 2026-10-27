import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';

const mockPost = jest.fn();

jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }));
jest.mock('../i18n/I18nContext', () => ({
  useI18n: () => ({ t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])) }),
}));
jest.mock('../api/client', () => ({
  apiClient: { post: (...args: unknown[]) => mockPost(...args) },
  getErrorMessage: (err: unknown, fallback: string) => (err as { message?: string })?.message || fallback,
}));


const fill = (label: string, value: string) =>
  fireEvent.change(screen.getByPlaceholderText(label), { target: { value } });
const click = (name: RegExp) => fireEvent.click(screen.getByRole('button', { name }));

beforeEach(() => jest.clearAllMocks());

describe('ForgotPasswordPage validation', () => {
  it('requires a valid email and does not call the API otherwise', () => {
    render(<ForgotPasswordPage />);
    click(/send reset link/i);
    expect(screen.getByText('Email address is required.')).toBeTruthy();
    fill('Email address', 'nope');
    click(/send reset link/i);
    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('sends the trimmed email once and shows the confirmation', async () => {
    mockPost.mockResolvedValue({});
    render(<ForgotPasswordPage />);
    fill('Email address', 'user@example.com');
    click(/send reset link/i);
    await waitFor(() => expect(screen.getByText(/Check Your Email/i)).toBeTruthy());
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost.mock.calls[0][1]).toMatchObject({ email: 'user@example.com' });
  });

  it('shows a server error on network failure and keeps the typed email', async () => {
    mockPost.mockRejectedValue(new TypeError('Failed to fetch'));
    render(<ForgotPasswordPage />);
    fill('Email address', 'user@example.com');
    click(/send reset link/i);
    await waitFor(() => expect(screen.getByText('Failed to fetch')).toBeTruthy());
    expect((screen.getByPlaceholderText('Email address') as HTMLInputElement).value).toBe('user@example.com');
  });
});

describe('ResetPasswordPage validation', () => {
  beforeEach(() => {
    window.location.hash = '#access_token=tok&type=recovery';
  });

  it('enforces the 8 character minimum and matching confirmation', () => {
    render(<ResetPasswordPage />);
    fill('New password', '1234567');
    fill('Confirm new password', '1234567');
    click(/reset password/i);
    expect(screen.getByText('Password must be at least 8 characters.')).toBeTruthy();
    fill('New password', '12345678');
    fill('Confirm new password', '12345679');
    click(/reset password/i);
    expect(screen.getByText('Passwords do not match.')).toBeTruthy();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('submits a valid password and shows a backend failure message', async () => {
    mockPost.mockRejectedValue({ message: 'Link expired' });
    render(<ResetPasswordPage />);
    fill('New password', '12345678');
    fill('Confirm new password', '12345678');
    click(/reset password/i);
    await waitFor(() => expect(screen.getByText('Link expired')).toBeTruthy());
    expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', { password: '12345678' }, { token: 'tok' });
  });
});
