export const ADMIN_AUTH_TOKEN_COOKIE = 'aim_admin_access_token';

export const BACKEND_AUTHORIZED_ROLES = [
  'student',
  'parent',
  'teacher',
  'content_editor',
  'reviewer',
  'admin',
  'super_admin',
] as const;

export type BackendAuthorizedRole = (typeof BACKEND_AUTHORIZED_ROLES)[number];
