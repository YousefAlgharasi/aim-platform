export interface User {
  id: string;
  email: string;
  name: string;
  locale: 'en' | 'ar';
  avatarUrl?: string;
  userType?: string;
  roles: string[];
  /** student_profiles.id when the account has a student profile. */
  studentProfileId?: string;
}

/** Normalised backend error envelope (`error` field of a failed response). */
export interface ApiError {
  code: string;
  statusCode: number;
  message: string;
  details?: unknown;
}
