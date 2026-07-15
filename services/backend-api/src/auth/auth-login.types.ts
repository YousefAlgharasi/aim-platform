export interface AuthLoginInput {
  readonly email: string;
  readonly password: string;
}

export interface AuthTokenResult {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: number;
}

export interface AuthLoginResult extends AuthTokenResult {
  readonly user: {
    readonly id: string;
    readonly email: string | null;
  };
}

export interface AuthRefreshInput {
  readonly refreshToken: string;
}

export interface AuthRegisterInput {
  readonly email: string;
  readonly password: string;
  readonly redirectUrl?: string;
}

export interface AuthForgotPasswordInput {
  readonly email: string;
  readonly redirectUrl?: string;
}

export interface AuthForgotPasswordResult {
  readonly sent: true;
}

export interface AuthRegisterResult {
  readonly requiresEmailConfirmation: boolean;
  readonly accessToken?: string;
  readonly refreshToken?: string;
  readonly expiresAt?: number;
  readonly user?: {
    readonly id: string;
    readonly email: string | null;
  };
}

// Raw shape returned by Supabase's GoTrue token endpoints.
export interface SupabaseAuthTokenResponse {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly expires_at?: number;
  readonly expires_in?: number;
  readonly user?: {
    readonly id: string;
    readonly email?: string | null;
    readonly app_metadata?: { readonly role?: string };
  };
}

export interface SupabaseAuthErrorResponse {
  readonly error_code?: string;
  readonly msg?: string;
  readonly error_description?: string;
  readonly message?: string;
}

export interface SupabaseSignUpResponse {
  readonly id?: string;
  readonly email?: string | null;
  readonly access_token?: string;
  readonly refresh_token?: string;
  readonly expires_at?: number;
  readonly expires_in?: number;
  readonly user?: {
    readonly id: string;
    readonly email?: string | null;
  };
}
