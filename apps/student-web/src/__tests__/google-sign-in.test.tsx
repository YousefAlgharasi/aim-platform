import { render, screen } from '@testing-library/react';
import { config as mockConfig } from '../config';
import { GoogleSignInButton as Button } from '../components/auth/GoogleSignInButton';

jest.mock('../i18n/I18nContext', () => ({ useI18n: () => ({ t: (s: string) => s }) }));

jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));


describe('GoogleSignInButton', () => {
  it('renders nothing without a client id', () => {
    mockConfig.googleClientId = '';
    const { container } = render(<Button onCredential={jest.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it('renders the button and forwards the Google credential', async () => {
    const onCredential = jest.fn();
    const initialize = jest.fn();
    const renderButton = jest.fn();
    (window as any).google = { accounts: { id: { initialize, renderButton } } };
    mockConfig.googleClientId = 'test-client';
    render(<Button onCredential={onCredential} />);
    expect(screen.getByText('Continue with Google')).toBeTruthy();
    await new Promise((r) => setTimeout(r, 0));
    expect(initialize).toHaveBeenCalledWith(expect.objectContaining({ client_id: 'test-client' }));
    expect(renderButton).toHaveBeenCalled();
    initialize.mock.calls[0][0].callback({ credential: 'tok123' });
    expect(onCredential).toHaveBeenCalledWith('tok123');
  });
});
