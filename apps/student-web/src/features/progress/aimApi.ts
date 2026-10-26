import { apiClient } from '../../api/client';
import { t, formatDate as formatLocaleDate, plural } from '../../i18n';

// Read-only AIM outputs. Mirrors Flutter features/aim_results (+ home datasource).
// Backend: services/backend-api/src/features/aim/result/aim-result.controller.ts.
//
// studentId: StudentOwnershipGuard compares the :studentId param with the
// verified JWT user id (Supabase auth uid). Flutter passes
// `authContext.user.id` from GET /auth/me, which is that same uid — on the web
// this is `useAuth().user.id` (NOT studentProfileId).

export interface SkillStateEntry {
  skillId: string;
  masteryScore: number; // 0..1
  masteryConfidence: number; // 0..1
  masteryTrend: string; // improving | declining | stable | insufficient_data
  previousMasteryScore: number | null;
  lastAttemptId: string;
  lastEvaluatedAt: string;
  updatedAt: string;
}

export interface WeaknessRecordEntry {
  weaknessId: string;
  skillId: string;
  severity: string; // emerging | developing | critical
  status: string;
  triggerAttemptIds: string[];
  detectedAt: string;
  resolvedAt: string | null;
  updatedAt: string;
}

export interface ReviewScheduleEntry {
  scheduleId: string;
  skillId: string;
  dueAt: string;
  intervalDays: number;
  repetitionCount: number;
  status: string; // pending | due | completed | rescheduled
  basedOnAttemptId: string;
  scheduledAt: string;
  updatedAt: string;
}

export interface RecommendationEntry {
  id: string;
  kind: string;
  targetSkillId: string;
  targetLessonId: string | null;
  rank: number;
  reason: string;
  basedOnWeaknessId: string | null;
  generatedAt: string;
  expiresAt: string | null;
  status: string;
  updatedAt: string;
}

const base = (studentId: string) => `/aim/students/${encodeURIComponent(studentId)}`;

export async function fetchSkillStates(studentId: string): Promise<SkillStateEntry[]> {
  const data = await apiClient.get<{ skillStates?: SkillStateEntry[] } | null>(`${base(studentId)}/skill-states`);
  return data?.skillStates ?? [];
}

export async function fetchWeaknessRecords(studentId: string): Promise<WeaknessRecordEntry[]> {
  const data = await apiClient.get<{ weaknessRecords?: WeaknessRecordEntry[] } | null>(`${base(studentId)}/weakness-records`);
  return data?.weaknessRecords ?? [];
}

export async function fetchReviewSchedules(studentId: string): Promise<ReviewScheduleEntry[]> {
  const data = await apiClient.get<{ reviewSchedules?: ReviewScheduleEntry[] } | null>(`${base(studentId)}/review-schedules`);
  return data?.reviewSchedules ?? [];
}

export async function fetchRecommendations(studentId: string): Promise<RecommendationEntry[]> {
  const data = await apiClient.get<{ recommendations?: RecommendationEntry[] } | null>(`${base(studentId)}/recommendations`);
  return data?.recommendations ?? [];
}

export interface AimResults {
  skillStates: SkillStateEntry[];
  weaknessRecords: WeaknessRecordEntry[];
  reviewSchedules: ReviewScheduleEntry[];
  recommendations: RecommendationEntry[];
}

/** All four AIM read endpoints in parallel (Flutter AimResultsNotifier.load). */
export async function fetchAimResults(studentId: string): Promise<AimResults> {
  const [skillStates, weaknessRecords, reviewSchedules, recommendations] = await Promise.all([
    fetchSkillStates(studentId),
    fetchWeaknessRecords(studentId),
    fetchReviewSchedules(studentId),
    fetchRecommendations(studentId),
  ]);
  return { skillStates, weaknessRecords, reviewSchedules, recommendations };
}

// ── Display helpers (pure formatting; no AIM values are computed) ──────────

/**
 * Readable label for a raw skillId slug (e.g. "skill:arabic:p1:vocab" →
 * "Vocab"). Same transform as Flutter `_prettifySkillId`; the backend
 * exposes no skill display name on these endpoints.
 */
export function prettifySkillId(skillId: string): string {
  const last = skillId.split(':').pop() ?? '';
  const label = last
    .split(/[_-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  return label ? t(label) : skillId;
}

export function toPercent(score: number | null | undefined): number {
  if (score == null || Number.isNaN(score)) return 0;
  return Math.round(Math.min(Math.max(score, 0), 1) * 100);
}

/** Mastery tier thresholds used by Flutter SkillStatePage for display badges. */
export function masteryTier(score: number): 'strong' | 'developing' | 'needsWork' {
  if (score >= 0.8) return 'strong';
  if (score >= 0.5) return 'developing';
  return 'needsWork';
}

/** English keys; translate with `t(tierLabel[tier])` when rendering. */
export const tierLabel: Record<ReturnType<typeof masteryTier>, string> = {
  strong: 'Strong',
  developing: 'Developing',
  needsWork: 'Needs work',
};

export function trendLabel(trend: string): string {
  switch (trend) {
    case 'improving':
      return t('Improving');
    case 'declining':
      return t('Declining');
    case 'stable':
      return t('Stable');
    default:
      return t('Not enough data');
  }
}

export function humanize(value: string): string {
  if (!value) return '—';
  const s = value.replace(/_/g, ' ');
  return t(s[0].toUpperCase() + s.slice(1));
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : formatLocaleDate(d, { year: 'numeric', month: 'numeric', day: 'numeric' });
}

/** Relative due label (Flutter ReviewSchedulePage._dueLabel). */
export function dueLabel(iso: string): string {
  const due = new Date(iso);
  if (Number.isNaN(due.getTime())) return t('Due {date}', { date: iso });
  const now = new Date();
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((startOf(due) - startOf(now)) / 86_400_000);
  if (diff === 0) return t('Due today');
  if (diff === 1) return t('Due tomorrow');
  if (diff > 1) {
    return plural(diff, {
      one: t('Due in {n} days', { n: diff }),
      two: t('Due in {n} days [two]', { n: diff }),
      few: t('Due in {n} days [few]', { n: diff }),
      other: t('Due in {n} days', { n: diff }),
    });
  }
  if (diff === -1) return t('Due 1 day ago');
  if (diff > -7) {
    const n = -diff;
    return plural(n, {
      one: t('Due {n} days ago', { n }),
      two: t('Due {n} days ago [two]', { n }),
      few: t('Due {n} days ago [few]', { n }),
      other: t('Due {n} days ago', { n }),
    });
  }
  return t('Due {date}', { date: formatLocaleDate(due, { month: 'short', day: 'numeric' }) });
}

export function formatInterval(days: number): string {
  if (!Number.isFinite(days)) return '—';
  if (days < 1) {
    const hours = Math.max(1, Math.round(days * 24));
    return plural(hours, {
      one: t('{n} hour', { n: hours }),
      two: t('{n} hours [two]', { n: hours }),
      few: t('{n} hours [few]', { n: hours }),
      other: t('{n} hours', { n: hours }),
    });
  }
  const d = Math.round(days * 10) / 10;
  return plural(d, {
    one: t('{n} day', { n: d }),
    two: t('{n} days [two]', { n: d }),
    few: t('{n} days [few]', { n: d }),
    other: t('{n} days', { n: d }),
  });
}
