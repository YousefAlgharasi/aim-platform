// Admin certificate API client (read-only).
// Consumes GET /admin/certificates/:id — see
// services/backend-api/src/features/certificates/certificate.controller.ts
// and certificate.types.ts for the authoritative response shape.
import { adminApiClient } from './admin-api-client';

export type AdminCertificateScoreSnapshotEntry = {
  readonly assessmentId: string;
  readonly title: string;
  readonly type: 'quiz' | 'exam';
  readonly score: number;
  readonly maxScore: number;
  readonly scorePercent: number;
  readonly passed: boolean;
};

export type AdminCertificate = {
  readonly id: string;
  readonly studentId: string;
  readonly courseId: string;
  readonly courseTitle: string;
  readonly studentName: string | null;
  readonly issuedAt: string;
  readonly scoreSnapshot: readonly AdminCertificateScoreSnapshotEntry[];
  readonly overallScorePercent: number | null;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function decodeNumber(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return fallback;
}

// Falls back to computing score/maxScore*100 for older certificates issued
// before the backend started sending scorePercent directly.
function decodeScorePercent(v: unknown, score: number, maxScore: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

function decodeScoreEntry(raw: unknown): AdminCertificateScoreSnapshotEntry {
  const r = isObject(raw) ? raw : {};
  const score = decodeNumber(r.score);
  const maxScore = decodeNumber(r.maxScore);
  return {
    assessmentId: String(r.assessmentId ?? ''),
    title: String(r.title ?? ''),
    type: r.type === 'exam' ? 'exam' : 'quiz',
    score,
    maxScore,
    scorePercent: decodeScorePercent(r.scorePercent, score, maxScore),
    passed: Boolean(r.passed),
  };
}

function decodeCertificate(raw: unknown): AdminCertificate {
  const r = isObject(raw) ? raw : {};
  const rawSnapshot = Array.isArray(r.scoreSnapshot) ? r.scoreSnapshot : [];
  return {
    id: String(r.id ?? ''),
    studentId: String(r.studentId ?? ''),
    courseId: String(r.courseId ?? ''),
    courseTitle: String(r.courseTitle ?? ''),
    studentName: typeof r.studentName === 'string' ? r.studentName : null,
    issuedAt: String(r.issuedAt ?? ''),
    scoreSnapshot: rawSnapshot.map(decodeScoreEntry),
    overallScorePercent: typeof r.overallScorePercent === 'number' ? r.overallScorePercent : null,
  };
}

export async function fetchAdminCertificate(
  token: string,
  certificateId: string,
): Promise<AdminCertificate> {
  const envelope = await adminApiClient.get(
    `/admin/certificates/${certificateId}`,
    decodeCertificate,
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}
