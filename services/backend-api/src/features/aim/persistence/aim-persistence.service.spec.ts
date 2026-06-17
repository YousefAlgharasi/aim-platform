// Phase 5 — P5-058
// AimPersistenceService tests (wiring of WeaknessUpdateService only).
//
// Covers:
//   - Calls WeaknessUpdateService.upsertMany with studentId + weaknessRecords
//   - Skips the call when weaknessRecords is empty
//   - Does not call WeaknessUpdateService when categories has no weakness entries

import { AimPersistenceService } from './aim-persistence.service';
import { WeaknessUpdateService } from './weakness-update.service';
import { AimValidatedResponse } from '../adapter/aim-response-mapper.types';

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';

function makeValidatedResponse(
  overrides: Partial<AimValidatedResponse> = {},
): AimValidatedResponse {
  return {
    backendRequestId: '550e8400-e29b-41d4-a716-446655440000',
    contractVersion: '1.0',
    studentId: STUDENT_ID,
    sessionId: '660e8400-e29b-41d4-a716-446655440001',
    generatedAt: '2026-06-17T10:30:05Z',
    categories: {
      skillState: [],
      weaknessRecords: [],
      difficultyDecision: null,
      recommendations: [],
      reviewSchedule: [],
      sessionSummary: null,
    },
    droppedValidationCodes: [],
    ...overrides,
  };
}

describe('AimPersistenceService.persist', () => {
  it('calls WeaknessUpdateService.upsertMany with studentId and weaknessRecords', async () => {
    const weaknessUpdate = {
      upsertMany: jest.fn().mockResolvedValue(undefined),
    } as unknown as WeaknessUpdateService;
    const svc = new AimPersistenceService(weaknessUpdate);

    const weaknessRecord = {
      weaknessId: 'bb0e8400-e29b-41d4-a716-446655440006',
      skillId: 'skill:arabic:p1:grammar',
      severity: 'developing' as const,
      status: 'open' as const,
      triggerAttemptIds: ['880e8400-e29b-41d4-a716-446655440003'],
      detectedAt: '2026-06-17T10:30:00Z',
      resolvedAt: null,
    };

    const response = makeValidatedResponse({
      categories: {
        skillState: [],
        weaknessRecords: [weaknessRecord],
        difficultyDecision: null,
        recommendations: [],
        reviewSchedule: [],
        sessionSummary: null,
      },
    });

    await svc.persist(response);

    expect(weaknessUpdate.upsertMany).toHaveBeenCalledWith(STUDENT_ID, [weaknessRecord]);
  });

  it('does not call WeaknessUpdateService.upsertMany when weaknessRecords is empty', async () => {
    const weaknessUpdate = {
      upsertMany: jest.fn().mockResolvedValue(undefined),
    } as unknown as WeaknessUpdateService;
    const svc = new AimPersistenceService(weaknessUpdate);

    await svc.persist(makeValidatedResponse());

    expect(weaknessUpdate.upsertMany).not.toHaveBeenCalled();
  });

  it('does not throw when persisting an empty-categories response', async () => {
    const weaknessUpdate = {
      upsertMany: jest.fn().mockResolvedValue(undefined),
    } as unknown as WeaknessUpdateService;
    const svc = new AimPersistenceService(weaknessUpdate);

    await expect(svc.persist(makeValidatedResponse())).resolves.toBeUndefined();
  });
});
