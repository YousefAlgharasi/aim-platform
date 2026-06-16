import { Test, TestingModule } from '@nestjs/testing';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { LessonPublishValidationService } from '../lesson-skills/lesson-publish-validation.service';
import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { PermissionGuard } from '../../../auth/authorization/permission.guard';
import { CurriculumPermission } from '../curriculum.permissions';
import { REQUIRED_PERMISSIONS_KEY } from '../../../auth/authorization/authorization.constants';

const GUARDS_KEY = '__guards__';

function getClassGuards(target: Function): Function[] {
  return Reflect.getMetadata(GUARDS_KEY, target) ?? [];
}

function getMethodPermissions(proto: object, method: string): string[] {
  return Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, (proto as any)[method]) ?? [];
}

describe('LessonsController', () => {
  let controller: LessonsController;
  let service: jest.Mocked<LessonsService>;

  beforeEach(async () => {
    const mockService = {
      listLessons: jest.fn().mockResolvedValue({ lessons: [], total: 0, page: 1, limit: 20 }),
      getLesson: jest.fn().mockResolvedValue({ id: 'uuid' }),
      createLesson: jest.fn().mockResolvedValue({ id: 'uuid' }),
      updateLesson: jest.fn().mockResolvedValue({ id: 'uuid' }),
    };
    const mockValidation = {
      checkLessonPublishReadiness: jest.fn().mockResolvedValue({ isReady: true, errors: [] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonsController],
      providers: [
        { provide: LessonsService, useValue: mockService },
        { provide: LessonPublishValidationService, useValue: mockValidation },
      ],
    })
      .overrideGuard(SupabaseJwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(PermissionGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get(LessonsController);
    service = module.get(LessonsService) as jest.Mocked<LessonsService>;
  });

  it('applies SupabaseJwtAuthGuard and PermissionGuard at class level', () => {
    const guards = getClassGuards(LessonsController);
    const guardNames = guards.map((g) => g.name);
    expect(guardNames).toContain('SupabaseJwtAuthGuard');
    expect(guardNames).toContain('PermissionGuard');
  });

  describe('listLessons', () => {
    it('delegates to LessonsService.listLessons', async () => {
      await controller.listLessons(undefined, '1', '20');
      expect(service.listLessons).toHaveBeenCalled();
    });

    it('requires CONTENT_READ_DRAFT permission', () => {
      const perms = getMethodPermissions(controller, 'listLessons');
      expect(perms).toContain(CurriculumPermission.CONTENT_READ_DRAFT);
    });
  });

  describe('createLesson', () => {
    it('requires CONTENT_UPDATE permission', () => {
      const perms = getMethodPermissions(controller, 'createLesson');
      expect(perms).toContain(CurriculumPermission.CONTENT_UPDATE);
    });
  });

  describe('checkPublishValidation', () => {
    it('requires CONTENT_READ_DRAFT permission', () => {
      const perms = getMethodPermissions(controller, 'checkPublishValidation');
      expect(perms).toContain(CurriculumPermission.CONTENT_READ_DRAFT);
    });
  });
});
