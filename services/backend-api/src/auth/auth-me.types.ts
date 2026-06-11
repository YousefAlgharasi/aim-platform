import { AuthorizedRole } from './authorization';

export interface AuthMeUser {
  readonly id: string;
  readonly email?: string;
}

export interface AuthMeSession {
  readonly authenticated: true;
  readonly sessionStatus: 'active';
  readonly expiresAt: number;
}

export interface AuthMeResponse {
  readonly user: AuthMeUser;
  readonly session: AuthMeSession;
  readonly roles: readonly AuthorizedRole[];
  readonly permissions: readonly string[];
}
