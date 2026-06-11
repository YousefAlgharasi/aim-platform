export interface SupabaseJwtPayload {
  readonly aud?: string | readonly string[];
  readonly exp?: number;
  readonly iat?: number;
  readonly iss?: string;
  readonly sub?: string;
  readonly email?: string;
  readonly role?: string;
  readonly app_metadata?: Record<string, unknown>;
  readonly user_metadata?: Record<string, unknown>;
}

export interface SupabaseJwtHeader {
  readonly alg?: string;
  readonly typ?: string;
  readonly kid?: string;
}
