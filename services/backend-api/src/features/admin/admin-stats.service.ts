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
  /** Real money from approved course (wallet) payments; amounts in major units, per currency. */
  billing: {
    currencies: Array<{
      currency: string;
      totalRevenue: number;
      revenueThisMonth: number;
      pendingAmount: number;
    }>;
    approvedPayments: number;
    pendingPayments: number;
    rejectedPayments: number;
    payingStudents: number;
    access: { active: number; completed: number; failed: number; expiringWithin7Days: number };
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
      billing,
      operations,
    ] = await Promise.all([
      this.getUserStats().catch((e) => {
        this.logger.error('Failed to fetch user stats', e);
        return { total: 0, students: 0, admins: 0, active: 0, newThisMonth: 0 };
      }),
      this.getContentStats(),
      this.getAssessmentStats(),
      this.getActivityStats(),
      this.getBillingStats(),
      this.getOperationsStats(),
    ]);

    return { users, content, assessments, activity, billing, operations };
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
        SELECT COUNT(*)::text AS count, ROUND(AVG(score / max_score * 100)::numeric, 1)::text AS avg
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

  private async getBillingStats(): Promise<DashboardStats['billing']> {
    const empty: DashboardStats['billing'] = {
      currencies: [],
      approvedPayments: 0,
      pendingPayments: 0,
      rejectedPayments: 0,
      payingStudents: 0,
      access: { active: 0, completed: 0, failed: 0, expiringWithin7Days: 0 },
    };

    try {
      const totals = await this.db.query<{
        currency: string;
        total: string;
        this_month: string;
        pending_amount: string;
      }>(`
        SELECT currency,
          COALESCE(SUM(amount) FILTER (WHERE status = 'approved'), 0)::text AS total,
          COALESCE(SUM(amount) FILTER (WHERE status = 'approved' AND reviewed_at >= date_trunc('month', now())), 0)::text AS this_month,
          COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0)::text AS pending_amount
        FROM course_payment_requests
        GROUP BY currency
        ORDER BY currency
      `);
      const counts = await this.db.query<{ approved: string; pending: string; rejected: string; paying: string }>(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'approved')::text AS approved,
          COUNT(*) FILTER (WHERE status = 'pending')::text AS pending,
          COUNT(*) FILTER (WHERE status = 'rejected')::text AS rejected,
          COUNT(DISTINCT student_id) FILTER (WHERE status = 'approved')::text AS paying
        FROM course_payment_requests
      `);
      const access = await this.db.query<{ active: string; completed: string; failed: string; expiring: string }>(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'active' AND expires_at > now())::text AS active,
          COUNT(*) FILTER (WHERE status = 'completed')::text AS completed,
          COUNT(*) FILTER (WHERE status = 'failed' OR (status = 'active' AND expires_at <= now()))::text AS failed,
          COUNT(*) FILTER (WHERE status = 'active' AND expires_at > now() AND expires_at <= now() + interval '7 days')::text AS expiring
        FROM course_access
      `);
      const c = counts.rows[0];
      const a = access.rows[0];
      return {
        currencies: totals.rows.map((r) => ({
          currency: r.currency,
          totalRevenue: Number(r.total),
          revenueThisMonth: Number(r.this_month),
          pendingAmount: Number(r.pending_amount),
        })),
        approvedPayments: parseInt(c.approved, 10),
        pendingPayments: parseInt(c.pending, 10),
        rejectedPayments: parseInt(c.rejected, 10),
        payingStudents: parseInt(c.paying, 10),
        access: {
          active: parseInt(a.active, 10),
          completed: parseInt(a.completed, 10),
          failed: parseInt(a.failed, 10),
          expiringWithin7Days: parseInt(a.expiring, 10),
        },
      };
    } catch (e) {
      this.logger.error('Failed to fetch course payment stats', e);
      return empty;
    }
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
