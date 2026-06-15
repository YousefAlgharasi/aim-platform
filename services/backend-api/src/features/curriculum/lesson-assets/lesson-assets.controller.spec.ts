// P3-048 — Add Curriculum Backend Tests
// LessonAssetsController unit tests.

import { LessonAssetsController } from './lesson-assets.controller';
import { LessonAssetsService } from './lesson-assets.service';

const makeMockService = (): jest.Mocked<
  Pick<
    LessonAssetsService,
    'listAssets' | 'getAsset' | 'createAsset' | 'updateAsset' | 'archiveAsset'
  >
> => ({
  listAssets: jest.fn(),
  getAsset: jest.fn(),
  createAsset: jest.fn(),
  updateAsset: jest.fn(),
  archiveAsset: jest.fn(),
});

describe('LessonAssetsController', () => {
  describe('listAssets', () => {
    it('delegates with parsed pagination and optional filters', async () => {
      const svc = makeMockService();
      svc.listAssets.mockResolvedValue({ assets: [], total: 0 } as any);
      const ctrl = new LessonAssetsController(svc as unknown as LessonAssetsService);

      await ctrl.listAssets('lesson-uuid', '2', '5', 'draft');

      expect(svc.listAssets).toHaveBeenCalledWith(2, 5, 'lesson-uuid', 'draft');
    });

    it('falls back to page 1 and limit 20 for non-numeric params', async () => {
      const svc = makeMockService();
      svc.listAssets.mockResolvedValue({ assets: [], total: 0 } as any);
      const ctrl = new LessonAssetsController(svc as unknown as LessonAssetsService);

      await ctrl.listAssets(undefined, 'abc', 'xyz');

      expect(svc.listAssets).toHaveBeenCalledWith(1, 20, undefined, undefined);
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { assets: [{ id: 'a1' }], total: 1 } as any;
      svc.listAssets.mockResolvedValue(expected);
      const ctrl = new LessonAssetsController(svc as unknown as LessonAssetsService);

      expect(await ctrl.listAssets(undefined, '1', '20')).toBe(expected);
    });
  });

  describe('getAsset', () => {
    it('delegates to LessonAssetsService with id', async () => {
      const svc = makeMockService();
      svc.getAsset.mockResolvedValue({ id: 'uuid-1' } as any);
      const ctrl = new LessonAssetsController(svc as unknown as LessonAssetsService);

      await ctrl.getAsset('uuid-1');

      expect(svc.getAsset).toHaveBeenCalledWith('uuid-1');
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'uuid-1', assetType: 'video' } as any;
      svc.getAsset.mockResolvedValue(expected);
      const ctrl = new LessonAssetsController(svc as unknown as LessonAssetsService);

      expect(await ctrl.getAsset('uuid-1')).toBe(expected);
    });
  });

  describe('createAsset', () => {
    it('delegates to LessonAssetsService with the request body', async () => {
      const svc = makeMockService();
      svc.createAsset.mockResolvedValue({ id: 'new' } as any);
      const ctrl = new LessonAssetsController(svc as unknown as LessonAssetsService);

      await ctrl.createAsset({ lessonId: 'l-uuid', assetType: 'video', url: 'http://x' } as any);

      expect(svc.createAsset).toHaveBeenCalledWith({
        lessonId: 'l-uuid',
        assetType: 'video',
        url: 'http://x',
      });
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'new-uuid', status: 'draft' } as any;
      svc.createAsset.mockResolvedValue(expected);
      const ctrl = new LessonAssetsController(svc as unknown as LessonAssetsService);

      expect(await ctrl.createAsset({} as any)).toBe(expected);
    });
  });

  describe('updateAsset', () => {
    it('delegates to LessonAssetsService with id and body', async () => {
      const svc = makeMockService();
      svc.updateAsset.mockResolvedValue({ id: 'uuid-1' } as any);
      const ctrl = new LessonAssetsController(svc as unknown as LessonAssetsService);

      await ctrl.updateAsset('uuid-1', { url: 'http://updated' } as any);

      expect(svc.updateAsset).toHaveBeenCalledWith('uuid-1', { url: 'http://updated' });
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'uuid-1', url: 'http://updated' } as any;
      svc.updateAsset.mockResolvedValue(expected);
      const ctrl = new LessonAssetsController(svc as unknown as LessonAssetsService);

      expect(await ctrl.updateAsset('uuid-1', {} as any)).toBe(expected);
    });
  });

  describe('archiveAsset', () => {
    it('delegates to LessonAssetsService with id', async () => {
      const svc = makeMockService();
      svc.archiveAsset.mockResolvedValue({ id: 'uuid-1', status: 'archived' } as any);
      const ctrl = new LessonAssetsController(svc as unknown as LessonAssetsService);

      await ctrl.archiveAsset('uuid-1');

      expect(svc.archiveAsset).toHaveBeenCalledWith('uuid-1');
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'uuid-1', status: 'archived' } as any;
      svc.archiveAsset.mockResolvedValue(expected);
      const ctrl = new LessonAssetsController(svc as unknown as LessonAssetsService);

      expect(await ctrl.archiveAsset('uuid-1')).toBe(expected);
    });
  });
});
