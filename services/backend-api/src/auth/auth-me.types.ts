import { AuthorizedRole } from './authorization';

export interface AuthMeUser {
  readonly id: string;
  readonly email?: string;
  readonly userType?: string;
  readonly status?: string;
}

export interface AuthMeProfile {
  readonly id: string;
  readonly profileType: string;
  readonly displayName?: string | null;
  readonly avatarUrl?: string | null;
  readonly preferredLanguage?: string | null;
  readonly timezone?: string | null;
}

export interface AuthMeSession {
  readonly authenticated: true;
  readonly sessionStatus: 'active';
  readonly expiresAt: number;
}

export interface AuthMeResponse {
  readonly user: AuthMeUser;
  readonly profile?: AuthMeProfile | null;
  readonly session: AuthMeSession;
  readonly roles: readonly AuthorizedRole[];
  readonly permissions: readonly string[];
}
