import { presentAuthMe } from './auth-me.presenter';

describe('presentAuthMe', () => {
  it('returns only safe current-user fields', () => {
    const response = presentAuthMe({
      id: '9c63ef31-463c-45a4-b6c4-6c5d5d53e541',
      email: 'student@example.com',
      role: 'authenticated',
      appMetadata: {
        roles: ['student'],
      },
      issuedAt: 1_800_000_000,
      expiresAt: 1_900_000_000,
    });

    expect(response).toEqual({
      user: {
        id: '9c63ef31-463c-45a4-b6c4-6c5d5d53e541',
        email: 'student@example.com',
      },
      session: {
        authenticated: true,
        sessionStatus: 'active',
        expiresAt: 1_900_000_000,
      },
      roles: ['student'],
      permissions: [],
    });

    const serializedResponse = JSON.stringify(response);
    expect(serializedResponse).not.toContain('appMetadata');
    expect(serializedResponse).not.toContain('issuedAt');
    expect(serializedResponse).not.toContain('test-jwt-secret');
  });
});
