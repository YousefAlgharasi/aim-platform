jest.mock('react-router-dom', () => ({ Link: ({ children }: { children: unknown }) => children, useNavigate: () => jest.fn() }));
jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));

import { homeDeadlines, partOfDay } from '../features/dashboard/DashboardHome';
import { dueIn } from '../features/dashboard/widgets/DeadlineWidget';
import { deadlineStatusLabel } from '../features/assessments/assessmentsApi';
import type { StudentDeadlines } from '../features/dashboard/dashboardApi';

const item = (id: string, status: string, closesAt: string, opensAt = '2026-11-01T00:00:00Z', ext: string | null = null) =>
  ({ assessmentId: id, assessmentTitle: id, deadlineId: id, opensAt, closesAt, extendedClosesAt: ext, status }) as never;

describe('dashboard deadlines', () => {
  const d: StudentDeadlines = {
    upcoming: [item('up2', 'upcoming', '2026-12-30T00:00:00Z', '2026-12-10T00:00:00Z'), item('up1', 'upcoming', '2026-12-20T00:00:00Z', '2026-12-01T00:00:00Z')],
    active: [item('open-late-due', 'open', '2026-11-20T00:00:00Z'), item('open-soon', 'extended', '2026-11-08T00:00:00Z', undefined, '2026-11-12T00:00:00Z')],
    late: [item('late', 'late', '2026-11-02T00:00:00Z')],
    missed: [item('missed', 'missed', '2026-10-01T00:00:00Z')], closed: [],
  };
  it('puts open/late first by due date (using the extended date), then upcoming by opening date, and never shows missed', () => {
    expect(homeDeadlines(d)?.map((x) => x.assessmentId)).toEqual(['late', 'open-soon', 'open-late-due', 'up1']);
  });
  it('returns null (not []) when the request failed', () => {
    expect(homeDeadlines(null)).toBeNull();
  });
  it('labels the raw API statuses (open/extended), not only "active"', () => {
    expect(deadlineStatusLabel('open')).not.toBe('open');
    expect(deadlineStatusLabel('extended')).not.toBe('extended');
  });
  it('counts down to the due date', () => {
    const now = Date.parse('2026-11-05T12:00:00Z');
    expect(dueIn('2026-11-05T09:00:00Z', now).key).toBe('overdue');
    expect(dueIn('2026-11-05T20:00:00Z', now).key).toBe('today');
    expect(dueIn('2026-11-06T20:00:00Z', now).key).toBe('tomorrow');
    expect(dueIn('2026-11-09T12:00:00Z', now)).toEqual({ key: 'days', days: 4 });
  });
});

describe('greeting', () => {
  it.each([[5, 'morning'], [11, 'morning'], [12, 'afternoon'], [17, 'afternoon'], [18, 'evening'], [23, 'evening']])('%i:00 is %s', (h, p) => {
    expect(partOfDay(h as number)).toBe(p);
  });
});
