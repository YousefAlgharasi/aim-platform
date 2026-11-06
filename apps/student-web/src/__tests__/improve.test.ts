// react-router-dom v7 cannot be loaded by CRA's Jest; mock it (only the pure helper is tested).
jest.mock('react-router-dom', () => ({ Link: ({ children }: { children: unknown }) => children, useNavigate: () => jest.fn() }));

import { buildWeakSpots } from '../features/improve/ImprovePage';
import type { AimResults } from '../features/progress/aimApi';

jest.mock('../i18n/I18nContext', () => ({ useI18n: () => ({ t: (s: string) => s }) }));

const skill = (skillId: string, masteryScore: number) =>
  ({ skillId, masteryScore, masteryConfidence: 0.5, masteryTrend: 'stable' }) as never;
const weak = (skillId: string, severity: string, status = 'open') =>
  ({ weaknessId: skillId, skillId, severity, status, triggerAttemptIds: ['a'], detectedAt: '2026-01-01', resolvedAt: null }) as never;

describe('buildWeakSpots', () => {
  const data: AimResults = {
    skillStates: [skill('s:grammar', 0.4), skill('s:vocab', 0.2), skill('s:listening', 0.9), skill('s:reading', 0.45)],
    weaknessRecords: [weak('s:grammar', 'developing'), weak('s:listening', 'critical', 'resolved'), weak('s:spelling', 'critical')],
    reviewSchedules: [],
    recommendations: [{ id: 'r', rank: 1, targetSkillId: 's:grammar', targetLessonId: 'L1' } as never],
  };
  const spots = buildWeakSpots(data);

  it('skips resolved weaknesses and strong skills', () => {
    expect(spots.map((s) => s.skillId)).not.toContain('s:listening');
  });
  it('adds low-mastery skills that have no weakness record', () => {
    expect(spots.map((s) => s.skillId)).toEqual(expect.arrayContaining(['s:vocab', 's:reading']));
  });
  it('orders by severity then mastery, and links the recommended lesson', () => {
    expect(spots[0].severity).toBe('critical');
    expect(spots.find((s) => s.skillId === 's:grammar')?.lessonId).toBe('L1');
  });
});
