export interface AuthLoginInput {
  readonly email: string;
  readonly password: string;
}

export interface AuthTokenResult {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: number;
}

export interface AuthUserInfo {
  readonly id: string;
  readonly email: string | null;
  readonly internalUserId?: string;
  readonly profileId?: string | null;
  readonly displayName?: string | null;
  readonly avatarUrl?: string | null;
  readonly preferredLanguage?: string | null;
  readonly timezone?: string | null;
  readonly userType?: string;
  readonly status?: string;
}

export interface AuthProfileInfo {
  readonly id: string | null;
  readonly profileType: string | null;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly preferredLanguage: string | null;
  readonly timezone: string | null;
}

export interface AuthLoginResult extends AuthTokenResult {
  readonly user: AuthUserInfo;
  readonly profile?: AuthProfileInfo | null;
}

export interface AuthRefreshInput {
  readonly refreshToken: string;
}

export interface AuthRegisterInput {
  readonly email: string;
  readonly password: string;
  readonly displayName?: string;
  readonly name?: string;
  readonly fullName?: string;
  readonly avatarUrl?: string;
  readonly preferredLanguage?: string;
  readonly timezone?: string;
  readonly redirectUrl?: string;
}

export interface AuthForgotPasswordInput {
  readonly email: string;
  readonly redirectUrl?: string;
}

export interface AuthForgotPasswordResult {
  readonly sent: true;
}

export interface AuthResetPasswordInput {
  readonly password: string;
}

export interface AuthRegisterResult {
  readonly requiresEmailConfirmation: boolean;
  readonly accessToken?: string;
  readonly refreshToken?: string;
  readonly expiresAt?: number;
  readonly user?: AuthUserInfo;
  readonly profile?: AuthProfileInfo | null;
}

export interface AuthGoogleLoginInput {
  readonly idToken: string;
  readonly nonce?: string;
}

export type AuthGoogleLoginResult = AuthLoginResult;


// Raw shape returned by Supabase's GoTrue token endpoints.
export interface SupabaseAuthTokenResponse {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly expires_at?: number;
  readonly expires_in?: number;
  readonly user?: {
    readonly id: string;
    readonly email?: string | null;
    readonly phone?: string | null;
    readonly app_metadata?: { readonly role?: string };
    readonly user_metadata?: Record<string, unknown>;
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
  readonly phone?: string | null;
  readonly user_metadata?: Record<string, unknown>;
  /**
   * With email confirmation enabled, Supabase answers a signup for an
   * already-registered email with a 200 and an obfuscated user whose
   * `identities` list is empty, instead of an error.
   */
  readonly identities?: readonly unknown[] | null;
  readonly access_token?: string;
  readonly refresh_token?: string;
  readonly expires_at?: number;
  readonly expires_in?: number;
  readonly user?: {
    readonly id: string;
    readonly email?: string | null;
    readonly phone?: string | null;
    readonly user_metadata?: Record<string, unknown>;
    readonly identities?: readonly unknown[] | null;
  };
}
