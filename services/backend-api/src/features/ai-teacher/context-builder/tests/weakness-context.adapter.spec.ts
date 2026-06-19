// P8-034: Add Weakness Context
// WeaknessContextAdapter tests.

import { WeaknessContextAdapter } from '../adapters/weakness-context.adapter';
import { WeaknessRecordsReadService } from '../../../aim/result/weakness-records-read.service';

function makeMockWeaknessRecordsRead(
  getWeaknessRecordsForStudent: WeaknessRecordsReadService['getWeaknessRecordsForStudent'],
) {
  return { getWeaknessRecordsForStudent } as unknown as WeaknessRecordsReadService;
}

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';

describe('WeaknessContextAdapter', () => {
  it('maps active weakness records to skillId, severity, status, detectedAt only', async () => {
    const weaknessRecordsRead = makeMockWeaknessRecordsRead(async () => ({
      studentId: STUDENT_ID,
      weaknessRecords: [
        {
          weaknessId: 'weakness-1',
          skillId: 'skill-1',
          severity: 'high',
          status: 'open',
          triggerAttemptIds: ['attempt-1', 'attempt-2'],
          detectedAt: '2026-06-01T00:00:00Z',
          resolvedAt: null,
          updatedAt: '2026-06-01T00:00:00Z',
        },
      ],
    }));
    const adapter = new WeaknessContextAdapter(weaknessRecordsRead);
    const context = await adapter.getWeaknessContext(STUDENT_ID);

    expect(context).toEqual([
      { skillId: 'skill-1', severity: 'high', status: 'open', detectedAt: '2026-06-01T00:00:00Z' },
    ]);
    expect(context?.[0]).not.toHaveProperty('weaknessId');
    expect(context?.[0]).not.toHaveProperty('triggerAttemptIds');
    expect(context?.[0]).not.toHaveProperty('resolvedAt');
    expect(context?.[0]).not.toHaveProperty('updatedAt');
  });

  it('excludes resolved weakness records', async () => {
    const weaknessRecordsRead = makeMockWeaknessRecordsRead(async () => ({
      studentId: STUDENT_ID,
      weaknessRecords: [
        {
          weaknessId: 'weakness-1',
          skillId: 'skill-1',
          severity: 'low',
          status: 'resolved',
          triggerAttemptIds: [],
          detectedAt: '2026-06-01T00:00:00Z',
          resolvedAt: '2026-06-02T00:00:00Z',
          updatedAt: '2026-06-02T00:00:00Z',
        },
      ],
    }));
    const adapter = new WeaknessContextAdapter(weaknessRecordsRead);
    const context = await adapter.getWeaknessContext(STUDENT_ID);
    expect(context).toBeNull();
  });

  it('returns null when the student has no weakness records', async () => {
    const weaknessRecordsRead = makeMockWeaknessRecordsRead(async () => ({
      studentId: STUDENT_ID,
      weaknessRecords: [],
    }));
    const adapter = new WeaknessContextAdapter(weaknessRecordsRead);
    const context = await adapter.getWeaknessContext(STUDENT_ID);
    expect(context).toBeNull();
  });

  it('passes studentId through to WeaknessRecordsReadService.getWeaknessRecordsForStudent unchanged', async () => {
    const calls: string[] = [];
    const weaknessRecordsRead = makeMockWeaknessRecordsRead(async (id) => {
      calls.push(id);
      return { studentId: id, weaknessRecords: [] };
    });
    const adapter = new WeaknessContextAdapter(weaknessRecordsRead);
    await adapter.getWeaknessContext(STUDENT_ID);
    expect(calls).toEqual([STUDENT_ID]);
  });
});
