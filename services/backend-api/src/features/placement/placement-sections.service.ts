// Phase 4 — P4-039
// PlacementSectionsService.
//
// Scope: Placement sections read API only.
//
// Responsibility:
//   List the sections of the active (published) placement test in order,
//   returning only student-safe fields per P4-010 §4 and the API map endpoint #2
//   (GET /placement/sections).
//
//   Student-safe fields returned per section:
//     - id, title, skillCode, order, questionCount
//
//   Fields NEVER returned to clients:
//     - placement_test_id  (internal FK)
//     - created_at         (internal)
//     - updated_at         (internal)
//
// Security rules:
//   - Only sections belonging to the published test are returned.
//   - total_questions is backend-computed — clients cannot override it.
//   - student_id is not involved in this endpoint.
//   - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';

// ---------------------------------------------------------------------------
// Internal DB row types
// ---------------------------------------------------------------------------

interface PublishedTestIdRow {
  readonly id: string;
}

interface PlacementSectionRow {
  readonly id: string;
  readonly title: string;
  readonly skill_code: string;
  readonly order_index: number;
  readonly total_questions: number;
}

// ---------------------------------------------------------------------------
// Student-safe response shapes (P4-010 §4, API map endpoint #2)
// ---------------------------------------------------------------------------

export interface PlacementSectionSafeResponse {
  readonly id: string;
  readonly title: string;
  readonly skillCode: string;
  readonly order: number;
  readonly questionCount: number;
}

export interface PlacementSectionsResponse {
  readonly sections: PlacementSectionSafeResponse[];
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class PlacementSectionsService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * List sections of the active placement test, ordered by order_index.
   *
   * - Resolves the published test first; throws 404 if none exists.
   * - Returns sections ordered by order_index ascending.
   * - Strips internal fields before returning.
   *
   * @returns Ordered student-safe section list.
   */
  async getSections(): Promise<PlacementSectionsResponse> {
    const testRows = await this.db.query<PublishedTestIdRow>(
      `SELECT id FROM placement_tests WHERE status = 'published' LIMIT 1`,
    );

    if (testRows.length === 0) {
      throw new AppError(
        'No published placement test found.',
        HttpStatus.NOT_FOUND,
        ApiErrorCode.NOT_FOUND,
      );
    }

    const testId = testRows[0].id;

    const sectionRows = await this.db.query<PlacementSectionRow>(
      `SELECT id, title, skill_code, order_index, total_questions
         FROM placement_sections
        WHERE placement_test_id = $1
        ORDER BY order_index ASC`,
      [testId],
    );

    return {
      sections: sectionRows.map((row) => ({
        id: row.id,
        title: row.title,
        skillCode: row.skill_code,
        order: row.order_index,
        questionCount: row.total_questions,
      })),
    };
  }
}
