export interface AuthenticatedUser {
  readonly id: string;
  readonly email?: string;
  readonly role?: string;
  readonly appMetadata?: Record<string, unknown>;
  readonly issuedAt?: number;
  readonly expiresAt: number;
}

export interface AuthenticatedRequest {
  headers?: Record<string, string | string[] | undefined>;
  user?: AuthenticatedUser;
}
