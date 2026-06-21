// P11-010: Admin assessment results API client (read-only)
// Score and pass/fail are backend-computed. UI displays only.
import { adminApiClient } from './admin-api-client';
import { decodePaginatedResponse, type AdminPaginatedResponse } from './admin-paginated-response';

export type AdminAssessmentResultItem = {
  readonly id: string;
  readonly studentId: string;
  readonly assessmentId: string;
  readonly score: number;        // backend-computed — never recalculated here
  readonly passed: boolean;      // backend-computed — never recalculated here
  readonly attemptedAt: string;
  readonly completedAt: string | null;
};

function decodeResult(v: unknown): AdminAssessmentResultItem {
  const o = v as Record<string, unknown>;
  return {
    id:           String(o.id ?? ''),
    studentId:    String(o.studentId ?? ''),
    assessmentId: String(o.assessmentId ?? ''),
    score:        typeof o.score === 'number' ? o.score : 0,
    passed:       Boolean(o.passed),
    attemptedAt:  String(o.attemptedAt ?? ''),
    completedAt:  typeof o.completedAt === 'string' ? o.completedAt : null,
  };
}

export async function fetchAdminAssessmentResults(
  token: string,
  page = 1,
  limit = 20,
  filters?: { studentId?: string; assessmentId?: string },
): Promise<AdminPaginatedResponse<AdminAssessmentResultItem>> {
  const envelope = await adminApiClient.get(
    '/admin/assessment-results',
    (v) => decodePaginatedResponse(v, decodeResult),
    { headers: { authorization: `Bearer ${token}` }, query: { page, limit, ...filters } },
  );
  return envelope.data;
}

export async function fetchAdminAssessmentResultDetail(
  token: string,
  id: string,
): Promise<AdminAssessmentResultItem> {
  const envelope = await adminApiClient.get(
    `/admin/assessment-results/${id}`,
    decodeResult,
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}
