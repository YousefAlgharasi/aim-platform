// Admin student practice report API client (read-only).
// Consumes GET /admin/students/:id/practice-report — see
// services/backend-api/src/features/admin/users/admin-student-practice-report.service.ts.
// Right/wrong counts are backend-graded and mastery is the AIM Engine's output;
// this client only decodes, never derives.
import { adminApiClient } from './admin-api-client';

export type PracticeReportSession = {
  sessionId: string;
  sessionType: string;
  skillFocus: string[];
  startedAt: string;
  attempts: number;
  correct: number;
  wrong: number;
};

export type PracticeReportSkill = {
  skillKey: string;
  title: string | null;
  masteryPercent: number | null;
  previousMasteryPercent: number | null;
  trend: string | null;
  attempts: number;
  correct: number;
  wrong: number;
};

export type PracticeReportDirective = {
  skillKey: string;
  text: string;
  source: string;
  generatedAt: string;
  active: boolean;
};

export type AdminStudentPracticeReport = {
  totals: { sessions: number; attempts: number; correct: number; wrong: number; accuracyPercent: number };
  sessions: PracticeReportSession[];
  skills: PracticeReportSkill[];
  focusDirectives: PracticeReportDirective[];
};

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const numOrNull = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function decodeReport(raw: unknown): AdminStudentPracticeReport {
  const r = isObject(raw) ? raw : {};
  const t = isObject(r.totals) ? r.totals : {};
  return {
    totals: {
      sessions: num(t.sessions),
      attempts: num(t.attempts),
      correct: num(t.correct),
      wrong: num(t.wrong),
      accuracyPercent: num(t.accuracyPercent),
    },
    sessions: list(r.sessions).filter(isObject).map((s) => ({
      sessionId: String(s.sessionId ?? ''),
      sessionType: String(s.sessionType ?? ''),
      skillFocus: list(s.skillFocus).map(String),
      startedAt: String(s.startedAt ?? ''),
      attempts: num(s.attempts),
      correct: num(s.correct),
      wrong: num(s.wrong),
    })),
    skills: list(r.skills).filter(isObject).map((s) => ({
      skillKey: String(s.skillKey ?? ''),
      title: typeof s.title === 'string' ? s.title : null,
      masteryPercent: numOrNull(s.masteryPercent),
      previousMasteryPercent: numOrNull(s.previousMasteryPercent),
      trend: typeof s.trend === 'string' ? s.trend : null,
      attempts: num(s.attempts),
      correct: num(s.correct),
      wrong: num(s.wrong),
    })),
    focusDirectives: list(r.focusDirectives).filter(isObject).map((d) => ({
      skillKey: String(d.skillKey ?? ''),
      text: String(d.text ?? ''),
      source: String(d.source ?? ''),
      generatedAt: String(d.generatedAt ?? ''),
      active: d.active === true,
    })),
  };
}

export async function fetchAdminStudentPracticeReport(
  token: string,
  studentId: string,
): Promise<AdminStudentPracticeReport> {
  const envelope = await adminApiClient.get(
    `/admin/students/${studentId}/practice-report`,
    decodeReport,
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}
