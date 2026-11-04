// CourseBillingOverviewService — the real numbers behind the admin
// "Course Payments → Overview" page and the admin home dashboard.
//
// Money here comes ONLY from wallet payments (course_payment_requests):
//   - an APPROVED payment is revenue, counted on the day an admin approved it;
//   - a PENDING payment is shown separately ("waiting for review") and is not
//     revenue yet; a REJECTED payment is never money.
// Amounts are in major units (e.g. 8000.00 YER) and are never summed across
// currencies — every figure is grouped per currency.

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface CurrencyTotals {
  readonly currency: string;
  readonly revenueToday: number;
  readonly revenueMtd: number;
  readonly revenueLastMonth: number;
  readonly revenueAllTime: number;
  readonly approvedTotal: number;
  readonly approvedThisMonth: number;
  readonly averagePayment: number;
  readonly discountsGiven: number;
  readonly pendingCount: number;
  readonly pendingAmount: number;
  readonly rejectedCount: number;
}

export interface CourseRevenue {
  readonly courseId: string;
  readonly title: string;
  readonly currency: string;
  readonly payments: number;
  readonly revenue: number;
}

export interface WalletRevenue {
  readonly walletId: string;
  readonly name: string;
  readonly currency: string;
  readonly payments: number;
  readonly revenue: number;
}

export interface MonthRevenue {
  /** First day of the month, e.g. "2026-10". */
  readonly month: string;
  readonly currency: string;
  readonly payments: number;
  readonly revenue: number;
}

export interface RecentPayment {
  readonly id: string;
  readonly studentEmail: string | null;
  readonly courseTitle: string;
  readonly walletName: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: string;
  readonly createdAt: string;
  readonly reviewedAt: string | null;
}

export interface CourseBillingOverview {
  readonly currencies: CurrencyTotals[];
  readonly byCourse: CourseRevenue[];
  readonly byWallet: WalletRevenue[];
  readonly monthly: MonthRevenue[];
  readonly access: {
    readonly active: number;
    readonly expiringWithin7Days: number;
    readonly completed: number;
    readonly failed: number;
  };
  readonly payingStudents: number;
  readonly recent: RecentPayment[];
}

const num = (v: string | number | null | undefined): number => Number(v ?? 0);

@Injectable()
export class CourseBillingOverviewService {
  constructor(private readonly db: DatabaseService) {}

  async getOverview(): Promise<CourseBillingOverview> {
    const [currencies, byCourse, byWallet, monthly, access, paying, recent] = await Promise.all([
      this.currencyTotals(),
      this.revenueByCourse(),
      this.revenueByWallet(),
      this.revenueByMonth(),
      this.accessSummary(),
      this.payingStudents(),
      this.recentPayments(),
    ]);
    return { currencies, byCourse, byWallet, monthly, access, payingStudents: paying, recent };
  }

  private async currencyTotals(): Promise<CurrencyTotals[]> {
    const r = await this.db.query<Record<string, string>>(
      `SELECT currency,
         COALESCE(SUM(amount) FILTER (WHERE status = 'approved' AND reviewed_at >= date_trunc('day', now())), 0)::text AS rev_today,
         COALESCE(SUM(amount) FILTER (WHERE status = 'approved' AND reviewed_at >= date_trunc('month', now())), 0)::text AS rev_mtd,
         COALESCE(SUM(amount) FILTER (WHERE status = 'approved'
            AND reviewed_at >= date_trunc('month', now()) - interval '1 month'
            AND reviewed_at <  date_trunc('month', now())), 0)::text AS rev_last,
         COALESCE(SUM(amount) FILTER (WHERE status = 'approved'), 0)::text AS rev_all,
         COUNT(*) FILTER (WHERE status = 'approved')::text AS approved_total,
         COUNT(*) FILTER (WHERE status = 'approved' AND reviewed_at >= date_trunc('month', now()))::text AS approved_mtd,
         COALESCE(AVG(amount) FILTER (WHERE status = 'approved'), 0)::text AS avg_payment,
         COALESCE(SUM(discount_amount) FILTER (WHERE status = 'approved'), 0)::text AS discounts,
         COUNT(*) FILTER (WHERE status = 'pending')::text AS pending_count,
         COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0)::text AS pending_amount,
         COUNT(*) FILTER (WHERE status = 'rejected')::text AS rejected_count
       FROM course_payment_requests
       GROUP BY currency
       ORDER BY currency`,
    );
    return r.rows.map((x) => ({
      currency: x.currency,
      revenueToday: num(x.rev_today),
      revenueMtd: num(x.rev_mtd),
      revenueLastMonth: num(x.rev_last),
      revenueAllTime: num(x.rev_all),
      approvedTotal: num(x.approved_total),
      approvedThisMonth: num(x.approved_mtd),
      averagePayment: Math.round(num(x.avg_payment) * 100) / 100,
      discountsGiven: num(x.discounts),
      pendingCount: num(x.pending_count),
      pendingAmount: num(x.pending_amount),
      rejectedCount: num(x.rejected_count),
    }));
  }

  private async revenueByCourse(): Promise<CourseRevenue[]> {
    const r = await this.db.query<Record<string, string>>(
      `SELECT co.id AS course_id, co.title, p.currency, COUNT(*)::text AS payments, SUM(p.amount)::text AS revenue
       FROM course_payment_requests p JOIN courses co ON co.id = p.course_id
       WHERE p.status = 'approved'
       GROUP BY co.id, co.title, p.currency
       ORDER BY SUM(p.amount) DESC
       LIMIT 50`,
    );
    return r.rows.map((x) => ({
      courseId: x.course_id, title: x.title, currency: x.currency, payments: num(x.payments), revenue: num(x.revenue),
    }));
  }

  private async revenueByWallet(): Promise<WalletRevenue[]> {
    const r = await this.db.query<Record<string, string>>(
      `SELECT w.id AS wallet_id, w.name, p.currency, COUNT(*)::text AS payments, SUM(p.amount)::text AS revenue
       FROM course_payment_requests p JOIN payment_wallets w ON w.id = p.wallet_id
       WHERE p.status = 'approved'
       GROUP BY w.id, w.name, p.currency
       ORDER BY SUM(p.amount) DESC`,
    );
    return r.rows.map((x) => ({
      walletId: x.wallet_id, name: x.name, currency: x.currency, payments: num(x.payments), revenue: num(x.revenue),
    }));
  }

  /** Last 6 calendar months (including this one) of approved revenue, per currency. */
  private async revenueByMonth(): Promise<MonthRevenue[]> {
    const r = await this.db.query<Record<string, string>>(
      `SELECT to_char(date_trunc('month', reviewed_at), 'YYYY-MM') AS month, currency,
              COUNT(*)::text AS payments, SUM(amount)::text AS revenue
       FROM course_payment_requests
       WHERE status = 'approved' AND reviewed_at >= date_trunc('month', now()) - interval '5 months'
       GROUP BY 1, currency
       ORDER BY 1, currency`,
    );
    return r.rows.map((x) => ({ month: x.month, currency: x.currency, payments: num(x.payments), revenue: num(x.revenue) }));
  }

  private async accessSummary(): Promise<CourseBillingOverview['access']> {
    const r = await this.db.query<Record<string, string>>(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'active' AND expires_at > now())::text AS active,
         COUNT(*) FILTER (WHERE status = 'active' AND expires_at > now() AND expires_at <= now() + interval '7 days')::text AS expiring,
         COUNT(*) FILTER (WHERE status = 'completed')::text AS completed,
         COUNT(*) FILTER (WHERE status = 'failed' OR (status = 'active' AND expires_at <= now()))::text AS failed
       FROM course_access`,
    );
    const x = r.rows[0] ?? {};
    return { active: num(x.active), expiringWithin7Days: num(x.expiring), completed: num(x.completed), failed: num(x.failed) };
  }

  private async payingStudents(): Promise<number> {
    const r = await this.db.query<{ count: string }>(
      `SELECT COUNT(DISTINCT student_id)::text AS count FROM course_payment_requests WHERE status = 'approved'`,
    );
    return num(r.rows[0]?.count);
  }

  private async recentPayments(): Promise<RecentPayment[]> {
    const r = await this.db.query<Record<string, string | Date | null>>(
      `SELECT p.id, u.email AS student_email, co.title AS course_title, w.name AS wallet_name,
              p.amount, p.currency, p.status, p.created_at, p.reviewed_at
       FROM course_payment_requests p
       JOIN users u ON u.id = p.student_id
       JOIN courses co ON co.id = p.course_id
       JOIN payment_wallets w ON w.id = p.wallet_id
       ORDER BY p.created_at DESC
       LIMIT 8`,
    );
    return r.rows.map((x) => ({
      id: String(x.id),
      studentEmail: (x.student_email as string | null) ?? null,
      courseTitle: String(x.course_title),
      walletName: String(x.wallet_name),
      amount: num(x.amount as string),
      currency: String(x.currency),
      status: String(x.status),
      createdAt: new Date(x.created_at as string).toISOString(),
      reviewedAt: x.reviewed_at ? new Date(x.reviewed_at as string).toISOString() : null,
    }));
  }
}
