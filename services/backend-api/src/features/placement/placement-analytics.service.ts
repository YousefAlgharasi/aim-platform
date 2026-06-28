// P19-008
// PlacementAnalyticsService.
//
// Scope: Placement Test analytics only.
//
// Responsibility:
//   Record placement lifecycle analytics events (reusing the existing
//   placement_audit_log table — see P4-025) and expose an admin-only
//   aggregate summary: completion rate, band distribution, per-section
//   accuracy, and drop-off count.
//
// Security rules:
//   - Analytics events must never include correct_answer, raw scoring
//     weights, or signal threshold values — only accuracy ratios and
//     backend-computed levels/bands.
//   - This service is read/write on placement_audit_log and aggregate-only
//     on placement_attempts/placement_answers/placement_results — it never
//     mutates scoring or result data.
//   - Recording is fire-and-forget: analytics failures must never block the
//     critical placement flow (start/answer/complete).
//   - The summary endpoint is admin-only — never exposed to students/parents.
//   - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
//   - No secrets, service-role keys, or privileged config here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

interface SectionCompletedEventData {
  readonly sectionId: string;
  readonly accuracy: number;
  readonly timeSpentSeconds: number;
}

interface AttemptCompletedAnalyticsEventData {
  readonly placementTestId: string;
  readonly estimatedLevel: string;
  readonly totalTimeSeconds: number;
}

interface AttemptStartedAnalyticsEventData {
  readonly placementTestId: string;
}

interface AttemptAbandonedAnalyticsEventData {
  readonly placementTestId: string;
}

export interface PlacementAnalyticsSummary {
  readonly totalAttempts: number;
  readonly completedAttempts: number;
  readonly completionRate: number;
  readonly dropOffCount: number;
  readonly bandDistribution: Record<string, number>;
  readonly sectionAccuracy: Array<{
    readonly skillCode: string;
    readonly averageAccuracy: number;
    readonly sampleSize: number;
  }>;
}

@Injectable()
export class PlacementAnalyticsService {
  private readonly logger = new Logger(PlacementAnalyticsService.name);

  constructor(private readonly db: DatabaseService) {}

  // ---------------------------------------------------------------------
  // Event recording — fire-and-forget, never throws to the caller.
  // ---------------------------------------------------------------------

  async recordAttemptStarted(
    studentId: string,
    attemptId: string,
    placementTestId: string,
  ): Promise<void> {
    await this.writeEvent('attempt_started', studentId, attemptId, {
      placementTestId,
    } satisfies AttemptStartedAnalyticsEventData);
  }

  async recordSectionCompleted(
    studentId: string,
    attemptId: string,
    sectionId: string,
    accuracy: number,
    timeSpentSeconds: number,
  ): Promise<void> {
    await this.writeEvent('section_completed', studentId, attemptId, {
      sectionId,
      accuracy,
      timeSpentSeconds,
    } satisfies SectionCompletedEventData);
  }

  async recordAttemptCompleted(
    studentId: string,
    attemptId: string,
    placementTestId: string,
    estimatedLevel: string,
    totalTimeSeconds: number,
  ): Promise<void> {
    await this.writeEvent('attempt_completed', studentId, attemptId, {
      placementTestId,
      estimatedLevel,
      totalTimeSeconds,
    } satisfies AttemptCompletedAnalyticsEventData);
  }

  async recordAttemptAbandoned(
    studentId: string,
    attemptId: string,
    placementTestId: string,
  ): Promise<void> {
    await this.writeEvent('attempt_abandoned', studentId, attemptId, {
      placementTestId,
    } satisfies AttemptAbandonedAnalyticsEventData);
  }

  private async writeEvent(
    eventType: 'attempt_started' | 'section_completed' | 'attempt_completed' | 'attempt_abandoned',
    studentId: string,
    attemptId: string,
    eventData: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO placement_audit_log (placement_attempt_id, student_id, event_type, event_data)
         VALUES ($1, $2, $3, $4)`,
        [attemptId, studentId, eventType, JSON.stringify(eventData)],
      );
    } catch (err) {
      this.logger.error(
        `PlacementAnalyticsService: failed to record event "${eventType}" for attempt ${attemptId}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  // ---------------------------------------------------------------------
  // Admin aggregate summary (read-only).
  // ---------------------------------------------------------------------

  async getSummary(): Promise<PlacementAnalyticsSummary> {
    const [attemptCounts, bandRows, sectionRows] = await Promise.all([
      this.db.query<{ total: string; completed: string }>(
        `SELECT
           COUNT(*)::text AS total,
           COUNT(*) FILTER (WHERE status = 'completed')::text AS completed
         FROM placement_attempts`,
      ),
      this.db.query<{ estimated_level: string; count: string }>(
        `SELECT estimated_level, COUNT(*)::text AS count
           FROM placement_results
          GROUP BY estimated_level`,
      ),
      this.db.query<{ skill_code: string; avg_accuracy: string; sample_size: string }>(
        `SELECT ps.skill_code,
                AVG(CASE WHEN pa.is_correct THEN 1.0 ELSE 0.0 END)::text AS avg_accuracy,
                COUNT(*)::text AS sample_size
           FROM placement_answers pa
           JOIN placement_questions pq ON pq.id = pa.placement_question_id
           JOIN placement_sections ps ON ps.id = pq.placement_section_id
          WHERE pa.is_correct IS NOT NULL
          GROUP BY ps.skill_code`,
      ),
    ]);

    const total = parseInt(attemptCounts.rows[0]?.total ?? '0', 10);
    const completed = parseInt(attemptCounts.rows[0]?.completed ?? '0', 10);

    const bandDistribution: Record<string, number> = {};
    for (const row of bandRows.rows) {
      bandDistribution[row.estimated_level] = parseInt(row.count, 10);
    }

    const sectionAccuracy = sectionRows.rows.map((row) => ({
      skillCode: row.skill_code,
      averageAccuracy: parseFloat(parseFloat(row.avg_accuracy).toFixed(4)),
      sampleSize: parseInt(row.sample_size, 10),
    }));

    return {
      totalAttempts: total,
      completedAttempts: completed,
      completionRate: total > 0 ? parseFloat((completed / total).toFixed(4)) : 0,
      dropOffCount: total - completed,
      bandDistribution,
      sectionAccuracy,
    };
  }
}
