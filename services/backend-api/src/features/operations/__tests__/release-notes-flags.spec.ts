import { NotFoundException } from '@nestjs/common';
import { ReleaseNotesService } from '../release-notes.service';
import { FeatureFlagService } from '../feature-flag.service';
import { ReleaseNote, FeatureFlag } from '../operations.entities';

const mockReleaseNote: ReleaseNote = {
  id: 'note-1',
  title: 'v2.1.0 Release',
  body: 'New features and improvements',
  version: '2.1.0',
  audience: 'all',
  status: 'draft',
  createdBy: 'admin-1',
  publishedAt: null,
  publishedBy: null,
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockFeatureFlag: FeatureFlag = {
  id: 'flag-1',
  flagKey: 'dark_mode',
  name: 'Dark Mode',
  description: 'Enable dark mode UI',
  enabled: false,
  rolloutPercentage: 0,
  audience: {},
  ownerId: 'admin-1',
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOpsRepo = {
  createReleaseNote: jest.fn(),
  findAllReleaseNotes: jest.fn(),
  findPublishedReleaseNotes: jest.fn(),
  findReleaseNoteById: jest.fn(),
  publishReleaseNote: jest.fn(),
  createFeatureFlag: jest.fn(),
  findAllFeatureFlags: jest.fn(),
  findFeatureFlagByKey: jest.fn(),
  updateFeatureFlag: jest.fn(),
};

const mockAuditService = {
  logAction: jest.fn(),
};

describe('ReleaseNotesService', () => {
  let service: ReleaseNotesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReleaseNotesService(mockOpsRepo as any, mockAuditService as any);
  });

  describe('createDraft', () => {
    it('should create a release note draft', async () => {
      mockOpsRepo.createReleaseNote.mockResolvedValue(mockReleaseNote);
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
      expect(mockOpsRepo.createReleaseNote).toHaveBeenCalled();
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'admin-1',
        'release_note.draft_created',
        'release_note',
        expect.any(String),
        expect.objectContaining({ title: 'v2.1.0 Release', version: '2.1.0' }),
      );
    });

    it('should handle missing body', async () => {
      mockOpsRepo.createReleaseNote.mockResolvedValue({ ...mockReleaseNote, body: null });
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
    it('should return release notes from database', async () => {
      mockOpsRepo.findAllReleaseNotes.mockResolvedValue([mockReleaseNote]);

      const result = await service.getDrafts('admin-1');

      expect(result).toEqual([mockReleaseNote]);
    });
  });

  describe('getPublished', () => {
    it('should return published release notes', async () => {
      mockOpsRepo.findPublishedReleaseNotes.mockResolvedValue([]);

      const result = await service.getPublished();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should throw NotFoundException when not found', async () => {
      mockOpsRepo.findReleaseNoteById.mockResolvedValue(null);

      await expect(service.getById('note-1')).rejects.toThrow(NotFoundException);
    });

    it('should return release note when found', async () => {
      mockOpsRepo.findReleaseNoteById.mockResolvedValue(mockReleaseNote);

      const result = await service.getById('note-1');
      expect(result).toEqual(mockReleaseNote);
    });
  });

  describe('publish', () => {
    it('should throw NotFoundException when note does not exist', async () => {
      mockOpsRepo.findReleaseNoteById.mockResolvedValue(null);

      await expect(service.publish('nonexistent-id', 'admin-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('archive', () => {
    it('should throw NotFoundException when note does not exist', async () => {
      mockOpsRepo.findReleaseNoteById.mockResolvedValue(null);

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
    service = new FeatureFlagService(mockOpsRepo as any, mockAuditService as any);
  });

  describe('createFlag', () => {
    it('should create a feature flag and log audit', async () => {
      mockOpsRepo.createFeatureFlag.mockResolvedValue(mockFeatureFlag);
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
      expect(mockOpsRepo.createFeatureFlag).toHaveBeenCalled();
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
    it('should return flags from database', async () => {
      mockOpsRepo.findAllFeatureFlags.mockResolvedValue([mockFeatureFlag]);

      const result = await service.getFlags('admin-1');

      expect(result).toEqual([mockFeatureFlag]);
    });
  });

  describe('getFlagByKey', () => {
    it('should throw NotFoundException when not found', async () => {
      mockOpsRepo.findFeatureFlagByKey.mockResolvedValue(null);

      await expect(service.getFlagByKey('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateFlag', () => {
    it('should throw NotFoundException when flag does not exist', async () => {
      mockOpsRepo.updateFeatureFlag.mockResolvedValue(null);

      await expect(
        service.updateFlag('nonexistent', { enabled: true }, 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('evaluateFlag', () => {
    it('should return false for nonexistent flags', async () => {
      mockOpsRepo.findFeatureFlagByKey.mockResolvedValue(null);

      const result = await service.evaluateFlag('nonexistent_flag');

      expect(result).toBe(false);
    });

    it('should return false for nonexistent flags with context', async () => {
      mockOpsRepo.findFeatureFlagByKey.mockResolvedValue(null);

      const result = await service.evaluateFlag('nonexistent_flag', {
        userId: 'user-1',
        role: 'student',
      });

      expect(result).toBe(false);
    });
  });
});
