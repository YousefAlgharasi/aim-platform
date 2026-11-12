// DueReviewsReadService.
//
// Scope: Read-only. The reviews a student should do right now, limited to
//        skills they are actually weak at, each with the lesson to practise.
//
// A review is listed only when ALL of these hold:
//   - it is due (due_at has passed) and not completed or cancelled, and
//   - the skill is a weak one: it has an open/improving weakness record, or
//     the student's mastery of it is below WEAK_MASTERY_THRESHOLD.
// Skills the student already knows well are not listed, however many reviews
// are scheduled for them.
//
// Security rules:
//   - studentId is always sourced from the verified JWT (controller layer).
//   - Read-only. Nothing AIM-owned (mastery, weakness, schedule) is written.
//   - No AIM Engine call is made; only persisted, validated values are read.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

/** Same cut-off the Improve screen uses for "weak" when no weakness record exists. */
export const WEAK_MASTERY_THRESHOLD = 0.5;

export interface DueReviewEntry {
  readonly scheduleId: string;
  readonly skillId: string;
  /** Readable skill title from the catalogue; null when the skill is not in it. */
  readonly skillTitle: string | null;
  readonly dueAt: string;
  /** 'critical' | 'developing' | 'emerging' from the open weakness record, or null. */
  readonly severity: string | null;
  readonly masteryScore: number | null;
  /** A published lesson that teaches this skill, to practise it. Null if none. */
  readonly lessonId: string | null;
  readonly lessonTitle: string | null;
}

export interface DueReviewsReadResponse {
  readonly studentId: string;
  readonly dueReviews: DueReviewEntry[];
}

interface DueReviewRow {
  readonly id: string;
  readonly skill_id: string;
  readonly skill_title: string | null;
  readonly due_at: string;
  readonly severity: string | null;
  readonly mastery_score: string | null;
  readonly lesson_id: string | null;
  readonly lesson_title: string | null;
}

@Injectable()
export class DueReviewsReadService {
  private readonly logger = new Logger(DueReviewsReadService.name);

  constructor(private readonly db: DatabaseService) {}

  async getDueReviewsForStudent(studentId: string): Promise<DueReviewsReadResponse> {
    const result = await this.db.query<DueReviewRow>(
      `WITH due AS (
         -- One review per skill: the most overdue one that is still open.
         SELECT DISTINCT ON (rs.skill_id)
                rs.id, rs.skill_id, rs.due_at
           FROM review_schedules rs
          WHERE rs.student_id = $1
            AND rs.status NOT IN ('completed', 'cancelled', 'skipped')
            AND rs.due_at <= now()
          ORDER BY rs.skill_id, rs.due_at ASC
       ),
       weak AS (
         SELECT DISTINCT ON (wr.skill_id)
                wr.skill_id, wr.severity
           FROM weakness_records wr
          WHERE wr.student_id = $1
            AND wr.status IN ('open', 'improving')
          ORDER BY wr.skill_id,
                   CASE wr.severity WHEN 'critical' THEN 0 WHEN 'developing' THEN 1 ELSE 2 END,
                   wr.detected_at DESC
       )
       SELECT d.id, d.skill_id, d.due_at,
              sk.title AS skill_title,
              w.severity,
              ss.mastery_score,
              ls.lesson_id,
              ls.lesson_title
         FROM due d
         LEFT JOIN weak w ON w.skill_id = d.skill_id
         LEFT JOIN student_skill_states ss
                ON ss.student_id = $1 AND ss.skill_id = d.skill_id
         LEFT JOIN skills sk ON sk.key = d.skill_id
         LEFT JOIN LATERAL (
              SELECT l.id AS lesson_id, l.title AS lesson_title
                FROM lesson_skills lsk
                JOIN lessons l ON l.id = lsk.lesson_id AND l.status = 'published'
               WHERE lsk.skill_id = sk.id
               ORDER BY l.sort_order ASC, l.created_at ASC
               LIMIT 1
         ) ls ON TRUE
        WHERE w.skill_id IS NOT NULL
           OR ss.mastery_score < $2
        ORDER BY (w.severity = 'critical') DESC NULLS LAST, d.due_at ASC
        LIMIT 50`,
      [studentId, WEAK_MASTERY_THRESHOLD],
    );

    const dueReviews: DueReviewEntry[] = result.rows.map((row) => ({
      scheduleId: row.id,
      skillId: row.skill_id,
      skillTitle: row.skill_title,
      dueAt: row.due_at,
      severity: row.severity,
      masteryScore: row.mastery_score === null ? null : parseFloat(row.mastery_score),
      lessonId: row.lesson_id,
      lessonTitle: row.lesson_title,
    }));

    this.logger.debug('due_reviews_read', { studentId, count: dueReviews.length });

    return { studentId, dueReviews };
  }
}
