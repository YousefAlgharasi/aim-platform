// P20-023 — StudentAimProgressReportService.
//
// Scope: Assembles the 'student_aim_progress' report's result data by
// reading the authenticated student's own already-persisted AIM output —
// student_skill_states (mastery + trend per skill), weakness_records (open,
// plus recently resolved per P20-022), and review_schedules (upcoming due
// reviews). This is deliberately NOT built on the generic
// metric_aggregates/analytics_events mechanism ReportRunnerService uses for
// every other report: that mechanism computes platform-wide numeric time
// series from a background aggregation job, which has no notion of "this
// specific skill's mastery for this specific student" (a per-skill,
// per-student structured record, not a scalar aggregate). This is the
// smallest addition that fits the existing 'table'-typed ReportSection shape
// (already defined in analytics.entities.ts, just never populated by any
// report before this one).
//
// This service queries DatabaseService directly rather than depending on
// the existing AIM read services (StudentSkillStateReadService,
// WeaknessRecordsReadService, ReviewScheduleReadService) in
// features/aim/result/ — importing AimModule into AnalyticsModule was tried
// first and rejected: AimModule already imports NotificationsModule, which
// imports AnalyticsModule, so adding AnalyticsModule -> AimModule closes a
// module-graph cycle that required forwardRef() on AuthModule in three
// separate, otherwise-unrelated modules (aim.module.ts,
// notifications.module.ts, and here) to even boot — a correctness risk to
// the whole app's DI graph that isn't justified for three simple, read-only
// single-table SELECTs. The three queries below are intentionally identical
// in shape to the corresponding AIM read services' queries (same columns,
// same ordering) so this stays a faithful mirror, not a divergent
// reimplementation.
//
// Security: studentId is always the JWT-resolved requestedByUserId already
// authenticated as 'student' role by AnalyticsAccessGuard — the same
// identity StudentOwnershipGuard treats as the student id elsewhere in this
// codebase (JWT user.id IS the student_id, no separate mapping table).
// This service never accepts a client-supplied studentId.

import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../database/database.service';
import { ReportSection } from './analytics.entities';

export const STUDENT_AIM_PROGRESS_REPORT_KEY = 'student_aim_progress';

// A resolved weakness is still shown for this many days after resolving, so
// a student can see "you recently got past this" rather than it vanishing
// from the report the instant it resolves.
const RECENTLY_RESOLVED_WINDOW_DAYS = 14;

interface SkillStateRow {
  readonly skill_id: string;
  readonly mastery_score: string;
  readonly mastery_trend: string;
  readonly previous_mastery_score: string | null;
  readonly last_evaluated_at: string;
}

interface WeaknessRow {
  readonly skill_id: string;
  readonly severity: string;
  readonly status: string;
  readonly detected_at: string;
  readonly resolved_at: string | null;
}

interface ReviewScheduleRow {
  readonly skill_id: string;
  readonly due_at: string;
  readonly status: string;
  readonly repetition_count: number;
}

@Injectable()
export class StudentAimProgressReportService {
  constructor(private readonly db: DatabaseService) {}

  async buildSections(studentId: string): Promise<ReportSection[]> {
    const [skillStates, weaknesses, reviewSchedules] = await Promise.all([
      this.fetchSkillStates(studentId),
      this.fetchRelevantWeaknesses(studentId),
      this.fetchReviewSchedules(studentId),
    ]);

    const sections: ReportSection[] = [];

    if (skillStates.length > 0) {
      sections.push({
        title: 'Skill Mastery',
        type: 'table',
        data: skillStates.map((row) => ({
          skillId: row.skill_id,
          masteryScore: parseFloat(row.mastery_score),
          masteryTrend: row.mastery_trend,
          previousMasteryScore:
            row.previous_mastery_score !== null ? parseFloat(row.previous_mastery_score) : null,
          lastEvaluatedAt: row.last_evaluated_at,
        })),
      });
    }

    if (weaknesses.length > 0) {
      sections.push({
        title: 'Weaknesses',
        type: 'table',
        data: weaknesses.map((row) => ({
          skillId: row.skill_id,
          severity: row.severity,
          status: row.status,
          detectedAt: row.detected_at,
          resolvedAt: row.resolved_at,
        })),
      });
    }

    if (reviewSchedules.length > 0) {
      sections.push({
        title: 'Upcoming Reviews',
        type: 'table',
        data: reviewSchedules.map((row) => ({
          skillId: row.skill_id,
          dueAt: row.due_at,
          status: row.status,
          repetitionCount: row.repetition_count,
        })),
      });
    }

    return sections;
  }

  private async fetchSkillStates(studentId: string): Promise<SkillStateRow[]> {
    const result = await this.db.query<SkillStateRow>(
      `SELECT skill_id, mastery_score, mastery_trend, previous_mastery_score, last_evaluated_at
         FROM student_skill_states
        WHERE student_id = $1
        ORDER BY skill_id ASC`,
      [studentId],
    );
    return result.rows;
  }

  private async fetchRelevantWeaknesses(studentId: string): Promise<WeaknessRow[]> {
    const result = await this.db.query<WeaknessRow>(
      `SELECT skill_id, severity, status, detected_at, resolved_at
         FROM weakness_records
        WHERE student_id = $1
          AND (status <> 'resolved' OR resolved_at >= now() - make_interval(days => $2))
        ORDER BY (status = 'resolved') ASC, detected_at DESC`,
      [studentId, RECENTLY_RESOLVED_WINDOW_DAYS],
    );
    return result.rows;
  }

  private async fetchReviewSchedules(studentId: string): Promise<ReviewScheduleRow[]> {
    const result = await this.db.query<ReviewScheduleRow>(
      `SELECT skill_id, due_at, status, repetition_count
         FROM review_schedules
        WHERE student_id = $1
        ORDER BY due_at ASC`,
      [studentId],
    );
    return result.rows;
  }
}
