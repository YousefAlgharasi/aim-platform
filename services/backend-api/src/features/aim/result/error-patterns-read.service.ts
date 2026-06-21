// Phase 5 — P5-035 (error_patterns table)
// ErrorPatternsReadService.
//
// Scope: Read-only backend service exposing persisted, backend-classified
//        error pattern records from error_patterns (P5-035), which
//        aggregate evidence from mistakes (P5-034) into recurring,
//        backend-classified error types per (student, skill).
//
// Security rules:
//   - studentId is always sourced from the verified JWT (controller layer).
//     Clients cannot supply a studentId to override ownership.
//   - Read-only. No AIM-owned or backend-classified value may be written
//     through this path.
//   - This service never proxies a live AIM Engine call; it returns only
//     last-validated-persisted values.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

export interface ErrorPatternEntry {
  readonly patternId: string;
  readonly skillId: string;
  readonly patternType: string;
  readonly patternCode: string | null;
  readonly occurrenceCount: number;
  readonly confidence: number;
  readonly lastSeenAt: string;
}

export interface ErrorPatternsReadResponse {
  readonly studentId: string;
  readonly errorPatterns: ErrorPatternEntry[];
}

interface ErrorPatternRow {
  readonly id: string;
  readonly skill_id: string;
  readonly pattern_type: string;
  readonly pattern_code: string | null;
  readonly occurrence_count: number;
  readonly confidence: string;
  readonly last_seen_at: string;
}

@Injectable()
export class ErrorPatternsReadService {
  private readonly logger = new Logger(ErrorPatternsReadService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Return active, backend-classified error patterns for a student, most
   * recently seen first.
   *
   * Returns only backend-validated, backend-classified values. If no rows
   * exist for the student, returns an empty array.
   *
   * studentId must be JWT-resolved by the controller — never client-supplied.
   */
  async getActiveErrorPatternsForStudent(
    studentId: string,
  ): Promise<ErrorPatternsReadResponse> {
    const result = await this.db.query<ErrorPatternRow>(
      `SELECT
         id,
         skill_id,
         pattern_type,
         pattern_code,
         occurrence_count,
         confidence,
         last_seen_at
       FROM error_patterns
       WHERE student_id = $1 AND is_active = TRUE
       ORDER BY last_seen_at DESC`,
      [studentId],
    );

    const errorPatterns: ErrorPatternEntry[] = result.rows.map((row) => ({
      patternId: row.id,
      skillId: row.skill_id,
      patternType: row.pattern_type,
      patternCode: row.pattern_code,
      occurrenceCount: row.occurrence_count,
      confidence: parseFloat(row.confidence),
      lastSeenAt: row.last_seen_at,
    }));

    this.logger.debug('error_patterns_read', { studentId, count: errorPatterns.length });

    return { studentId, errorPatterns };
  }
}
