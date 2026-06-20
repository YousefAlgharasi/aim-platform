// P3-048 — Add Curriculum Backend Tests
// ObjectivesController unit tests.

import { ObjectivesController } from './objectives.controller';
import { ObjectivesService } from './objectives.service';

const makeMockService = (): jest.Mocked<
  Pick<
    ObjectivesService,
    'listObjectives' | 'getObjectiveByKey' | 'getObjective' | 'createObjective' | 'updateObjective'
  >
> => ({
  listObjectives: jest.fn(),
  getObjectiveByKey: jest.fn(),
  getObjective: jest.fn(),
  createObjective: jest.fn(),
  updateObjective: jest.fn(),
});

describe('ObjectivesController', () => {
  describe('listObjectives', () => {
    it('delegates with parsed pagination and optional status filter', async () => {
      const svc = makeMockService();
      svc.listObjectives.mockResolvedValue({ objectives: [], total: 0 } as any);
      const ctrl = new ObjectivesController(svc as unknown as ObjectivesService);

      await ctrl.listObjectives('2', '5', 'published');

      expect(svc.listObjectives).toHaveBeenCalledWith(2, 5, 'published');
    });

    it('falls back to page 1 and limit 20 for non-numeric params', async () => {
      const svc = makeMockService();
      svc.listObjectives.mockResolvedValue({ objectives: [], total: 0 } as any);
      const ctrl = new ObjectivesController(svc as unknown as ObjectivesService);

      await ctrl.listObjectives('abc', 'xyz');

      expect(svc.listObjectives).toHaveBeenCalledWith(1, 20, undefined);
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { objectives: [{ id: 'o1' }], total: 1 } as any;
      svc.listObjectives.mockResolvedValue(expected);
      const ctrl = new ObjectivesController(svc as unknown as ObjectivesService);

      expect(await ctrl.listObjectives('1', '20')).toBe(expected);
    });
  });

  describe('getObjectiveByKey', () => {
    it('delegates to ObjectivesService with the key', async () => {
      const svc = makeMockService();
      svc.getObjectiveByKey.mockResolvedValue({ id: 'o1', key: 'obj.read' } as any);
      const ctrl = new ObjectivesController(svc as unknown as ObjectivesService);

      await ctrl.getObjectiveByKey('obj.read');

      expect(svc.getObjectiveByKey).toHaveBeenCalledWith('obj.read');
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'o1', key: 'obj.read' } as any;
      svc.getObjectiveByKey.mockResolvedValue(expected);
      const ctrl = new ObjectivesController(svc as unknown as ObjectivesService);

      expect(await ctrl.getObjectiveByKey('obj.read')).toBe(expected);
    });
  });

  describe('getObjective', () => {
    it('delegates to ObjectivesService with id', async () => {
      const svc = makeMockService();
      svc.getObjective.mockResolvedValue({ id: 'uuid-1' } as any);
      const ctrl = new ObjectivesController(svc as unknown as ObjectivesService);

      await ctrl.getObjective('uuid-1');

      expect(svc.getObjective).toHaveBeenCalledWith('uuid-1');
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'uuid-1', title: 'Read well' } as any;
      svc.getObjective.mockResolvedValue(expected);
      const ctrl = new ObjectivesController(svc as unknown as ObjectivesService);

      expect(await ctrl.getObjective('uuid-1')).toBe(expected);
    });
  });

  describe('createObjective', () => {
    it('delegates to ObjectivesService with the request body', async () => {
      const svc = makeMockService();
      svc.createObjective.mockResolvedValue({ id: 'new' } as any);
      const ctrl = new ObjectivesController(svc as unknown as ObjectivesService);

      await ctrl.createObjective({ title: 'Read well', key: 'obj.read' } as any);

      expect(svc.createObjective).toHaveBeenCalledWith({ title: 'Read well', key: 'obj.read' });
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'new-uuid', status: 'draft' } as any;
      svc.createObjective.mockResolvedValue(expected);
      const ctrl = new ObjectivesController(svc as unknown as ObjectivesService);

      expect(await ctrl.createObjective({} as any)).toBe(expected);
    });
  });

  describe('updateObjective', () => {
    it('delegates to ObjectivesService with id and body', async () => {
      const svc = makeMockService();
      svc.updateObjective.mockResolvedValue({ id: 'uuid-1' } as any);
      const ctrl = new ObjectivesController(svc as unknown as ObjectivesService);

      await ctrl.updateObjective('uuid-1', { title: 'Updated' });

      expect(svc.updateObjective).toHaveBeenCalledWith('uuid-1', { title: 'Updated' });
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'uuid-1', title: 'Updated' } as any;
      svc.updateObjective.mockResolvedValue(expected);
      const ctrl = new ObjectivesController(svc as unknown as ObjectivesService);

      expect(await ctrl.updateObjective('uuid-1', {})).toBe(expected);
    });
  });
});
