// P11-010: Admin student progress API client (read-only)
// Progress percentages are backend-computed. UI displays only.
import { adminApiClient } from './admin-api-client';
import { decodePaginatedResponse, type AdminPaginatedResponse } from './admin-paginated-response';

export type AdminStudentProgress = {
  readonly studentId: string;
  readonly completedLessons: number;
  readonly totalLessons: number;
  readonly completionPct: number;  // backend-computed — never recalculated here
  readonly lastActiveAt: string | null;
};

export type AdminLessonProgressItem = {
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly completed: boolean;
  readonly completedAt: string | null;
};

function decodeProgress(v: unknown): AdminStudentProgress {
  const o = v as Record<string, unknown>;
  return {
    studentId:        String(o.studentId ?? ''),
    completedLessons: typeof o.completedLessons === 'number' ? o.completedLessons : 0,
    totalLessons:     typeof o.totalLessons     === 'number' ? o.totalLessons     : 0,
    completionPct:    typeof o.completionPct    === 'number' ? o.completionPct    : 0,
    lastActiveAt:     typeof o.lastActiveAt === 'string' ? o.lastActiveAt : null,
  };
}

function decodeLessonProgress(v: unknown): AdminLessonProgressItem {
  const o = v as Record<string, unknown>;
  return {
    lessonId:    String(o.lessonId ?? ''),
    lessonTitle: String(o.lessonTitle ?? ''),
    completed:   Boolean(o.completed),
    completedAt: typeof o.completedAt === 'string' ? o.completedAt : null,
  };
}

export async function fetchAdminStudentProgress(
  token: string,
  studentId: string,
): Promise<AdminStudentProgress> {
  const envelope = await adminApiClient.get(
    `/admin/students/${studentId}/progress`,
    decodeProgress,
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}

export async function fetchAdminStudentLessons(
  token: string,
  studentId: string,
  page = 1,
  limit = 20,
): Promise<AdminPaginatedResponse<AdminLessonProgressItem>> {
  const envelope = await adminApiClient.get(
    `/admin/students/${studentId}/lessons`,
    (v) => decodePaginatedResponse(v, decodeLessonProgress),
    { headers: { authorization: `Bearer ${token}` }, query: { page, limit } },
  );
  return envelope.data;
}
