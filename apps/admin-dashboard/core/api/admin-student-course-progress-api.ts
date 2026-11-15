// Admin per-course student progress API client (read-only).
// Consumes GET /admin/students/:id/course-progress — see
// services/backend-api/src/features/admin/users/admin-student-course-progress.service.ts.
// All numbers are backend-computed; this client only decodes, never derives.
import { adminApiClient } from './admin-api-client';

export type PracticeCounts = { attempts: number; correct: number; wrong: number; accuracyPercent: number | null };
export type CourseProgressLesson = {
  lessonId: string; title: string; sortOrder: number; completed: boolean; percent: number;
  startedAt: string | null; completedAt: string | null; lastActiveAt: string | null;
  practice: PracticeCounts & { lastPracticedAt: string | null };
};
export type CourseProgressChapter = {
  chapterId: string; title: string; levelTitle: string; completedLessons: number; totalLessons: number; lessons: CourseProgressLesson[];
};
export type CourseProgressCourse = {
  courseId: string; title: string; enrollmentStatus: string; enrolledAt: string;
  completedLessons: number; totalLessons: number; completionPct: number; lastActiveAt: string | null;
  practice: PracticeCounts;
  chapters: CourseProgressChapter[];
  assessments: { assessmentId: string; title: string; type: string; scorePercent: number; passed: boolean }[];
  certificate: { id: string; issuedAt: string; totalPoints: number | null; maxPoints: number | null } | null;
};
export type AdminStudentCourseProgress = {
  courses: CourseProgressCourse[];
  otherPractice: PracticeCounts;
  speakingWriting: { id: string; kind: string; levelCode: string | null; status: string; score: number | null; xpAwarded: number; startedAt: string; completedAt: string | null }[];
  mistakes: { open: number; resolved: number; topOpenSkills: { skillKey: string; title: string | null; count: number }[] };
  achievements: { key: string; title: string; unlockedAt: string }[];
  levelState: { track: string; currentRank: number; maxUnlockedRank: number }[];
  xpTotal: number;
};

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const numOrNull = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const strOrNull = (v: unknown): string | null => (typeof v === 'string' ? v : null);
const list = (v: unknown): Record<string, unknown>[] => (Array.isArray(v) ? v.filter(isObject) : []);

const counts = (v: unknown): PracticeCounts => {
  const o = isObject(v) ? v : {};
  return { attempts: num(o.attempts), correct: num(o.correct), wrong: num(o.wrong), accuracyPercent: numOrNull(o.accuracyPercent) };
};

function decode(raw: unknown): AdminStudentCourseProgress {
  const r = isObject(raw) ? raw : {};
  const m = isObject(r.mistakes) ? r.mistakes : {};
  return {
    courses: list(r.courses).map((c) => ({
      courseId: String(c.courseId ?? ''), title: String(c.title ?? ''), enrollmentStatus: String(c.enrollmentStatus ?? ''),
      enrolledAt: String(c.enrolledAt ?? ''), completedLessons: num(c.completedLessons), totalLessons: num(c.totalLessons),
      completionPct: num(c.completionPct), lastActiveAt: strOrNull(c.lastActiveAt), practice: counts(c.practice),
      chapters: list(c.chapters).map((ch) => ({
        chapterId: String(ch.chapterId ?? ''), title: String(ch.title ?? ''), levelTitle: String(ch.levelTitle ?? ''),
        completedLessons: num(ch.completedLessons), totalLessons: num(ch.totalLessons),
        lessons: list(ch.lessons).map((l) => {
          const p = isObject(l.practice) ? l.practice : {};
          return {
            lessonId: String(l.lessonId ?? ''), title: String(l.title ?? ''), sortOrder: num(l.sortOrder), completed: l.completed === true,
            percent: num(l.percent), startedAt: strOrNull(l.startedAt), completedAt: strOrNull(l.completedAt), lastActiveAt: strOrNull(l.lastActiveAt),
            practice: { ...counts(p), lastPracticedAt: strOrNull(p.lastPracticedAt) },
          };
        }),
      })),
      assessments: list(c.assessments).map((a) => ({
        assessmentId: String(a.assessmentId ?? ''), title: String(a.title ?? ''), type: String(a.type ?? ''),
        scorePercent: num(a.scorePercent), passed: a.passed === true,
      })),
      certificate: isObject(c.certificate)
        ? { id: String(c.certificate.id ?? ''), issuedAt: String(c.certificate.issuedAt ?? ''), totalPoints: numOrNull(c.certificate.totalPoints), maxPoints: numOrNull(c.certificate.maxPoints) }
        : null,
    })),
    otherPractice: counts(r.otherPractice),
    speakingWriting: list(r.speakingWriting).map((s) => ({
      id: String(s.id ?? ''), kind: String(s.kind ?? ''), levelCode: strOrNull(s.levelCode), status: String(s.status ?? ''),
      score: numOrNull(s.score), xpAwarded: num(s.xpAwarded), startedAt: String(s.startedAt ?? ''), completedAt: strOrNull(s.completedAt),
    })),
    mistakes: {
      open: num(m.open), resolved: num(m.resolved),
      topOpenSkills: list(m.topOpenSkills).map((s) => ({ skillKey: String(s.skillKey ?? ''), title: strOrNull(s.title), count: num(s.count) })),
    },
    achievements: list(r.achievements).map((a) => ({ key: String(a.key ?? ''), title: String(a.title ?? ''), unlockedAt: String(a.unlockedAt ?? '') })),
    levelState: list(r.levelState).map((l) => ({ track: String(l.track ?? ''), currentRank: num(l.currentRank), maxUnlockedRank: num(l.maxUnlockedRank) })),
    xpTotal: num(r.xpTotal),
  };
}

export async function fetchAdminStudentCourseProgress(token: string, studentId: string): Promise<AdminStudentCourseProgress> {
  const envelope = await adminApiClient.get(`/admin/students/${studentId}/course-progress`, decode, {
    headers: { authorization: `Bearer ${token}` },
  });
  return envelope.data;
}
