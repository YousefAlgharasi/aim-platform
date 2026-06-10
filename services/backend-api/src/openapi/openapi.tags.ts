export const OPENAPI_TAGS = {
  foundation: 'foundation',
  auth: 'auth',
  students: 'students',
  lessons: 'lessons',
  sessions: 'sessions',
  aim: 'aim',
  aiTeacher: 'ai-teacher',
  admin: 'admin',
  reports: 'reports',
} as const;

export type OpenApiTag = (typeof OPENAPI_TAGS)[keyof typeof OPENAPI_TAGS];
