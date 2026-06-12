export type AuthEventType =
  | 'login'
  | 'logout'
  | 'token_validated'
  | 'token_rejected'
  | 'user_created'
  | 'user_status_changed'
  | 'role_assigned'
  | 'role_removed'
  | 'profile_updated'
  | 'profile_access_denied'
  | 'access_denied'
  | 'password_reset_requested'
  | 'email_changed';

export interface AuthLogContext {
  readonly userId?: string;
  readonly supabaseAuthUid?: string;
  readonly actorUserId?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly metadata?: Record<string, unknown>;
}
