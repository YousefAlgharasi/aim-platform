// P3-048 — Add Curriculum Backend Tests
// SkillsController unit tests.

import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

const makeMockService = (): jest.Mocked<
  Pick<SkillsService, 'listSkills' | 'getSkillByKey' | 'getSkill' | 'createSkill' | 'updateSkill'>
> => ({
  listSkills: jest.fn(),
  getSkillByKey: jest.fn(),
  getSkill: jest.fn(),
  createSkill: jest.fn(),
  updateSkill: jest.fn(),
});

describe('SkillsController', () => {
  describe('listSkills', () => {
    it('delegates with parsed pagination and optional filters', async () => {
      const svc = makeMockService();
      svc.listSkills.mockResolvedValue({ skills: [], total: 0 } as any);
      const ctrl = new SkillsController(svc as unknown as SkillsService);

      await ctrl.listSkills('2', '10', 'math', 'published', 'algebra');

      expect(svc.listSkills).toHaveBeenCalledWith(2, 10, 'math', 'published', 'algebra');
    });

    it('falls back to page 1 limit 20 for non-numeric params', async () => {
      const svc = makeMockService();
      svc.listSkills.mockResolvedValue({ skills: [], total: 0 } as any);
      const ctrl = new SkillsController(svc as unknown as SkillsService);

      await ctrl.listSkills('x', 'y');

      expect(svc.listSkills).toHaveBeenCalledWith(1, 20, undefined, undefined, undefined);
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { skills: [{ id: 's1' }], total: 1 } as any;
      svc.listSkills.mockResolvedValue(expected);
      const ctrl = new SkillsController(svc as unknown as SkillsService);

      expect(await ctrl.listSkills('1', '20')).toBe(expected);
    });
  });

  describe('getSkillByKey', () => {
    it('delegates to SkillsService with the given key', async () => {
      const svc = makeMockService();
      svc.getSkillByKey.mockResolvedValue({ id: 's1', key: 'math.algebra' } as any);
      const ctrl = new SkillsController(svc as unknown as SkillsService);

      await ctrl.getSkillByKey('math.algebra');

      expect(svc.getSkillByKey).toHaveBeenCalledWith('math.algebra');
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 's1', key: 'math.algebra' } as any;
      svc.getSkillByKey.mockResolvedValue(expected);
      const ctrl = new SkillsController(svc as unknown as SkillsService);

      expect(await ctrl.getSkillByKey('math.algebra')).toBe(expected);
    });
  });

  describe('getSkill', () => {
    it('delegates to SkillsService with id', async () => {
      const svc = makeMockService();
      svc.getSkill.mockResolvedValue({ id: 'uuid-1' } as any);
      const ctrl = new SkillsController(svc as unknown as SkillsService);

      await ctrl.getSkill('uuid-1');

      expect(svc.getSkill).toHaveBeenCalledWith('uuid-1');
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'uuid-1', title: 'Algebra' } as any;
      svc.getSkill.mockResolvedValue(expected);
      const ctrl = new SkillsController(svc as unknown as SkillsService);

      expect(await ctrl.getSkill('uuid-1')).toBe(expected);
    });
  });

  describe('createSkill', () => {
    it('delegates to SkillsService with the request body', async () => {
      const svc = makeMockService();
      svc.createSkill.mockResolvedValue({ id: 'new' } as any);
      const ctrl = new SkillsController(svc as unknown as SkillsService);

      await ctrl.createSkill({ title: 'Algebra', key: 'math.algebra' } as any);

      expect(svc.createSkill).toHaveBeenCalledWith({ title: 'Algebra', key: 'math.algebra' });
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'new-uuid', status: 'draft' } as any;
      svc.createSkill.mockResolvedValue(expected);
      const ctrl = new SkillsController(svc as unknown as SkillsService);

      expect(await ctrl.createSkill({} as any)).toBe(expected);
    });
  });

  describe('updateSkill', () => {
    it('delegates to SkillsService with id and body', async () => {
      const svc = makeMockService();
      svc.updateSkill.mockResolvedValue({ id: 'uuid-1' } as any);
      const ctrl = new SkillsController(svc as unknown as SkillsService);

      await ctrl.updateSkill('uuid-1', { title: 'Updated' });

      expect(svc.updateSkill).toHaveBeenCalledWith('uuid-1', { title: 'Updated' });
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'uuid-1', title: 'Updated' } as any;
      svc.updateSkill.mockResolvedValue(expected);
      const ctrl = new SkillsController(svc as unknown as SkillsService);

      expect(await ctrl.updateSkill('uuid-1', {})).toBe(expected);
    });
  });
});
