// P3-048 — Add Curriculum Backend Tests
// LevelsController unit tests.

import { LevelsController } from './levels.controller';
import { LevelsService } from './levels.service';

const makeMockService = (): jest.Mocked<
  Pick<LevelsService, 'listLevels' | 'getLevel' | 'createLevel' | 'updateLevel'>
> => ({
  listLevels: jest.fn(),
  getLevel: jest.fn(),
  createLevel: jest.fn(),
  updateLevel: jest.fn(),
});

describe('LevelsController', () => {
  describe('listLevels', () => {
    it('delegates to LevelsService with courseId and parsed pagination', async () => {
      const svc = makeMockService();
      svc.listLevels.mockResolvedValue({ levels: [], total: 0 } as any);
      const ctrl = new LevelsController(svc as unknown as LevelsService);

      await ctrl.listLevels('course-uuid', '2', '10', 'published', 'intro');

      expect(svc.listLevels).toHaveBeenCalledWith('course-uuid', 2, 10, 'published', 'intro');
    });

    it('falls back to page 1 and limit 20 for non-numeric params', async () => {
      const svc = makeMockService();
      svc.listLevels.mockResolvedValue({ levels: [], total: 0 } as any);
      const ctrl = new LevelsController(svc as unknown as LevelsService);

      await ctrl.listLevels('course-uuid', 'abc', 'xyz');

      expect(svc.listLevels).toHaveBeenCalledWith('course-uuid', 1, 20, undefined, undefined);
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { levels: [{ id: 'l1' }], total: 1 } as any;
      svc.listLevels.mockResolvedValue(expected);
      const ctrl = new LevelsController(svc as unknown as LevelsService);

      const result = await ctrl.listLevels('course-uuid', '1', '20');

      expect(result).toBe(expected);
    });
  });

  describe('getLevel', () => {
    it('delegates to LevelsService with the given id', async () => {
      const svc = makeMockService();
      svc.getLevel.mockResolvedValue({ id: 'uuid-1' } as any);
      const ctrl = new LevelsController(svc as unknown as LevelsService);

      await ctrl.getLevel('uuid-1');

      expect(svc.getLevel).toHaveBeenCalledWith('uuid-1');
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'uuid-1', title: 'Level A' } as any;
      svc.getLevel.mockResolvedValue(expected);
      const ctrl = new LevelsController(svc as unknown as LevelsService);

      expect(await ctrl.getLevel('uuid-1')).toBe(expected);
    });
  });

  describe('createLevel', () => {
    it('merges courseId from route param into the body', async () => {
      const svc = makeMockService();
      svc.createLevel.mockResolvedValue({ id: 'new' } as any);
      const ctrl = new LevelsController(svc as unknown as LevelsService);

      await ctrl.createLevel('course-uuid', { title: 'Level 1' } as any);

      expect(svc.createLevel).toHaveBeenCalledWith({
        title: 'Level 1',
        courseId: 'course-uuid',
      });
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'new-uuid', status: 'draft' } as any;
      svc.createLevel.mockResolvedValue(expected);
      const ctrl = new LevelsController(svc as unknown as LevelsService);

      expect(await ctrl.createLevel('c', {} as any)).toBe(expected);
    });
  });

  describe('updateLevel', () => {
    it('delegates to LevelsService with id and body', async () => {
      const svc = makeMockService();
      svc.updateLevel.mockResolvedValue({ id: 'uuid-1' } as any);
      const ctrl = new LevelsController(svc as unknown as LevelsService);

      await ctrl.updateLevel('uuid-1', { title: 'Updated' });

      expect(svc.updateLevel).toHaveBeenCalledWith('uuid-1', { title: 'Updated' });
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'uuid-1', title: 'Updated' } as any;
      svc.updateLevel.mockResolvedValue(expected);
      const ctrl = new LevelsController(svc as unknown as LevelsService);

      expect(await ctrl.updateLevel('uuid-1', {})).toBe(expected);
    });
  });
});
