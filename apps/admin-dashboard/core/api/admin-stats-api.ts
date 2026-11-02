import { adminApiClient } from './admin-api-client';

export type DashboardStats = {
  readonly users: {
    readonly total: number;
    readonly students: number;
    readonly admins: number;
    readonly active: number;
    readonly newThisMonth: number;
  };
  readonly content: {
    readonly courses: number;
    readonly lessons: number;
    readonly questions: number;
    readonly skills: number;
  };
  readonly assessments: {
    readonly total: number;
    readonly attempts: number;
    readonly avgScore: number | null;
  };
  readonly activity: {
    readonly aiSessions: number;
    readonly voiceSessions: number;
    readonly learningSessionsToday: number;
  };
  /** Real money from approved course (wallet) payments; major units, per currency. */
  readonly billing: {
    readonly currencies: ReadonlyArray<{
      readonly currency: string;
      readonly totalRevenue: number;
      readonly revenueThisMonth: number;
      readonly pendingAmount: number;
    }>;
    readonly approvedPayments: number;
    readonly pendingPayments: number;
    readonly rejectedPayments: number;
    readonly payingStudents: number;
    readonly access: {
      readonly active: number;
      readonly completed: number;
      readonly failed: number;
      readonly expiringWithin7Days: number;
    };
  };
  readonly operations: {
    readonly openTickets: number;
    readonly activeIncidents: number;
    readonly pendingFeedback: number;
  };
};

function num(v: unknown): number {
  return typeof v === 'number' ? v : 0;
}

function decodeStats(v: unknown): DashboardStats {
  const o = v as Record<string, Record<string, unknown>>;
  const u = o.users ?? {};
  const c = o.content ?? {};
  const a = o.assessments ?? {};
  const act = o.activity ?? {};
  const b = o.billing ?? {};
  const ops = o.operations ?? {};
  const acc = ((b as { access?: Record<string, unknown> }).access ?? {}) as Record<string, unknown>;
  return {
    users: { total: num(u.total), students: num(u.students), admins: num(u.admins), active: num(u.active), newThisMonth: num(u.newThisMonth) },
    content: { courses: num(c.courses), lessons: num(c.lessons), questions: num(c.questions), skills: num(c.skills) },
    assessments: { total: num(a.total), attempts: num(a.attempts), avgScore: typeof a.avgScore === 'number' ? a.avgScore : null },
    activity: { aiSessions: num(act.aiSessions), voiceSessions: num(act.voiceSessions), learningSessionsToday: num(act.learningSessionsToday) },
    billing: {
      currencies: Array.isArray(b.currencies)
        ? (b.currencies as Record<string, unknown>[]).map((r) => ({
            currency: typeof r.currency === 'string' ? r.currency : '',
            totalRevenue: num(r.totalRevenue),
            revenueThisMonth: num(r.revenueThisMonth),
            pendingAmount: num(r.pendingAmount),
          }))
        : [],
      approvedPayments: num(b.approvedPayments),
      pendingPayments: num(b.pendingPayments),
      rejectedPayments: num(b.rejectedPayments),
      payingStudents: num(b.payingStudents),
      access: {
        active: num(acc.active),
        completed: num(acc.completed),
        failed: num(acc.failed),
        expiringWithin7Days: num(acc.expiringWithin7Days),
      },
    },
    operations: { openTickets: num(ops.openTickets), activeIncidents: num(ops.activeIncidents), pendingFeedback: num(ops.pendingFeedback) },
  };
}

export async function fetchAdminStats(token: string): Promise<DashboardStats> {
  const envelope = await adminApiClient.get('/admin/stats', decodeStats, {
    headers: { authorization: `Bearer ${token}` },
  });
  return envelope.data;
}
