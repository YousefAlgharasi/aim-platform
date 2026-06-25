import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function safePagination(page: number, limit: number) {
  const safePage = Math.max(page, DEFAULT_PAGE);
  const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
  const offset = (safePage - 1) * safeLimit;
  return { safePage, safeLimit, offset };
}

@Injectable()
export class AdminDataService {
  constructor(private readonly db: DatabaseService) {}

  async listAssessments(page: number, limit: number, type?: string) {
    const { safePage, safeLimit, offset } = safePagination(page, limit);

    const countParams: unknown[] = [];
    let countWhere = '';
    if (type) {
      countWhere = 'WHERE a.type = $1';
      countParams.push(type);
    }

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM assessments a ${countWhere}`,
      countParams,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams: unknown[] = [];
    let dataWhere = '';
    let idx = 1;
    if (type) {
      dataWhere = `WHERE a.type = $${idx++}`;
      dataParams.push(type);
    }
    const limitIdx = idx++;
    const offsetIdx = idx;
    dataParams.push(safeLimit, offset);

    const result = await this.db.query<Record<string, unknown>>(
      `SELECT a.id, a.title, a.type, a.status,
              (SELECT COUNT(*)::int FROM assessment_questions aq WHERE aq.assessment_id = a.id) AS question_count,
              a.created_at, a.updated_at
       FROM assessments a ${dataWhere}
       ORDER BY a.created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      dataParams,
    );

    return {
      data: result.rows.map((r) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        status: r.status,
        questionCount: r.question_count ?? 0,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async listDeadlines(page: number, limit: number) {
    const { safePage, safeLimit, offset } = safePagination(page, limit);

    const countResult = await this.db.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM assessment_deadlines',
      [],
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const result = await this.db.query<Record<string, unknown>>(
      `SELECT id, assessment_id, closes_at AS due_at, NULL AS course_id, NULL AS chapter_id, created_at, updated_at
       FROM assessment_deadlines
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [safeLimit, offset],
    );

    return {
      data: result.rows.map((r) => ({
        id: r.id,
        assessmentId: r.assessment_id,
        dueAt: r.due_at,
        courseId: r.course_id ?? null,
        chapterId: r.chapter_id ?? null,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async listAssessmentResults(page: number, limit: number, filters?: { studentId?: string; assessmentId?: string }) {
    const { safePage, safeLimit, offset } = safePagination(page, limit);
    const conditions: string[] = [];
    const filterParams: unknown[] = [];
    let idx = 1;

    if (filters?.studentId) {
      conditions.push(`student_id = $${idx++}`);
      filterParams.push(filters.studentId);
    }
    if (filters?.assessmentId) {
      conditions.push(`assessment_id = $${idx++}`);
      filterParams.push(filters.assessmentId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM assessment_results ${whereClause}`,
      [...filterParams],
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const limitIdx = idx++;
    const offsetIdx = idx;
    const dataParams = [...filterParams, safeLimit, offset];

    const result = await this.db.query<Record<string, unknown>>(
      `SELECT id, student_id, assessment_id, score, passed, created_at AS attempted_at, graded_at AS completed_at
       FROM assessment_results ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      dataParams,
    );

    return {
      data: result.rows.map((r) => ({
        id: r.id,
        studentId: r.student_id,
        assessmentId: r.assessment_id,
        score: r.score,
        passed: r.passed,
        attemptedAt: r.attempted_at,
        completedAt: r.completed_at ?? null,
      })),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async listPlacementResults(page: number, limit: number) {
    const { safePage, safeLimit, offset } = safePagination(page, limit);

    const countResult = await this.db.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM placement_results',
      [],
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const result = await this.db.query<Record<string, unknown>>(
      `SELECT id, student_id, estimated_level, skill_mastery_map, weakness_map, initial_path_id, created_at
       FROM placement_results
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [safeLimit, offset],
    );

    return {
      data: result.rows.map((r) => ({
        id: r.id,
        studentId: r.student_id,
        estimatedLevel: r.estimated_level,
        skillMasteryMap: r.skill_mastery_map,
        weaknessMap: r.weakness_map,
        initialPathId: r.initial_path_id,
        createdAt: r.created_at,
      })),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async listSessionSummaries(page: number, limit: number, studentId?: string) {
    const { safePage, safeLimit, offset } = safePagination(page, limit);
    const conditions: string[] = [];
    const filterParams: unknown[] = [];
    let idx = 1;

    if (studentId) {
      conditions.push(`student_id = $${idx++}`);
      filterParams.push(studentId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM session_summaries ${whereClause}`,
      [...filterParams],
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const limitIdx = idx++;
    const offsetIdx = idx;
    const dataParams = [...filterParams, safeLimit, offset];

    const result = await this.db.query<Record<string, unknown>>(
      `SELECT id, student_id, created_at AS started_at, closed_out_at AS ended_at, signal_basis AS feedback_summary
       FROM session_summaries ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      dataParams,
    );

    return {
      data: result.rows.map((r) => ({
        id: r.id,
        studentId: r.student_id,
        startedAt: r.started_at,
        endedAt: r.ended_at ?? null,
        feedbackSummary: r.feedback_summary ?? null,
      })),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async listAuditLogs(page: number, limit: number, filters?: { userId?: string; action?: string; from?: string; to?: string }) {
    const { safePage, safeLimit, offset } = safePagination(page, limit);
    const conditions: string[] = [];
    const filterParams: unknown[] = [];
    let idx = 1;

    if (filters?.userId) {
      conditions.push(`actor_id = $${idx++}`);
      filterParams.push(filters.userId);
    }
    if (filters?.action) {
      conditions.push(`event_type = $${idx++}`);
      filterParams.push(filters.action);
    }
    if (filters?.from) {
      conditions.push(`created_at >= $${idx++}`);
      filterParams.push(filters.from);
    }
    if (filters?.to) {
      conditions.push(`created_at <= $${idx++}`);
      filterParams.push(filters.to);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM assessment_audit_logs ${whereClause}`,
      [...filterParams],
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const limitIdx = idx++;
    const offsetIdx = idx;
    const dataParams = [...filterParams, safeLimit, offset];

    const result = await this.db.query<Record<string, unknown>>(
      `SELECT id, actor_id AS user_id, event_type AS action, entity_type, entity_id, created_at
       FROM assessment_audit_logs ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      dataParams,
    );

    return {
      data: result.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        action: r.action,
        entityType: r.entity_type ?? null,
        entityId: r.entity_id ?? null,
        createdAt: r.created_at,
      })),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async listActivityLogs(page: number, limit: number, filters?: { userId?: string; eventType?: string; from?: string; to?: string }) {
    const { safePage, safeLimit, offset } = safePagination(page, limit);
    const conditions: string[] = [];
    const filterParams: unknown[] = [];
    let idx = 1;

    if (filters?.userId) {
      conditions.push(`actor_id = $${idx++}`);
      filterParams.push(filters.userId);
    }
    if (filters?.eventType) {
      conditions.push(`action = $${idx++}`);
      filterParams.push(filters.eventType);
    }
    if (filters?.from) {
      conditions.push(`created_at >= $${idx++}`);
      filterParams.push(filters.from);
    }
    if (filters?.to) {
      conditions.push(`created_at <= $${idx++}`);
      filterParams.push(filters.to);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM operations_audit_logs ${whereClause}`,
      [...filterParams],
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const limitIdx = idx++;
    const offsetIdx = idx;
    const dataParams = [...filterParams, safeLimit, offset];

    const result = await this.db.query<Record<string, unknown>>(
      `SELECT id, actor_id AS user_id, action AS event_type, created_at
       FROM operations_audit_logs ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      dataParams,
    );

    return {
      data: result.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        eventType: r.event_type,
        createdAt: r.created_at,
      })),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async getEnrollmentReport(from?: string, to?: string) {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (from) {
      conditions.push(`created_at >= $${idx++}`);
      params.push(from);
    }
    if (to) {
      conditions.push(`created_at <= $${idx++}`);
      params.push(to);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const period = from && to ? `${from} to ${to}` : 'all-time';

    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM users ${whereClause}`,
      params,
    );
    const totalEnrollments = parseInt(result.rows[0]?.count ?? '0', 10);

    return {
      totalEnrollments,
      newEnrollments: totalEnrollments,
      activeCourses: 0,
      period,
    };
  }

  async getAssessmentReport(from?: string, to?: string) {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (from) {
      conditions.push(`created_at >= $${idx++}`);
      params.push(from);
    }
    if (to) {
      conditions.push(`created_at <= $${idx++}`);
      params.push(to);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const period = from && to ? `${from} to ${to}` : 'all-time';

    const result = await this.db.query<{ total: string; passed: string; failed: string; avg_score: string }>(
      `SELECT
         COUNT(*)::text AS total,
         COUNT(*) FILTER (WHERE passed = true)::text AS passed,
         COUNT(*) FILTER (WHERE passed = false)::text AS failed,
         COALESCE(AVG(score), 0)::text AS avg_score
       FROM assessment_results ${whereClause}`,
      params,
    );

    const row = result.rows[0];
    return {
      totalAttempts: parseInt(row?.total ?? '0', 10),
      passed: parseInt(row?.passed ?? '0', 10),
      failed: parseInt(row?.failed ?? '0', 10),
      avgScore: parseFloat(row?.avg_score ?? '0'),
      period,
    };
  }

  async getActiveUsersReport(from?: string, to?: string) {
    const period = from && to ? `${from} to ${to}` : 'all-time';

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const result = await this.db.query<{ daily: string; weekly: string; monthly: string }>(
      `SELECT
         COUNT(DISTINCT actor_id) FILTER (WHERE created_at >= $1)::text AS daily,
         COUNT(DISTINCT actor_id) FILTER (WHERE created_at >= $2)::text AS weekly,
         COUNT(DISTINCT actor_id) FILTER (WHERE created_at >= $3)::text AS monthly
       FROM operations_audit_logs`,
      [dayAgo, weekAgo, monthAgo],
    );

    const row = result.rows[0];
    return {
      dailyActiveUsers: parseInt(row?.daily ?? '0', 10),
      weeklyActiveUsers: parseInt(row?.weekly ?? '0', 10),
      monthlyActiveUsers: parseInt(row?.monthly ?? '0', 10),
      period,
    };
  }
}
