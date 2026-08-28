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

  async listPlacementResults(page: number, limit: number, level?: string) {
    const { safePage, safeLimit, offset } = safePagination(page, limit);

    const countParams: unknown[] = [];
    let countWhere = '';
    if (level) {
      countWhere = 'WHERE estimated_level = $1';
      countParams.push(level);
    }

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM placement_results ${countWhere}`,
      countParams,
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const dataParams: unknown[] = [];
    let dataWhere = '';
    let idx = 1;
    if (level) {
      dataWhere = `WHERE pr.estimated_level = $${idx++}`;
      dataParams.push(level);
    }
    const limitIdx = idx++;
    const offsetIdx = idx;
    dataParams.push(safeLimit, offset);

    // student_id on placement_results may hold either the internal users.id
    // or the Supabase auth UID (same normalization used by the placement
    // ownership checks) — join on both so the student's name always resolves.
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT pr.id, pr.student_id, pr.estimated_level, pr.skill_mastery_map, pr.weakness_map,
              pr.initial_path_id, pr.created_at,
              sp.display_name, u.email
       FROM placement_results pr
       LEFT JOIN users u ON u.id = pr.student_id OR u.supabase_auth_uid = pr.student_id
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       ${dataWhere}
       ORDER BY pr.created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      dataParams,
    );

    return {
      data: result.rows.map((r) => ({
        id: r.id,
        studentId: r.student_id,
        studentName: (r.display_name as string | null) ?? (r.email as string | null) ?? null,
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

  // Admin-relevant audit activity is spread across several append-only audit
  // tables that share a normalizable shape (an actor/user id, an action/event
  // type, an optional entity reference, and a created_at). This unions the
  // ones that represent real admin-relevant actions across the platform, so
  // the "AIM Audit Logs" admin page reflects genuine activity instead of only
  // assessment CRUD. aim_audit_log (AIM Engine pipeline internals) and the
  // access-decision logs (analytics_access_audit_logs, parent_access_audit_logs)
  // are intentionally excluded — different shape / different surface.
  // operations_audit_logs is covered by the separate Activity Logs page
  // (listActivityLogs) and is not duplicated here.
  async listAuditLogs(page: number, limit: number, filters?: { userId?: string; action?: string; from?: string; to?: string }) {
    const { safePage, safeLimit, offset } = safePagination(page, limit);
    const filterParams: unknown[] = [];
    let idx = 1;

    let userIdIdx: number | null = null;
    let actionIdx: number | null = null;
    let fromIdx: number | null = null;
    let toIdx: number | null = null;

    if (filters?.userId) {
      userIdIdx = idx++;
      filterParams.push(filters.userId);
    }
    if (filters?.action) {
      actionIdx = idx++;
      filterParams.push(filters.action);
    }
    if (filters?.from) {
      fromIdx = idx++;
      filterParams.push(filters.from);
    }
    if (filters?.to) {
      toIdx = idx++;
      filterParams.push(filters.to);
    }

    // Builds a WHERE clause for one branch of the UNION ALL, applying the
    // shared filters against that table's own (pre-aliasing) column names so
    // each branch can use its own indexes.
    const buildWhere = (userCol: string, actionCol: string): string => {
      const conditions: string[] = [];
      if (userIdIdx) conditions.push(`${userCol} = $${userIdIdx}`);
      if (actionIdx) conditions.push(`${actionCol} = $${actionIdx}`);
      if (fromIdx) conditions.push(`created_at >= $${fromIdx}`);
      if (toIdx) conditions.push(`created_at <= $${toIdx}`);
      return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    };

    const branches = [
      `SELECT id, actor_id AS user_id, event_type AS action, entity_type, entity_id, created_at, 'assessment' AS category
       FROM assessment_audit_logs ${buildWhere('actor_id', 'event_type')}`,
      `SELECT id, actor_user_id AS user_id, event_type AS action, entity_type, entity_id, created_at, 'curriculum' AS category
       FROM curriculum_audit_logs ${buildWhere('actor_user_id', 'event_type')}`,
      `SELECT id, student_id AS user_id, event_type AS action, 'placement_attempt'::text AS entity_type, placement_attempt_id AS entity_id, created_at, 'placement' AS category
       FROM placement_audit_log ${buildWhere('student_id', 'event_type')}`,
      `SELECT id, COALESCE(actor_user_id, user_id) AS user_id, event_type AS action, NULL::text AS entity_type, NULL::uuid AS entity_id, created_at, 'auth' AS category
       FROM auth_audit_logs ${buildWhere('COALESCE(actor_user_id, user_id)', 'event_type')}`,
      `SELECT id, actor_id AS user_id, action, entity_type, entity_id, created_at, 'notifications' AS category
       FROM notification_audit_logs ${buildWhere('actor_id', 'action')}`,
      `SELECT id, actor_id AS user_id, action, entity_type, entity_id, created_at, 'billing' AS category
       FROM billing_audit_logs ${buildWhere('actor_id', 'action')}`,
    ];

    const unionSql = branches.join('\n       UNION ALL\n       ');

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM (${unionSql}) all_audit_logs`,
      [...filterParams],
    );
    const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

    const limitIdx = idx++;
    const offsetIdx = idx;
    const dataParams = [...filterParams, safeLimit, offset];

    // student_id/actor_id/user_id across these tables may hold either the
    // internal users.id or the Supabase auth UID — join on both so the
    // actor's name resolves the same way listPlacementResults does.
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT al.id, al.user_id, al.action, al.entity_type, al.entity_id, al.created_at, al.category,
              sp.display_name, u.email
       FROM (${unionSql}) al
       LEFT JOIN users u ON u.id = al.user_id OR u.supabase_auth_uid = al.user_id
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      dataParams,
    );

    return {
      data: result.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        userName: (r.display_name as string | null) ?? (r.email as string | null) ?? null,
        action: r.action,
        entityType: r.entity_type ?? null,
        entityId: r.entity_id ?? null,
        category: r.category,
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
