// P3-048 — Add Curriculum Backend Tests
// CoursesController unit tests.

import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

const makeMockService = (): jest.Mocked<
  Pick<CoursesService, 'listCourses' | 'getCourse' | 'createCourse' | 'updateCourse'>
> => ({
  listCourses: jest.fn(),
  getCourse: jest.fn(),
  createCourse: jest.fn(),
  updateCourse: jest.fn(),
});

describe('CoursesController', () => {
  describe('listCourses', () => {
    it('delegates to CoursesService with parsed page and limit', async () => {
      const svc = makeMockService();
      svc.listCourses.mockResolvedValue({ courses: [], total: 0 } as any);
      const ctrl = new CoursesController(svc as unknown as CoursesService);

      await ctrl.listCourses('2', '50', 'draft', 'math');

      expect(svc.listCourses).toHaveBeenCalledWith(2, 50, 'draft', 'math');
    });

    it('falls back to page 1 and limit 20 for non-numeric params', async () => {
      const svc = makeMockService();
      svc.listCourses.mockResolvedValue({ courses: [], total: 0 } as any);
      const ctrl = new CoursesController(svc as unknown as CoursesService);

      await ctrl.listCourses('abc', 'xyz');

      expect(svc.listCourses).toHaveBeenCalledWith(1, 20, undefined, undefined);
    });

    it('passes undefined for optional params when not provided', async () => {
      const svc = makeMockService();
      svc.listCourses.mockResolvedValue({ courses: [], total: 0 } as any);
      const ctrl = new CoursesController(svc as unknown as CoursesService);

      await ctrl.listCourses('1', '20');

      expect(svc.listCourses).toHaveBeenCalledWith(1, 20, undefined, undefined);
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { courses: [{ id: 'c1' }], total: 1 } as any;
      svc.listCourses.mockResolvedValue(expected);
      const ctrl = new CoursesController(svc as unknown as CoursesService);

      const result = await ctrl.listCourses('1', '20');

      expect(result).toBe(expected);
    });
  });

  describe('getCourse', () => {
    it('delegates to CoursesService with the given id', async () => {
      const svc = makeMockService();
      svc.getCourse.mockResolvedValue({ id: 'uuid-1' } as any);
      const ctrl = new CoursesController(svc as unknown as CoursesService);

      await ctrl.getCourse('uuid-1');

      expect(svc.getCourse).toHaveBeenCalledWith('uuid-1');
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'uuid-1', title: 'Course A' } as any;
      svc.getCourse.mockResolvedValue(expected);
      const ctrl = new CoursesController(svc as unknown as CoursesService);

      const result = await ctrl.getCourse('uuid-1');

      expect(result).toBe(expected);
    });
  });

  describe('createCourse', () => {
    it('delegates to CoursesService with the request body', async () => {
      const svc = makeMockService();
      svc.createCourse.mockResolvedValue({ id: 'new-uuid' } as any);
      const ctrl = new CoursesController(svc as unknown as CoursesService);

      await ctrl.createCourse({ title: 'New Course' });

      expect(svc.createCourse).toHaveBeenCalledWith({ title: 'New Course' });
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'new-uuid', status: 'draft' } as any;
      svc.createCourse.mockResolvedValue(expected);
      const ctrl = new CoursesController(svc as unknown as CoursesService);

      const result = await ctrl.createCourse({ title: 'X' });

      expect(result).toBe(expected);
    });
  });

  describe('updateCourse', () => {
    it('delegates to CoursesService with id and body', async () => {
      const svc = makeMockService();
      svc.updateCourse.mockResolvedValue({ id: 'uuid-1', title: 'Updated' } as any);
      const ctrl = new CoursesController(svc as unknown as CoursesService);

      await ctrl.updateCourse('uuid-1', { title: 'Updated' });

      expect(svc.updateCourse).toHaveBeenCalledWith('uuid-1', { title: 'Updated' });
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { id: 'uuid-1', title: 'Updated' } as any;
      svc.updateCourse.mockResolvedValue(expected);
      const ctrl = new CoursesController(svc as unknown as CoursesService);

      const result = await ctrl.updateCourse('uuid-1', { title: 'Updated' });

      expect(result).toBe(expected);
    });
  });
});
