// Phase 5 — P5-070
// WeaknessRecordsReadService.
//
// Scope: Read-only backend service exposing persisted, backend-validated
//        weakness records from weakness_records (P5-036/P5-058).
//
// Security rules:
//   - studentId is always sourced from the verified JWT (controller layer).
//     Clients cannot supply a studentId to override ownership.
//   - Read-only. No AIM-owned value may be written through this path.
//   - This service never proxies a live AIM Engine call; it returns only
//     last-validated-persisted values.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

// ---------------------------------------------------------------------------
// Response types (safe, client-facing subset of weakness_records)
// ---------------------------------------------------------------------------

export interface WeaknessRecordEntry {
  readonly weaknessId: string;
  readonly skillId: string;
  readonly severity: string;
  readonly status: string;
  readonly triggerAttemptIds: string[];
  readonly detectedAt: string;
  readonly resolvedAt: string | null;
  readonly updatedAt: string;
}

export interface WeaknessRecordsReadResponse {
  readonly studentId: string;
  readonly weaknessRecords: WeaknessRecordEntry[];
}

// ---------------------------------------------------------------------------
// Internal DB row shape
// ---------------------------------------------------------------------------

interface WeaknessRecordRow {
  readonly id: string;
  readonly skill_id: string;
  readonly severity: string;
  readonly status: string;
  readonly trigger_attempt_ids: string[];
  readonly detected_at: string;
  readonly resolved_at: string | null;
  readonly updated_at: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class WeaknessRecordsReadService {
  private readonly logger = new Logger(WeaknessRecordsReadService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Return all persisted weakness records for a student, ordered with
   * open/improving instances first (most actionable), then by most
   * recently detected.
   *
   * Returns only backend-validated, AIM-persisted values. No AIM Engine
   * call is made. If no rows exist for the student, returns an empty array.
   *
   * studentId must be JWT-resolved by the controller — never client-supplied.
   */
  async getWeaknessRecordsForStudent(
    studentId: string,
  ): Promise<WeaknessRecordsReadResponse> {
    const result = await this.db.query<WeaknessRecordRow>(
      `SELECT
         id,
         skill_id,
         severity,
         status,
         trigger_attempt_ids,
         detected_at,
         resolved_at,
         updated_at
       FROM weakness_records
       WHERE student_id = $1
       ORDER BY
         (status = 'resolved') ASC,
         detected_at DESC`,
      [studentId],
    );

    const weaknessRecords: WeaknessRecordEntry[] = result.rows.map((row) => ({
      weaknessId: row.id,
      skillId: row.skill_id,
      severity: row.severity,
      status: row.status,
      triggerAttemptIds: row.trigger_attempt_ids,
      detectedAt: row.detected_at,
      resolvedAt: row.resolved_at,
      updatedAt: row.updated_at,
    }));

    this.logger.debug('weakness_records_read', {
      studentId,
      count: weaknessRecords.length,
    });

    return { studentId, weaknessRecords };
  }
}
