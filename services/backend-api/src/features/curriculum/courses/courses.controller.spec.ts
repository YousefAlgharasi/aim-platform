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
