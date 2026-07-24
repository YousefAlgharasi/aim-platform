import { getAdminAuthState, type AdminAuthContext } from './admin-auth';

export class AdminServerActionAuthError extends Error {
  constructor(message = 'Unauthorized access to admin action.') {
    super(message);
    this.name = 'AdminServerActionAuthError';
  }
}

export async function requireAdminServerActionAuth(): Promise<AdminAuthContext> {
  const authState = await getAdminAuthState();

  if (authState.status !== 'authenticated') {
    throw new AdminServerActionAuthError(
      `Unauthorized server action call. Current auth status: ${authState.status}`,
    );
  }

  return authState.context;
}
