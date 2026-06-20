// P11-010: Admin deadlines API client
// Backend is final authority for deadline enforcement, late/expired status.
import { adminApiClient } from './admin-api-client';
import { decodePaginatedResponse, type AdminPaginatedResponse } from './admin-paginated-response';

export type AdminDeadlineItem = {
  readonly id: string;
  readonly assessmentId: string;
  readonly dueAt: string;
  readonly courseId: string | null;
  readonly chapterId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

function decodeDeadline(v: unknown): AdminDeadlineItem {
  const o = v as Record<string, unknown>;
  return {
    id:           String(o.id ?? ''),
    assessmentId: String(o.assessmentId ?? ''),
    dueAt:        String(o.dueAt ?? ''),
    courseId:     typeof o.courseId === 'string' ? o.courseId : null,
    chapterId:    typeof o.chapterId === 'string' ? o.chapterId : null,
    createdAt:    String(o.createdAt ?? ''),
    updatedAt:    String(o.updatedAt ?? ''),
  };
}

export async function fetchAdminDeadlines(
  token: string,
  page = 1,
  limit = 20,
): Promise<AdminPaginatedResponse<AdminDeadlineItem>> {
  const envelope = await adminApiClient.get(
    '/admin/deadlines',
    (v) => decodePaginatedResponse(v, decodeDeadline),
    { headers: { authorization: `Bearer ${token}` }, query: { page, limit } },
  );
  return envelope.data;
}

export async function fetchAdminDeadlineDetail(
  token: string,
  id: string,
): Promise<AdminDeadlineItem> {
  const envelope = await adminApiClient.get(
    `/admin/deadlines/${id}`,
    decodeDeadline,
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}

export type CreateDeadlineBody = {
  assessmentId: string;
  dueAt: string;
  courseId?: string;
  chapterId?: string;
};

export async function createAdminDeadline(
  token: string,
  body: CreateDeadlineBody,
): Promise<AdminDeadlineItem> {
  const envelope = await adminApiClient.post(
    '/admin/deadlines',
    decodeDeadline,
    { headers: { authorization: `Bearer ${token}` }, body },
  );
  return envelope.data;
}

export async function updateAdminDeadline(
  token: string,
  id: string,
  body: Partial<CreateDeadlineBody>,
): Promise<AdminDeadlineItem> {
  const envelope = await adminApiClient.patch(
    `/admin/deadlines/${id}`,
    decodeDeadline,
    { headers: { authorization: `Bearer ${token}` }, body },
  );
  return envelope.data;
}
