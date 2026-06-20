// P12-039: Create Parent Notification Preferences API
// ParentNotificationPreferenceService unit tests.

import { ParentNotificationPreferenceService } from './parent-notification-preference.service';

const PARENT_ID = 'parent-uuid-001';

function buildRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'pref-1',
    parent_id: PARENT_ID,
    channel: 'email',
    category: 'progress_update',
    enabled: true,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

function buildService(overrides: {
  findNotificationPreferencesByParent?: jest.Mock;
  upsertNotificationPreference?: jest.Mock;
} = {}) {
  const parentRepository = {
    findNotificationPreferencesByParent:
      overrides.findNotificationPreferencesByParent ?? jest.fn().mockResolvedValue([buildRow()]),
    upsertNotificationPreference:
      overrides.upsertNotificationPreference ?? jest.fn().mockResolvedValue(buildRow({ enabled: false })),
  };

  const service = new ParentNotificationPreferenceService(parentRepository as never);

  return { service, parentRepository };
}

describe('ParentNotificationPreferenceService', () => {
  describe('listPreferencesForParent', () => {
    it('maps preference rows to entities for the given parent', async () => {
      const { service, parentRepository } = buildService();

      const result = await service.listPreferencesForParent(PARENT_ID);

      expect(parentRepository.findNotificationPreferencesByParent).toHaveBeenCalledWith(PARENT_ID);
      expect(result).toEqual([
        {
          id: 'pref-1',
          parentId: PARENT_ID,
          channel: 'email',
          category: 'progress_update',
          enabled: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);
    });
  });

  describe('updatePreference', () => {
    it('upserts the preference and returns the updated entity', async () => {
      const { service, parentRepository } = buildService();

      const result = await service.updatePreference(PARENT_ID, 'email', 'progress_update', false);

      expect(parentRepository.upsertNotificationPreference).toHaveBeenCalledWith(
        PARENT_ID,
        'email',
        'progress_update',
        false,
      );
      expect(result.enabled).toBe(false);
    });
  });
});
