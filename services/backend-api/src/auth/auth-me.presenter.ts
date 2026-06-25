import { AuthenticatedUser } from './authenticated-user';
import { resolveAuthorizedRoles } from './authorization';
import { AuthMeProfile, AuthMeResponse } from './auth-me.types';

export function presentAuthMe(
  user: AuthenticatedUser,
  extra?: {
    userType?: string;
    status?: string;
    profile?: AuthMeProfile | null;
  },
): AuthMeResponse {
  return {
    user: {
      id: user.id,
      ...(user.email ? { email: user.email } : {}),
      ...(extra?.userType ? { userType: extra.userType } : {}),
      ...(extra?.status ? { status: extra.status } : {}),
    },
    ...(extra?.profile !== undefined ? { profile: extra.profile } : {}),
    session: {
      authenticated: true,
      sessionStatus: 'active',
      expiresAt: user.expiresAt,
    },
    roles: resolveAuthorizedRoles(user),
    permissions: [],
  };
}
