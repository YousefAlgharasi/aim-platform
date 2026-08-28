// P11-010: Admin assessment results API client (read-only)
// Score and pass/fail are backend-computed. UI displays only.
import { adminApiClient } from '../../../core/api/admin-api-client';
import { decodePaginatedResponse, type AdminPaginatedResponse } from '../../../core/api/admin-paginated-response';

export type AdminAssessmentResultItem = {
  readonly id: string;
  readonly studentId: string;
  readonly studentName: string | null;
  readonly assessmentId: string;
  readonly assessmentTitle: string | null;
  readonly score: number;        // backend-computed — never recalculated here
  readonly maxScore: number;     // backend-computed — never recalculated here
  readonly passed: boolean;      // backend-computed — never recalculated here
  readonly attemptedAt: string;
  readonly completedAt: string | null;
};

// score/maxScore are NUMERIC columns on the backend — pg returns them as
// strings (e.g. "8.00"), so accept either a number or a numeric string and
// only fall back to 0 when the value truly isn't parseable.
function decodeNumeric(v: unknown): number {
  if (typeof v === 'number') return v;
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : 0;
}

function decodeResult(v: unknown): AdminAssessmentResultItem {
  const o = v as Record<string, unknown>;
  return {
    id:              String(o.id ?? ''),
    studentId:       String(o.studentId ?? ''),
    studentName:     typeof o.studentName === 'string' ? o.studentName : null,
    assessmentId:    String(o.assessmentId ?? ''),
    assessmentTitle: typeof o.assessmentTitle === 'string' ? o.assessmentTitle : null,
    score:           decodeNumeric(o.score),
    maxScore:        decodeNumeric(o.maxScore),
    passed:          Boolean(o.passed),
    attemptedAt:     String(o.attemptedAt ?? ''),
    completedAt:     typeof o.completedAt === 'string' ? o.completedAt : null,
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
