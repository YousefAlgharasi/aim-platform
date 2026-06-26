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
}
