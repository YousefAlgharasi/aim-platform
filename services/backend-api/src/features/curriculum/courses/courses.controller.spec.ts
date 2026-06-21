import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { PermissionGuard } from '../../../auth/authorization/permission.guard';
import { CurriculumPermission } from '../curriculum.permissions';
import { REQUIRED_PERMISSIONS_KEY } from '../../../auth/authorization/authorization.constants';

const GUARDS_KEY = '__guards__';

function getClassGuards(target: Function): Function[] {
  return Reflect.getMetadata(GUARDS_KEY, target) ?? [];
}

function getMethodPermissions(prototype: object, method: string): string[] {
  return Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, (prototype as any)[method]) ?? [];
}

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: jest.Mocked<CoursesService>;

  beforeEach(async () => {
    const mockService = {
      listCourses: jest.fn().mockResolvedValue({ courses: [], total: 0, page: 1, limit: 20 }),
      getCourse: jest.fn().mockResolvedValue({ id: 'uuid', title: 'Test' }),
      createCourse: jest.fn().mockResolvedValue({ id: 'uuid', title: 'New' }),
      updateCourse: jest.fn().mockResolvedValue({ id: 'uuid', title: 'Updated' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [{ provide: CoursesService, useValue: mockService }],
    })
      .overrideGuard(SupabaseJwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(PermissionGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get(CoursesController);
    service = module.get(CoursesService) as jest.Mocked<CoursesService>;
  });

  it('applies SupabaseJwtAuthGuard and PermissionGuard at class level', () => {
    const guards = getClassGuards(CoursesController);
    const guardNames = guards.map((g) => g.name);
    expect(guardNames).toContain('SupabaseJwtAuthGuard');
    expect(guardNames).toContain('PermissionGuard');
  });

  describe('listCourses', () => {
    it('delegates to CoursesService.listCourses', async () => {
      await controller.listCourses('2', '10');
      expect(service.listCourses).toHaveBeenCalledWith(2, 10, undefined, undefined);
    });

    it('requires CONTENT_READ_DRAFT permission', () => {
      const perms = getMethodPermissions(controller, 'listCourses');
      expect(perms).toContain(CurriculumPermission.CONTENT_READ_DRAFT);
    });
  });

  describe('getCourse', () => {
    it('delegates to CoursesService.getCourse', async () => {
      await controller.getCourse('test-id');
      expect(service.getCourse).toHaveBeenCalledWith('test-id');
    });
  });

  describe('createCourse', () => {
    it('delegates to CoursesService.createCourse', async () => {
      const input = { title: 'A1 English', slug: 'a1-english' };
      await controller.createCourse(input);
      expect(service.createCourse).toHaveBeenCalledWith(input);
    });

    it('requires CONTENT_UPDATE permission', () => {
      const perms = getMethodPermissions(controller, 'createCourse');
      expect(perms).toContain(CurriculumPermission.CONTENT_UPDATE);
    });
  });

  describe('updateCourse', () => {
    it('delegates to CoursesService.updateCourse', async () => {
      const input = { title: 'Updated' };
      await controller.updateCourse('test-id', input);
      expect(service.updateCourse).toHaveBeenCalledWith('test-id', input);
    });
  });
});

const makeMockService = (): jest.Mocked<
  Pick<CoursesService, 'listCourses' | 'getCourse' | 'createCourse' | 'updateCourse'>
> => ({
  listCourses: jest.fn(),
  getCourse: jest.fn(),
  createCourse: jest.fn(),
  updateCourse: jest.fn(),
});

describe('CoursesController (P3-048 additional behavior tests)', () => {
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
