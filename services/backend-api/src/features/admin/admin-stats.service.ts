import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface DashboardStats {
  users: {
    total: number;
    students: number;
    admins: number;
    active: number;
    newThisMonth: number;
  };
  content: {
    courses: number;
    lessons: number;
    questions: number;
    skills: number;
  };
  assessments: {
    total: number;
    attempts: number;
    avgScore: number | null;
  };
  activity: {
    aiSessions: number;
    voiceSessions: number;
    learningSessionsToday: number;
  };
  operations: {
    openTickets: number;
    activeIncidents: number;
    pendingFeedback: number;
  };
}

@Injectable()
export class AdminStatsService {
  private readonly logger = new Logger(AdminStatsService.name);

  constructor(private readonly db: DatabaseService) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const [
      users,
      content,
      assessments,
      activity,
      operations,
    ] = await Promise.all([
      this.getUserStats().catch((e) => {
        this.logger.error('Failed to fetch user stats', e);
        return { total: 0, students: 0, admins: 0, active: 0, newThisMonth: 0 };
      }),
      this.getContentStats(),
      this.getAssessmentStats(),
      this.getActivityStats(),
      this.getOperationsStats(),
    ]);

    return { users, content, assessments, activity, operations };
  }

  private async getUserStats() {
    const result = await this.db.query<{
      total: string;
      students: string;
      admins: string;
      active: string;
      new_this_month: string;
    }>(`
      SELECT
        COUNT(*)::text AS total,
        COUNT(*) FILTER (WHERE user_type = 'student')::text AS students,
        COUNT(*) FILTER (WHERE user_type = 'admin')::text AS admins,
        COUNT(*) FILTER (WHERE status = 'active')::text AS active,
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE))::text AS new_this_month
      FROM users
    `);
    const row = result.rows[0];
    return {
      total: parseInt(row.total, 10),
      students: parseInt(row.students, 10),
      admins: parseInt(row.admins, 10),
      active: parseInt(row.active, 10),
      newThisMonth: parseInt(row.new_this_month, 10),
    };
  }

  private async getContentStats() {
    const queries = await Promise.all([
      this.safeCount('courses'),
      this.safeCount('lessons'),
      this.safeCount('question_bank'),
      this.safeCount('skills'),
    ]);
    return {
      courses: queries[0],
      lessons: queries[1],
      questions: queries[2],
      skills: queries[3],
    };
  }

  private async getAssessmentStats() {
    const totalResult = await this.safeCount('assessments');
    let attempts = 0;
    let avgScore: number | null = null;
    try {
      const result = await this.db.query<{ count: string; avg: string | null }>(`
        SELECT COUNT(*)::text AS count, ROUND(AVG(score_percentage)::numeric, 1)::text AS avg
        FROM assessment_results
      `);
      const row = result.rows[0];
      attempts = parseInt(row.count, 10);
      avgScore = row.avg ? parseFloat(row.avg) : null;
    } catch {
      this.logger.debug('assessment_results table not available');
    }
    return { total: totalResult, attempts, avgScore };
  }

  private async getActivityStats() {
    let aiSessions = 0;
    let voiceSessions = 0;
    let learningSessionsToday = 0;

    try {
      aiSessions = await this.safeCount('ai_chat_sessions');
    } catch { /* table may not exist */ }

    try {
      voiceSessions = await this.safeCount('voice_sessions');
    } catch { /* table may not exist */ }

    try {
      const result = await this.db.query<{ count: string }>(`
        SELECT COUNT(*)::text AS count FROM learning_sessions
        WHERE created_at >= CURRENT_DATE
      `);
      learningSessionsToday = parseInt(result.rows[0].count, 10);
    } catch {
      this.logger.debug('learning_sessions table not available');
    }

    return { aiSessions, voiceSessions, learningSessionsToday };
  }

  private async getOperationsStats() {
    let openTickets = 0;
    let activeIncidents = 0;
    let pendingFeedback = 0;

    try {
      const result = await this.db.query<{ count: string }>(`
        SELECT COUNT(*)::text AS count FROM support_tickets
        WHERE status IN ('open', 'in_progress')
      `);
      openTickets = parseInt(result.rows[0].count, 10);
    } catch { /* table may not exist */ }

    try {
      const result = await this.db.query<{ count: string }>(`
        SELECT COUNT(*)::text AS count FROM incident_records
        WHERE status IN ('investigating', 'identified', 'monitoring')
      `);
      activeIncidents = parseInt(result.rows[0].count, 10);
    } catch { /* table may not exist */ }

    try {
      const result = await this.db.query<{ count: string }>(`
        SELECT COUNT(*)::text AS count FROM user_feedback
        WHERE status = 'new'
      `);
      pendingFeedback = parseInt(result.rows[0].count, 10);
    } catch { /* table may not exist */ }

    return { openTickets, activeIncidents, pendingFeedback };
  }

  private async safeCount(table: string): Promise<number> {
    try {
      const result = await this.db.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM ${table}`,
      );
      return parseInt(result.rows[0].count, 10);
    } catch {
      this.logger.debug(`Table ${table} not available for count`);
      return 0;
    }
  }
}
