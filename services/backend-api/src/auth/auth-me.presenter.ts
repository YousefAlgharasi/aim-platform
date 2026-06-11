import { AuthenticatedUser } from './authenticated-user';
import { resolveAuthorizedRoles } from './authorization';
import { AuthMeResponse } from './auth-me.types';

export function presentAuthMe(user: AuthenticatedUser): AuthMeResponse {
  return {
    user: {
      id: user.id,
      ...(user.email ? { email: user.email } : {}),
    },
    session: {
      authenticated: true,
      sessionStatus: 'active',
      expiresAt: user.expiresAt,
    },
    roles: resolveAuthorizedRoles(user),
    permissions: [],
  };
}
