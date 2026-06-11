import { ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest, AuthenticatedUser } from './authenticated-user';
import { readCurrentUserFromContext } from './current-user.decorator';

describe('readCurrentUserFromContext', () => {
  const user: AuthenticatedUser = {
    id: '9c63ef31-463c-45a4-b6c4-6c5d5d53e541',
    email: 'student@example.com',
    appMetadata: {
      aim_roles: ['student'],
    },
    expiresAt: 1_900_000_000,
  };

  it('returns the authenticated user attached by the JWT guard', () => {
    expect(readCurrentUserFromContext(createHttpContext({ user }))).toEqual(user);
  });

  it('returns undefined when the request has no authenticated user', () => {
    expect(readCurrentUserFromContext(createHttpContext({}))).toBeUndefined();
  });
});

function createHttpContext(request: AuthenticatedRequest): ExecutionContext {
  return {
    switchToHttp: jest.fn(() => ({
      getRequest: jest.fn(() => request),
    })),
  } as unknown as ExecutionContext;
}
