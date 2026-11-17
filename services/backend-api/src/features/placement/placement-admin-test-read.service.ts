// Phase 4 — P4-054
// PlacementAdminTestReadService.
//
// Scope: Placement Test admin read API only.
//
// Responsibility:
//   Fetch a paginated list of all placement tests (draft, published, archived)
//   for admin inspection. Backend is the sole authority for status, section
//   counts, and estimated duration — this service is read-only.
//
// Security rules:
//   - Fields never exposed to admins: version, published_at (internal backend fields).
//   - No placement scoring, CEFR thresholds, or skill maps are computed here.
//   - Status transitions are implemented elsewhere (P4-058) — this is read-only.
//   - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

interface PlacementTestRow {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly estimated_minutes: number;
  readonly total_sections: number;
  readonly created_at: string;
}

interface CountRow {
  readonly count: string;
}

export interface AdminPlacementTestSummary {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly estimatedMinutes: number;
  readonly totalSections: number;
  readonly createdAt: string;
}

export interface AdminPlacementTestListResponse {
  readonly tests: AdminPlacementTestSummary[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

@Injectable()
export class PlacementAdminTestReadService {
  constructor(private readonly db: DatabaseService) {}

  async listTests(page = 1, limit = DEFAULT_LIMIT): Promise<AdminPlacementTestListResponse> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
    const offset = (safePage - 1) * safeLimit;

    const [rowsResult, countResult] = await Promise.all([
      this.db.query<PlacementTestRow>(
        `SELECT id, title, status, estimated_minutes, total_sections, created_at
           FROM placement_tests
          ORDER BY created_at DESC
          LIMIT $1 OFFSET $2`,
        [safeLimit, offset],
      ),
      this.db.query<CountRow>(`SELECT COUNT(*)::text AS count FROM placement_tests`),
    ]);

    return {
      tests: rowsResult.rows.map((row) => ({
        id: row.id,
        title: row.title,
        status: row.status,
        estimatedMinutes: row.estimated_minutes,
        totalSections: row.total_sections,
        createdAt: row.created_at,
      })),
      total: parseInt(countResult.rows[0]?.count ?? '0', 10),
      page: safePage,
      limit: safeLimit,
    };
  }

  /** Sections of a placement test with bank size and how many questions each student draws. */
  async listSections(testId: string) {
    const r = await this.db.query<{
      id: string; placement_test_id: string; title: string; skill_code: string; order_index: number;
      bank: string; active: string; draw_count: number | null; created_at: string;
    }>(
      `SELECT ps.id, ps.placement_test_id, ps.title, ps.skill_code, ps.order_index, ps.draw_count, ps.created_at,
              (SELECT COUNT(*) FROM placement_questions q WHERE q.placement_section_id = ps.id)::text AS bank,
              (SELECT COUNT(*) FROM placement_questions q WHERE q.placement_section_id = ps.id AND q.is_active)::text AS active
         FROM placement_sections ps
        WHERE ps.placement_test_id = $1
        ORDER BY ps.order_index`,
      [testId],
    );
    return {
      sections: r.rows.map((row) => ({
        id: row.id,
        placementTestId: row.placement_test_id,
        title: row.title,
        skillCode: row.skill_code,
        order: row.order_index,
        questionCount: parseInt(row.bank, 10),
        activeQuestionCount: parseInt(row.active, 10),
        drawCount: row.draw_count,
        createdAt: row.created_at,
      })),
    };
  }

  /** The whole bank of a section. correct_answer is never returned. */
  async listQuestions(sectionId: string) {
    const r = await this.db.query<{
      id: string; placement_section_id: string; question_type: string; prompt: string; media_url: string | null;
      order_index: number; skill_code: string; difficulty: number; is_active: boolean; created_at: string;
    }>(
      `SELECT q.id, q.placement_section_id, q.question_type, q.prompt, q.media_url, q.order_index,
              q.difficulty, q.is_active, q.created_at, ps.skill_code
         FROM placement_questions q
         JOIN placement_sections ps ON ps.id = q.placement_section_id
        WHERE q.placement_section_id = $1
        ORDER BY q.difficulty, q.order_index`,
      [sectionId],
    );
    return {
      questions: r.rows.map((row) => ({
        id: row.id,
        placementSectionId: row.placement_section_id,
        questionType: row.question_type,
        prompt: row.prompt,
        mediaUrl: row.media_url,
        orderIndex: row.order_index,
        skillCode: row.skill_code,
        difficulty: row.difficulty,
        isActive: row.is_active,
        createdAt: row.created_at,
      })),
    };
  }
}
