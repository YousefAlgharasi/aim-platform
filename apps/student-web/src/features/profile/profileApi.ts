import { apiClient } from '../../api/client';

// Contract: services/backend-api/src/features/profile/profile.types.ts
// Flutter: apps/mobile/lib/features/profile/data/models/*.dart

export interface StudentProfileResponse {
  id: string;
  profileType: 'student_profile';
  displayName: string | null;
  avatarUrl: string | null;
  preferredLanguage: string | null;
  timezone: string | null;
}

export interface AdminProfileResponse {
  id: string;
  profileType: 'admin_profile';
  displayName: string | null;
  avatarUrl: string | null;
  department: string | null;
}

export interface ProfileMeResponse {
  internalUserId: string;
  userType: string;
  studentProfile: StudentProfileResponse | null;
  adminProfile: AdminProfileResponse | null;
}

/** Safe student fields accepted by PATCH /profile/me (UpdateProfileMeInput). */
export interface UpdateStudentProfileInput {
  displayName?: string;
  avatarUrl?: string;
  preferredLanguage?: 'en' | 'ar';
  timezone?: string;
}

export const LANGUAGE_OPTIONS: { value: 'en' | 'ar'; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
];

// Same curated IANA list as Flutter's edit_profile_page.dart.
export const TIMEZONE_OPTIONS: { value: string; label: string }[] = [
  { value: 'UTC', label: 'UTC (GMT+0)' },
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh (GMT+3)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GMT+4)' },
  { value: 'Asia/Kuwait', label: 'Asia/Kuwait (GMT+3)' },
  { value: 'Asia/Qatar', label: 'Asia/Qatar (GMT+3)' },
  { value: 'Asia/Bahrain', label: 'Asia/Bahrain (GMT+3)' },
  { value: 'Africa/Cairo', label: 'Africa/Cairo (GMT+2)' },
  { value: 'Asia/Amman', label: 'Asia/Amman (GMT+2)' },
  { value: 'Asia/Beirut', label: 'Asia/Beirut (GMT+2)' },
  { value: 'Europe/London', label: 'Europe/London (GMT+0)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1)' },
  { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
];

export const DISPLAY_NAME_MAX = 80;

export function fetchProfile(): Promise<ProfileMeResponse> {
  return apiClient.get<ProfileMeResponse>('/profile/me');
}

export function updateProfile(input: UpdateStudentProfileInput): Promise<ProfileMeResponse> {
  // Only send fields that are set (mirrors Flutter's toJson which omits nulls).
  const body: Record<string, string> = {};
  (Object.keys(input) as (keyof UpdateStudentProfileInput)[]).forEach(key => {
    const value = input[key];
    if (value !== undefined) body[key] = value;
  });
  return apiClient.patch<ProfileMeResponse>('/profile/me', body);
}
