// Phase 4 — P4-038
// PlacementTestReadService.
//
// Scope: Placement Test read API only.
//
// Responsibility:
//   Fetch the single published placement test and return a student-safe response
//   per P4-009 §4 and the API map endpoint #1 (GET /placement/active).
//
//   Student-safe fields returned:
//     - id, title, status, totalSections, estimatedMinutes
//
//   Fields NEVER returned to clients:
//     - version          (internal backend field)
//     - published_at     (internal)
//     - created_at       (internal)
//     - updated_at       (internal)
//     - description      (not required by §4 student-safe spec)
//
// Security rules:
//   - Returns only the published test — status = 'published' is enforced in the query.
//   - total_sections is backend-computed — clients cannot override it.
//   - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';

// ---------------------------------------------------------------------------
// Internal DB row type
// ---------------------------------------------------------------------------

interface PlacementTestPublishedRow {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly total_sections: number;
  readonly estimated_minutes: number;
}

// ---------------------------------------------------------------------------
// Student-safe response shape (P4-009 §4)
// ---------------------------------------------------------------------------

export interface PlacementTestActiveResponse {
  readonly id: string;
  readonly title: string;
  readonly status: 'published';
  readonly totalSections: number;
  readonly estimatedMinutes: number;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class PlacementTestReadService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Fetch the single published placement test.
   *
   * - Queries placement_tests WHERE status = 'published'.
   * - Returns student-safe fields only (P4-009 §4).
   * - Throws 404 if no published test exists.
   *
   * @returns Student-safe placement test metadata.
   */
  async getActivePlacementTest(): Promise<PlacementTestActiveResponse> {
    const rows = await this.db.query<PlacementTestPublishedRow>(
      `SELECT id, title, status, total_sections, estimated_minutes
         FROM placement_tests
        WHERE status = 'published'
        LIMIT 1`,
    );

    if (rows.length === 0) {
      throw new AppError(
        'No published placement test found.',
        HttpStatus.NOT_FOUND,
        ApiErrorCode.NOT_FOUND,
      );
    }

    const row = rows[0];

    return {
      id: row.id,
      title: row.title,
      status: 'published',
      totalSections: row.total_sections,
      estimatedMinutes: row.estimated_minutes,
    };
  }
}
