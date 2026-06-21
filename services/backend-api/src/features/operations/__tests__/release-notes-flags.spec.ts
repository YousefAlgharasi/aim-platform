import { NotFoundException } from '@nestjs/common';
import { ReleaseNotesService } from '../release-notes.service';
import { FeatureFlagService } from '../feature-flag.service';
import { ReleaseNote, FeatureFlag } from '../operations.entities';

const mockAuditService = {
  logAction: jest.fn(),
};

describe('ReleaseNotesService', () => {
  let service: ReleaseNotesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReleaseNotesService(mockAuditService as any);
  });

  describe('createDraft', () => {
    it('should create a release note draft', async () => {
      mockAuditService.logAction.mockResolvedValue({});

      const result = await service.createDraft(
        {
          title: 'v2.1.0 Release',
          body: 'New features and improvements',
          version: '2.1.0',
          audience: 'all',
        },
        'admin-1',
      );

      expect(result.title).toBe('v2.1.0 Release');
      expect(result.version).toBe('2.1.0');
      expect(result.status).toBe('draft');
      expect(result.createdBy).toBe('admin-1');
      expect(result.publishedAt).toBeNull();
      expect(result.publishedBy).toBeNull();
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'admin-1',
        'release_note.draft_created',
        'release_note',
        expect.any(String),
        expect.objectContaining({ title: 'v2.1.0 Release', version: '2.1.0' }),
      );
    });

    it('should handle missing body', async () => {
      mockAuditService.logAction.mockResolvedValue({});

      const result = await service.createDraft(
        {
          title: 'Quick patch',
          version: '2.1.1',
          audience: 'internal',
        },
        'admin-1',
      );

      expect(result.body).toBeNull();
    });
  });

  describe('getDrafts', () => {
    it('should return empty array (stub implementation)', async () => {
      const result = await service.getDrafts('admin-1');

      expect(result).toEqual([]);
    });
  });

  describe('getPublished', () => {
    it('should return empty array (stub implementation)', async () => {
      const result = await service.getPublished();

      expect(result).toEqual([]);
    });

    it('should accept optional audience filter', async () => {
      const result = await service.getPublished('students');

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should throw NotFoundException (stub implementation)', async () => {
      await expect(service.getById('note-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('publish', () => {
    it('should throw NotFoundException when note does not exist (stub)', async () => {
      await expect(service.publish('nonexistent-id', 'admin-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('archive', () => {
    it('should throw NotFoundException when note does not exist (stub)', async () => {
      await expect(service.archive('nonexistent-id', 'admin-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FeatureFlagService(mockAuditService as any);
  });

  describe('createFlag', () => {
    it('should create a feature flag and log audit', async () => {
      mockAuditService.logAction.mockResolvedValue({});

      const result = await service.createFlag(
        {
          flagKey: 'dark_mode',
          name: 'Dark Mode',
          description: 'Enable dark mode UI',
          enabled: false,
          rolloutPercentage: 0,
        },
        'admin-1',
      );

      expect(result.flagKey).toBe('dark_mode');
      expect(result.name).toBe('Dark Mode');
      expect(result.enabled).toBe(false);
      expect(result.rolloutPercentage).toBe(0);
      expect(result.ownerId).toBe('admin-1');
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'admin-1',
        'feature_flag.created',
        'feature_flag',
        expect.any(String),
        expect.objectContaining({ flagKey: 'dark_mode', name: 'Dark Mode' }),
      );
    });
  });

  describe('getFlags', () => {
    it('should return empty array (stub implementation)', async () => {
      const result = await service.getFlags('admin-1');

      expect(result).toEqual([]);
    });
  });

  describe('getFlagByKey', () => {
    it('should throw NotFoundException (stub implementation)', async () => {
      await expect(service.getFlagByKey('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateFlag', () => {
    it('should throw NotFoundException when flag does not exist (stub)', async () => {
      await expect(
        service.updateFlag('nonexistent', { enabled: true }, 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('evaluateFlag', () => {
    it('should return false for nonexistent flags', async () => {
      const result = await service.evaluateFlag('nonexistent_flag');

      expect(result).toBe(false);
    });

    it('should return false for nonexistent flags with context', async () => {
      const result = await service.evaluateFlag('nonexistent_flag', {
        userId: 'user-1',
        role: 'student',
      });

      expect(result).toBe(false);
    });
  });
});
