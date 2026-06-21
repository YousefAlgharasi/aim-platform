// P3-048 — Add Curriculum Backend Tests
// ChaptersController unit tests.

import { ChaptersController } from './chapters.controller';
import { ChaptersService } from './chapters.service';

const makeMockService = (): jest.Mocked<
  Pick<ChaptersService, 'listChapters' | 'getChapter' | 'createChapter' | 'updateChapter'>
> => ({
  listChapters: jest.fn(),
  getChapter: jest.fn(),
  createChapter: jest.fn(),
  updateChapter: jest.fn(),
});

describe('ChaptersController', () => {
  describe('listChapters', () => {
    it('delegates to ChaptersService with parsed pagination and optional filters', async () => {
      const svc = makeMockService();
      svc.listChapters.mockResolvedValue({ chapters: [], total: 0 } as any);
      const ctrl = new ChaptersController(svc as unknown as ChaptersService);

      await ctrl.listChapters('level-uuid', '3', '15', 'draft', 'chapter1');

      expect(svc.listChapters).toHaveBeenCalledWith(3, 15, 'level-uuid', 'draft', 'chapter1');
    });

    it('falls back to page 1 and limit 20 for non-numeric params', async () => {
      const svc = makeMockService();
      svc.listChapters.mockResolvedValue({ chapters: [], total: 0 } as any);
      const ctrl = new ChaptersController(svc as unknown as ChaptersService);

      await ctrl.listChapters(undefined, 'x', 'y');

      expect(svc.listChapters).toHaveBeenCalledWith(1, 20, undefined, undefined, undefined);
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { chapters: [{ id: 'ch1' }], total: 1 } as any;
      svc.listChapters.mockResolvedValue(expected);
      const ctrl = new ChaptersController(svc as unknown as ChaptersService);

      expect(await ctrl.listChapters(undefined, '1', '20')).toBe(expected);
    });
  });

  describe('getChapter', () => {
    it('delegates to ChaptersService with the given id', async () => {
      const svc = makeMockService();
      svc.getChapter.mockResolvedValue({ id: 'uuid-1' } as any);
      const ctrl = new ChaptersController(svc as unknown as ChaptersService);

      await ctrl.getChapter('uuid-1');

      expect(svc.getChapter).toHaveBeenCalledWith('uuid-1');
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'uuid-1', title: 'Chapter A' } as any;
      svc.getChapter.mockResolvedValue(expected);
      const ctrl = new ChaptersController(svc as unknown as ChaptersService);

      expect(await ctrl.getChapter('uuid-1')).toBe(expected);
    });
  });

  describe('createChapter', () => {
    it('delegates to ChaptersService with the request body', async () => {
      const svc = makeMockService();
      svc.createChapter.mockResolvedValue({ id: 'new' } as any);
      const ctrl = new ChaptersController(svc as unknown as ChaptersService);

      await ctrl.createChapter({ title: 'Chapter 1', levelId: 'level-uuid' } as any);

      expect(svc.createChapter).toHaveBeenCalledWith({
        title: 'Chapter 1',
        levelId: 'level-uuid',
      });
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'new-uuid', status: 'draft' } as any;
      svc.createChapter.mockResolvedValue(expected);
      const ctrl = new ChaptersController(svc as unknown as ChaptersService);

      expect(await ctrl.createChapter({} as any)).toBe(expected);
    });
  });

  describe('updateChapter', () => {
    it('delegates to ChaptersService with id and body', async () => {
      const svc = makeMockService();
      svc.updateChapter.mockResolvedValue({ id: 'uuid-1' } as any);
      const ctrl = new ChaptersController(svc as unknown as ChaptersService);

      await ctrl.updateChapter('uuid-1', { title: 'Updated' });

      expect(svc.updateChapter).toHaveBeenCalledWith('uuid-1', { title: 'Updated' });
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'uuid-1', title: 'Updated' } as any;
      svc.updateChapter.mockResolvedValue(expected);
      const ctrl = new ChaptersController(svc as unknown as ChaptersService);

      expect(await ctrl.updateChapter('uuid-1', {})).toBe(expected);
    });
  });
});
