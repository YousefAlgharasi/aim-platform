// Phase 5 — P5-058
// WeaknessUpdateService.
//
// Scope: Persist AIM Engine weakness outputs (severity, status,
//        trigger_attempt_ids, resolved_at) to the weakness_records table
//        (P5-036), per packages/shared-contracts/api/weakness-record-contracts.md
//        Update Rules.
//
// Responsibility:
//   Receives a validated AimValidatedWeaknessRecord[] array from the
//   pipeline orchestrator (P5-056) and inserts or updates one row per
//   weaknessId (the AIM-issued weakness instance id), per the contract's
//   five-step update rule:
//     1. Look up the existing row by id = weaknessId.
//     2. If no row exists, insert with detectedAt from the wire output,
//        triggerAttemptIds set to the wire output's list verbatim, and
//        createdAt = updatedAt = now().
//     3. If a row exists, append new triggerAttemptIds entries to the
//        stored list (deduplicated), update severity/status/resolvedAt
//        from the wire output, and set updatedAt = now(). detectedAt is
//        never changed once set.
//     4. (Transaction membership is the orchestrator's responsibility —
//        this service issues idempotent per-record statements that the
//        orchestrator wraps in its Stage 6 transaction.)
//     5. severity and status are never derived or inferred here — both
//        are exclusively AIM Engine outputs, copied verbatim.
//
// Backend authority rules enforced here:
//   - studentId is always sourced from the pipeline context (JWT-resolved),
//     never from a client payload.
//   - severity, status, and resolvedAt come exclusively from the validated
//     AIM Engine response (P5-048 mapped and validated before reaching
//     this service). This service never computes or infers them.
//   - detectedAt is set once (first persistence) and never changed.
//   - triggerAttemptIds accumulates (append + dedupe), never replaces,
//     preserving full evidence history for the weakness instance.
//   - No AIM Engine call is made here; features/aim/persistence never
//     talks to the AIM Engine. Only the adapter (P5-051) does.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AimValidatedWeaknessRecord } from '../adapter/aim-response-mapper.types';

// ---------------------------------------------------------------------------
// Internal row shape
// ---------------------------------------------------------------------------

interface WeaknessRecordCurrentRow {
  readonly trigger_attempt_ids: string[];
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class WeaknessUpdateService {
  private readonly logger = new Logger(WeaknessUpdateService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Persist validated weakness record updates from the AIM Engine.
   *
   * Each entry in weaknessRecords is inserted or updated in weakness_records
   * keyed by id = weaknessId, per the P5-013 contract's five-step update
   * rule. studentId must be JWT-resolved by the pipeline orchestrator —
   * never accepted from a client payload.
   *
   * Skips any entry where weaknessId or skillId is empty (defensive guard).
   */
  async upsertMany(
    studentId: string,
    weaknessRecords: AimValidatedWeaknessRecord[],
  ): Promise<void> {
    if (weaknessRecords.length === 0) return;

    for (const record of weaknessRecords) {
      if (!record.weaknessId || record.weaknessId.trim().length === 0) {
        this.logger.warn('weakness_update_skipped_empty_weakness_id', {
          studentId,
          skillId: record.skillId,
        });
        continue;
      }
      if (!record.skillId || record.skillId.trim().length === 0) {
        this.logger.warn('weakness_update_skipped_empty_skill_id', {
          studentId,
          weaknessId: record.weaknessId,
        });
        continue;
      }

      await this.upsertOne(studentId, record);
    }
  }

  // -------------------------------------------------------------------------
  // Private: insert or update a single weakness record
  // -------------------------------------------------------------------------

  private async upsertOne(
    studentId: string,
    record: AimValidatedWeaknessRecord,
  ): Promise<void> {
    // Step 1 — look up the existing row by id = weaknessId.
    const existing = await this.db.query<WeaknessRecordCurrentRow>(
      `SELECT trigger_attempt_ids
         FROM weakness_records
        WHERE id = $1
        LIMIT 1`,
      [record.weaknessId],
    );

    const rowExists = (existing.rowCount ?? 0) > 0;

    const mergedTriggerAttemptIds = rowExists
      ? this.mergeTriggerAttemptIds(
          existing.rows[0].trigger_attempt_ids,
          record.triggerAttemptIds,
        )
      : record.triggerAttemptIds;

    if (!rowExists) {
      // Step 2 — first detection: insert with detectedAt from the wire
      // output, trigger_attempt_ids set verbatim, created_at = updated_at = now().
      await this.db.query(
        `INSERT INTO weakness_records (
           id, student_id, skill_id,
           severity, status, trigger_attempt_ids,
           detected_at, resolved_at,
           created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, now(), now())`,
        [
          record.weaknessId,
          studentId,
          record.skillId,
          record.severity,
          record.status,
          JSON.stringify(mergedTriggerAttemptIds),
          record.detectedAt,
          record.resolvedAt,
        ],
      );

      this.logger.log('weakness_record_inserted', {
        studentId,
        weaknessId: record.weaknessId,
        skillId: record.skillId,
        severity: record.severity,
        status: record.status,
      });
      return;
    }

    // Step 3 — existing instance: append-dedupe trigger_attempt_ids,
    // update severity/status/resolved_at, set updated_at = now().
    // detected_at is never changed.
    await this.db.query(
      `UPDATE weakness_records
          SET severity             = $2,
              status                = $3,
              trigger_attempt_ids   = $4::jsonb,
              resolved_at           = $5,
              updated_at            = now()
        WHERE id = $1`,
      [
        record.weaknessId,
        record.severity,
        record.status,
        JSON.stringify(mergedTriggerAttemptIds),
        record.resolvedAt,
      ],
    );

    this.logger.log('weakness_record_updated', {
      studentId,
      weaknessId: record.weaknessId,
      skillId: record.skillId,
      severity: record.severity,
      status: record.status,
    });
  }

  /**
   * Append new trigger attempt ids to the existing stored list, deduplicated.
   * Order is preserved: existing ids first, then any genuinely new ids from
   * the latest wire output, in the order they appear there.
   */
  private mergeTriggerAttemptIds(
    existingIds: string[],
    incomingIds: string[],
  ): string[] {
    const seen = new Set(existingIds);
    const merged = [...existingIds];

    for (const id of incomingIds) {
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(id);
      }
    }

    return merged;
  }
}
