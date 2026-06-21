// P11-010: Admin reports API client (read-only)
// All report metrics are backend-computed. UI displays only.
import { adminApiClient } from './admin-api-client';

export type AdminEnrollmentReport = {
  readonly totalEnrollments: number;
  readonly newEnrollments: number;
  readonly activeCourses: number;
  readonly period: string;
};

export type AdminAssessmentReport = {
  readonly totalAttempts: number;
  readonly passed: number;
  readonly failed: number;
  readonly avgScore: number;   // backend-computed — never recalculated here
  readonly period: string;
};

export type AdminActiveUsersReport = {
  readonly dailyActiveUsers: number;
  readonly weeklyActiveUsers: number;
  readonly monthlyActiveUsers: number;
  readonly period: string;
};

type DateRange = { from?: string; to?: string };

function decodeEnrollmentReport(v: unknown): AdminEnrollmentReport {
  const o = v as Record<string, unknown>;
  return {
    totalEnrollments: typeof o.totalEnrollments === 'number' ? o.totalEnrollments : 0,
    newEnrollments:   typeof o.newEnrollments   === 'number' ? o.newEnrollments   : 0,
    activeCourses:    typeof o.activeCourses     === 'number' ? o.activeCourses    : 0,
    period:           String(o.period ?? ''),
  };
}

function decodeAssessmentReport(v: unknown): AdminAssessmentReport {
  const o = v as Record<string, unknown>;
  return {
    totalAttempts: typeof o.totalAttempts === 'number' ? o.totalAttempts : 0,
    passed:        typeof o.passed        === 'number' ? o.passed        : 0,
    failed:        typeof o.failed        === 'number' ? o.failed        : 0,
    avgScore:      typeof o.avgScore      === 'number' ? o.avgScore      : 0,
    period:        String(o.period ?? ''),
  };
}

function decodeActiveUsersReport(v: unknown): AdminActiveUsersReport {
  const o = v as Record<string, unknown>;
  return {
    dailyActiveUsers:   typeof o.dailyActiveUsers   === 'number' ? o.dailyActiveUsers   : 0,
    weeklyActiveUsers:  typeof o.weeklyActiveUsers  === 'number' ? o.weeklyActiveUsers  : 0,
    monthlyActiveUsers: typeof o.monthlyActiveUsers === 'number' ? o.monthlyActiveUsers : 0,
    period: String(o.period ?? ''),
  };
}

export async function fetchEnrollmentReport(
  token: string,
  range?: DateRange,
): Promise<AdminEnrollmentReport> {
  const envelope = await adminApiClient.get(
    '/admin/reports/enrollments',
    decodeEnrollmentReport,
    { headers: { authorization: `Bearer ${token}` }, query: range },
  );
  return envelope.data;
}

export async function fetchAssessmentReport(
  token: string,
  range?: DateRange,
): Promise<AdminAssessmentReport> {
  const envelope = await adminApiClient.get(
    '/admin/reports/assessments',
    decodeAssessmentReport,
    { headers: { authorization: `Bearer ${token}` }, query: range },
  );
  return envelope.data;
}

export async function fetchActiveUsersReport(
  token: string,
  range?: DateRange,
): Promise<AdminActiveUsersReport> {
  const envelope = await adminApiClient.get(
    '/admin/reports/active-users',
    decodeActiveUsersReport,
    { headers: { authorization: `Bearer ${token}` }, query: range },
  );
  return envelope.data;
}
