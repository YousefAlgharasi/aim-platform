// P11-010: Admin assessments API client
// Backend authority: assessment grading, pass/fail, scoring — never computed here.
import { adminApiClient } from './admin-api-client';
import { AdminApiClientError } from './admin-api-client-error';
import { decodePaginatedResponse, type AdminPaginatedResponse } from './admin-paginated-response';

export type AdminAssessmentType = 'quiz' | 'exam';
export type AdminAssessmentStatus = 'draft' | 'published' | 'archived';

export type AdminAssessmentListItem = {
  readonly id: string;
  readonly title: string;
  readonly type: AdminAssessmentType;
  readonly status: AdminAssessmentStatus;
  readonly questionCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminAssessmentSettings = {
  readonly timeLimitMinutes: number | null;
  readonly passMark: number | null;
  readonly shuffleQuestions: boolean;
};

export type AdminAssessmentDetail = AdminAssessmentListItem & {
  readonly questionIds: readonly string[];
  readonly settings: AdminAssessmentSettings;
};

function decodeListItem(v: unknown): AdminAssessmentListItem {
  const o = v as Record<string, unknown>;
  return {
    id:            String(o.id ?? ''),
    title:         String(o.title ?? ''),
    type:          (o.type as AdminAssessmentType) ?? 'quiz',
    status:        (o.status as AdminAssessmentStatus) ?? 'draft',
    questionCount: typeof o.questionCount === 'number' ? o.questionCount : 0,
    createdAt:     String(o.createdAt ?? ''),
    updatedAt:     String(o.updatedAt ?? ''),
  };
}

function decodeDetail(v: unknown): AdminAssessmentDetail {
  const o = v as Record<string, unknown>;
  const settings = (o.settings ?? {}) as Record<string, unknown>;
  return {
    ...decodeListItem(v),
    questionIds: Array.isArray(o.questionIds) ? o.questionIds.map(String) : [],
    settings: {
      timeLimitMinutes: typeof settings.timeLimitMinutes === 'number' ? settings.timeLimitMinutes : null,
      passMark:         typeof settings.passMark === 'number' ? settings.passMark : null,
      shuffleQuestions: Boolean(settings.shuffleQuestions),
    },
  };
}

export async function fetchAdminAssessments(
  token: string,
  page = 1,
  limit = 20,
  type?: AdminAssessmentType,
): Promise<AdminPaginatedResponse<AdminAssessmentListItem>> {
  const envelope = await adminApiClient.get(
    '/admin/assessments',
    (v) => decodePaginatedResponse(v, decodeListItem),
    { headers: { authorization: `Bearer ${token}` }, query: { page, limit, ...(type ? { type } : {}) } },
  );
  return envelope.data;
}

export async function fetchAdminAssessmentDetail(
  token: string,
  id: string,
): Promise<AdminAssessmentDetail> {
  const envelope = await adminApiClient.get(
    `/admin/assessments/${id}`,
    decodeDetail,
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}

export type CreateAssessmentBody = {
  title: string;
  type: AdminAssessmentType;
  questionIds: string[];
  settings?: Partial<AdminAssessmentSettings>;
};

export async function createAdminAssessment(
  token: string,
  body: CreateAssessmentBody,
): Promise<AdminAssessmentDetail> {
  const envelope = await adminApiClient.post(
    '/admin/assessments',
    decodeDetail,
    { headers: { authorization: `Bearer ${token}` }, body },
  );
  return envelope.data;
}

export async function updateAdminAssessment(
  token: string,
  id: string,
  body: Partial<CreateAssessmentBody>,
): Promise<AdminAssessmentDetail> {
  const envelope = await adminApiClient.patch(
    `/admin/assessments/${id}`,
    decodeDetail,
    { headers: { authorization: `Bearer ${token}` }, body },
  );
  return envelope.data;
}

export async function publishAdminAssessment(token: string, id: string): Promise<void> {
  await adminApiClient.patch(
    `/admin/assessments/${id}/publish`,
    () => undefined,
    { headers: { authorization: `Bearer ${token}` } },
  );
}

export async function unpublishAdminAssessment(token: string, id: string): Promise<void> {
  await adminApiClient.patch(
    `/admin/assessments/${id}/unpublish`,
    () => undefined,
    { headers: { authorization: `Bearer ${token}` } },
  );
}

export { AdminApiClientError };
