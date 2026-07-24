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
  readonly billing: {
    readonly activeSubscriptions: number;
    readonly trialingSubscriptions: number;
    readonly canceledSubscriptions: number;
    readonly totalSubscriptions: number;
    readonly totalRevenue: number;
    readonly revenueThisMonth: number;
    readonly currency: string;
    readonly paidInvoices: number;
    readonly overdueInvoices: number;
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
  return {
    users: { total: num(u.total), students: num(u.students), admins: num(u.admins), active: num(u.active), newThisMonth: num(u.newThisMonth) },
    content: { courses: num(c.courses), lessons: num(c.lessons), questions: num(c.questions), skills: num(c.skills) },
    assessments: { total: num(a.total), attempts: num(a.attempts), avgScore: typeof a.avgScore === 'number' ? a.avgScore : null },
    activity: { aiSessions: num(act.aiSessions), voiceSessions: num(act.voiceSessions), learningSessionsToday: num(act.learningSessionsToday) },
    billing: {
      activeSubscriptions: num(b.activeSubscriptions), trialingSubscriptions: num(b.trialingSubscriptions),
      canceledSubscriptions: num(b.canceledSubscriptions), totalSubscriptions: num(b.totalSubscriptions),
      totalRevenue: num(b.totalRevenue), revenueThisMonth: num(b.revenueThisMonth),
      currency: typeof b.currency === 'string' ? b.currency : 'USD',
      paidInvoices: num(b.paidInvoices), overdueInvoices: num(b.overdueInvoices),
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
