import { pickRelevantWindow, type MaintenanceWindow } from '../features/operations/maintenanceApi';

const NOW = Date.parse('2026-11-05T12:00:00Z');
const win = (over: Partial<MaintenanceWindow>): MaintenanceWindow => ({
  id: 'w', title: 'T', userMessage: null, status: 'scheduled',
  scheduledStart: '2026-11-05T13:00:00Z', scheduledEnd: '2026-11-05T15:00:00Z', ...over,
});

describe('pickRelevantWindow', () => {
  it('ignores stale windows whose end time has passed (even if still marked in_progress)', () => {
    expect(pickRelevantWindow([win({ status: 'in_progress', scheduledStart: '2026-06-26T01:13:00Z', scheduledEnd: '2026-06-27T01:13:00Z' })], NOW)).toBeNull();
  });
  it('shows an imminent window and ignores one days away', () => {
    expect(pickRelevantWindow([win({})], NOW)?.id).toBe('w');
    expect(pickRelevantWindow([win({ scheduledStart: '2026-11-09T00:00:00Z', scheduledEnd: '2026-11-09T02:00:00Z' })], NOW)).toBeNull();
  });
  it('ignores cancelled/completed windows', () => {
    expect(pickRelevantWindow([win({ status: 'cancelled' }), win({ status: 'completed' })], NOW)).toBeNull();
  });
});
