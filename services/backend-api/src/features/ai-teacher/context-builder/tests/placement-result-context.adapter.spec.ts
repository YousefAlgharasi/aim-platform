// P8-032: Add Placement Result Context
// PlacementResultContextAdapter tests.

import { PlacementResultContextAdapter } from '../adapters/placement-result-context.adapter';
import { PlacementResultReadService } from '../../../placement/placement-result-read.service';

function makeMockPlacementResultRead(
  getLatestResultForStudent: PlacementResultReadService['getLatestResultForStudent'],
) {
  return { getLatestResultForStudent } as unknown as PlacementResultReadService;
}

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';

describe('PlacementResultContextAdapter', () => {
  it('maps a found placement result to estimatedLevel, skillSummary, completedAt only', async () => {
    const placementResultRead = makeMockPlacementResultRead(async () => ({
      resultId: 'result-1',
      attemptId: 'attempt-1',
      estimatedLevel: 'B1',
      skillSummary: [{ skillCode: 'grammar', skillName: 'Grammar', signal: 'developing' }],
      initialPathReady: true,
      completedAt: '2026-06-01T00:00:00Z',
    }));
    const adapter = new PlacementResultContextAdapter(placementResultRead);
    const context = await adapter.getPlacementResultContext(STUDENT_ID);

    expect(context).toEqual({
      estimatedLevel: 'B1',
      skillSummary: [{ skillCode: 'grammar', skillName: 'Grammar', signal: 'developing' }],
      completedAt: '2026-06-01T00:00:00Z',
    });
    // resultId, attemptId, initialPathReady are not part of AI Teacher prompt context.
    expect(context).not.toHaveProperty('resultId');
    expect(context).not.toHaveProperty('attemptId');
    expect(context).not.toHaveProperty('initialPathReady');
  });

  it('returns null when the student has no completed placement attempt', async () => {
    const placementResultRead = makeMockPlacementResultRead(async () => null);
    const adapter = new PlacementResultContextAdapter(placementResultRead);
    const context = await adapter.getPlacementResultContext(STUDENT_ID);
    expect(context).toBeNull();
  });

  it('passes studentId through to PlacementResultReadService.getLatestResultForStudent unchanged', async () => {
    const calls: string[] = [];
    const placementResultRead = makeMockPlacementResultRead(async (id) => {
      calls.push(id);
      return null;
    });
    const adapter = new PlacementResultContextAdapter(placementResultRead);
    await adapter.getPlacementResultContext(STUDENT_ID);
    expect(calls).toEqual([STUDENT_ID]);
  });
});
