export const OPENAPI_TAGS = {
  foundation: 'foundation',
  auth: 'auth',
  students: 'students',
  lessons: 'lessons',
  sessions: 'sessions',
  aim: 'aim',
  aiTeacher: 'ai-teacher',
  voiceTeacher: 'voice-teacher',
  admin: 'admin',
  reports: 'reports',
  profile: 'profile',
  curriculum: 'curriculum',
  placement: 'placement',
} as const;

export type OpenApiTag = (typeof OPENAPI_TAGS)[keyof typeof OPENAPI_TAGS];
