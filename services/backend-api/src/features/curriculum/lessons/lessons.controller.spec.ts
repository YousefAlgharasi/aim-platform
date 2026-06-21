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

const makeMockLessonsService = (): jest.Mocked<
  Pick<LessonsService, 'listLessons' | 'getLesson' | 'createLesson' | 'updateLesson'>
> => ({
  listLessons: jest.fn(),
  getLesson: jest.fn(),
  createLesson: jest.fn(),
  updateLesson: jest.fn(),
});

const makeMockValidationService = (): jest.Mocked<
  Pick<LessonPublishValidationService, 'checkLessonPublishReadiness'>
> => ({
  checkLessonPublishReadiness: jest.fn(),
});

describe('LessonsController (P3-048 additional behavior tests)', () => {
  describe('listLessons', () => {
    it('delegates with optional chapterId, parsed pagination, and filters', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      lessonsSvc.listLessons.mockResolvedValue({ lessons: [], total: 0 } as any);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      await ctrl.listLessons('chap-uuid', '2', '15', 'draft', 'intro');

      expect(lessonsSvc.listLessons).toHaveBeenCalledWith(2, 15, 'chap-uuid', 'draft', 'intro');
    });

    it('falls back to page 1 and limit 20 for non-numeric params', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      lessonsSvc.listLessons.mockResolvedValue({ lessons: [], total: 0 } as any);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      await ctrl.listLessons(undefined, 'x', 'y');

      expect(lessonsSvc.listLessons).toHaveBeenCalledWith(1, 20, undefined, undefined, undefined);
    });

    it('returns service result directly', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      const expected = { lessons: [{ id: 'l1' }], total: 1 } as any;
      lessonsSvc.listLessons.mockResolvedValue(expected);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      expect(await ctrl.listLessons(undefined, '1', '20')).toBe(expected);
    });
  });

  describe('getLesson', () => {
    it('delegates to LessonsService with id', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      lessonsSvc.getLesson.mockResolvedValue({ id: 'uuid-1' } as any);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      await ctrl.getLesson('uuid-1');

      expect(lessonsSvc.getLesson).toHaveBeenCalledWith('uuid-1');
    });

    it('returns service result directly', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      const expected = { id: 'uuid-1', title: 'Lesson A' } as any;
      lessonsSvc.getLesson.mockResolvedValue(expected);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      expect(await ctrl.getLesson('uuid-1')).toBe(expected);
    });
  });

  describe('createLesson', () => {
    it('delegates to LessonsService with the request body', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      lessonsSvc.createLesson.mockResolvedValue({ id: 'new' } as any);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      await ctrl.createLesson({ title: 'New Lesson', chapterId: 'ch-uuid' } as any);

      expect(lessonsSvc.createLesson).toHaveBeenCalledWith({
        title: 'New Lesson',
        chapterId: 'ch-uuid',
      });
    });

    it('returns service result directly', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      const expected = { id: 'new-uuid', status: 'draft' } as any;
      lessonsSvc.createLesson.mockResolvedValue(expected);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      expect(await ctrl.createLesson({} as any)).toBe(expected);
    });
  });

  describe('checkPublishValidation', () => {
    it('delegates to LessonPublishValidationService with lesson id', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      validationSvc.checkLessonPublishReadiness.mockResolvedValue({
        ready: false,
        reasons: [],
      } as any);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      await ctrl.checkPublishValidation('lesson-uuid');

      expect(validationSvc.checkLessonPublishReadiness).toHaveBeenCalledWith('lesson-uuid');
    });

    it('returns validation result directly', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      const expected = { ready: true, reasons: [] } as any;
      validationSvc.checkLessonPublishReadiness.mockResolvedValue(expected);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      expect(await ctrl.checkPublishValidation('lesson-uuid')).toBe(expected);
    });
  });

  describe('updateLesson', () => {
    it('delegates to LessonsService with id and body', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      lessonsSvc.updateLesson.mockResolvedValue({ id: 'uuid-1' } as any);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      await ctrl.updateLesson('uuid-1', { title: 'Updated' });

      expect(lessonsSvc.updateLesson).toHaveBeenCalledWith('uuid-1', { title: 'Updated' });
    });

    it('returns service result directly', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      const expected = { id: 'uuid-1', title: 'Updated' } as any;
      lessonsSvc.updateLesson.mockResolvedValue(expected);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      expect(await ctrl.updateLesson('uuid-1', {})).toBe(expected);
    });
  });
});
