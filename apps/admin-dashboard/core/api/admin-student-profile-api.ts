// Admin student profile API client (read-only).
// Consumes GET /admin/students/:id/profile — see
// services/backend-api/src/features/admin/users/admin-student-profile.service.ts
// for the authoritative response shape. All figures (completion %, scores,
// signals) are backend-computed; this client only decodes, never derives.
import { adminApiClient } from './admin-api-client';

export type AdminStudentProfileSkillSignal = 'strong' | 'developing' | 'emerging';

export type AdminStudentProfileSkillSummary = {
  readonly skillCode: string;
  readonly signal: AdminStudentProfileSkillSignal;
};

export type AdminStudentProfilePlacement = {
  readonly estimatedLevel: string;
  readonly completedAt: string;
  readonly skillSummary: readonly AdminStudentProfileSkillSummary[];
};

export type AdminStudentProfileSubscription = {
  readonly planId: string;
  readonly status: string;
  readonly currentPeriodEnd: string | null;
};

export type AdminStudentProfileCourseAssessment = {
  readonly assessmentId: string;
  readonly title: string;
  readonly type: 'quiz' | 'exam';
  readonly score: number;
  readonly maxScore: number;
  readonly passed: boolean;
};

export type AdminStudentProfileCertificateRef = {
  readonly id: string;
  readonly issuedAt: string;
};

export type AdminStudentProfileCourse = {
  readonly enrollmentId: string;
  readonly courseId: string;
  readonly courseTitle: string;
  readonly enrollmentStatus: 'active' | 'switched';
  readonly enrolledAt: string;
  readonly completedLessons: number;
  readonly totalLessons: number;
  readonly completionPct: number;
  readonly completed: boolean;
  readonly assessments: readonly AdminStudentProfileCourseAssessment[];
  readonly certificate: AdminStudentProfileCertificateRef | null;
};

export type AdminStudentProfileWeakness = {
  readonly id: string;
  readonly skillId: string;
  readonly skillTitle: string | null;
  readonly severity: string;
  readonly status: string;
  readonly detectedAt: string;
  readonly resolvedAt: string | null;
};

export type AdminStudentProfileAiSession = {
  readonly id: string;
  readonly contextRef: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminStudentProfile = {
  readonly student: {
    readonly id: string;
    readonly email: string | null;
    readonly displayName: string | null;
    readonly status: string;
    readonly createdAt: string;
  };
  readonly placement: AdminStudentProfilePlacement | null;
  readonly subscription: AdminStudentProfileSubscription | null;
  readonly courses: readonly AdminStudentProfileCourse[];
  readonly weaknesses: readonly AdminStudentProfileWeakness[];
  readonly aiTeacherSessions: readonly AdminStudentProfileAiSession[];
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function decodeSkillSignal(raw: unknown): AdminStudentProfileSkillSignal {
  return raw === 'strong' || raw === 'developing' || raw === 'emerging' ? raw : 'emerging';
}

function decodeNumber(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return fallback;
}

function decodePlacement(raw: unknown): AdminStudentProfilePlacement | null {
  if (!isObject(raw)) return null;
  const rawSkills = Array.isArray(raw.skillSummary) ? raw.skillSummary : [];
  return {
    estimatedLevel: String(raw.estimatedLevel ?? ''),
    completedAt: String(raw.completedAt ?? ''),
    skillSummary: rawSkills.filter(isObject).map((s) => ({
      skillCode: String(s.skillCode ?? ''),
      signal: decodeSkillSignal(s.signal),
    })),
  };
}

function decodeSubscription(raw: unknown): AdminStudentProfileSubscription | null {
  if (!isObject(raw)) return null;
  return {
    planId: String(raw.planId ?? ''),
    status: String(raw.status ?? ''),
    currentPeriodEnd: typeof raw.currentPeriodEnd === 'string' ? raw.currentPeriodEnd : null,
  };
}

function decodeAssessment(raw: unknown): AdminStudentProfileCourseAssessment {
  const r = isObject(raw) ? raw : {};
  return {
    assessmentId: String(r.assessmentId ?? ''),
    title: String(r.title ?? ''),
    type: r.type === 'exam' ? 'exam' : 'quiz',
    score: decodeNumber(r.score),
    maxScore: decodeNumber(r.maxScore),
    passed: Boolean(r.passed),
  };
}

function decodeCertificateRef(raw: unknown): AdminStudentProfileCertificateRef | null {
  if (!isObject(raw)) return null;
  const id = raw.id;
  if (typeof id !== 'string' || id.length === 0) return null;
  return { id, issuedAt: String(raw.issuedAt ?? '') };
}

function decodeCourse(raw: unknown): AdminStudentProfileCourse {
  const r = isObject(raw) ? raw : {};
  const rawAssessments = Array.isArray(r.assessments) ? r.assessments : [];
  return {
    enrollmentId: String(r.enrollmentId ?? ''),
    courseId: String(r.courseId ?? ''),
    courseTitle: String(r.courseTitle ?? ''),
    enrollmentStatus: r.enrollmentStatus === 'switched' ? 'switched' : 'active',
    enrolledAt: String(r.enrolledAt ?? ''),
    completedLessons: decodeNumber(r.completedLessons),
    totalLessons: decodeNumber(r.totalLessons),
    completionPct: decodeNumber(r.completionPct),
    completed: Boolean(r.completed),
    assessments: rawAssessments.map(decodeAssessment),
    certificate: decodeCertificateRef(r.certificate),
  };
}

function decodeWeakness(raw: unknown): AdminStudentProfileWeakness {
  const r = isObject(raw) ? raw : {};
  return {
    id: String(r.id ?? ''),
    skillId: String(r.skillId ?? ''),
    skillTitle: typeof r.skillTitle === 'string' ? r.skillTitle : null,
    severity: String(r.severity ?? ''),
    status: String(r.status ?? ''),
    detectedAt: String(r.detectedAt ?? ''),
    resolvedAt: typeof r.resolvedAt === 'string' ? r.resolvedAt : null,
  };
}

function decodeAiSession(raw: unknown): AdminStudentProfileAiSession {
  const r = isObject(raw) ? raw : {};
  return {
    id: String(r.id ?? ''),
    contextRef: String(r.contextRef ?? ''),
    status: String(r.status ?? ''),
    createdAt: String(r.createdAt ?? ''),
    updatedAt: String(r.updatedAt ?? ''),
  };
}

function decodeStudentProfile(raw: unknown): AdminStudentProfile {
  const r = isObject(raw) ? raw : {};
  const studentRaw = isObject(r.student) ? r.student : {};
  const rawCourses = Array.isArray(r.courses) ? r.courses : [];
  const rawWeaknesses = Array.isArray(r.weaknesses) ? r.weaknesses : [];
  const rawSessions = Array.isArray(r.aiTeacherSessions) ? r.aiTeacherSessions : [];

  return {
    student: {
      id: String(studentRaw.id ?? ''),
      email: typeof studentRaw.email === 'string' ? studentRaw.email : null,
      displayName: typeof studentRaw.displayName === 'string' ? studentRaw.displayName : null,
      status: String(studentRaw.status ?? ''),
      createdAt: String(studentRaw.createdAt ?? ''),
    },
    placement: decodePlacement(r.placement),
    subscription: decodeSubscription(r.subscription),
    courses: rawCourses.map(decodeCourse),
    weaknesses: rawWeaknesses.map(decodeWeakness),
    aiTeacherSessions: rawSessions.map(decodeAiSession),
  };
}

export async function fetchAdminStudentProfile(
  token: string,
  studentId: string,
): Promise<AdminStudentProfile> {
  const envelope = await adminApiClient.get(
    `/admin/students/${studentId}/profile`,
    decodeStudentProfile,
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}
