import { Test, TestingModule } from '@nestjs/testing';
import { LessonSkillsController } from './lesson-skills.controller';
import { LessonSkillsService } from './lesson-skills.service';
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

describe('LessonSkillsController', () => {
  let controller: LessonSkillsController;
  let service: jest.Mocked<LessonSkillsService>;

  beforeEach(async () => {
    const mockService = {
      listSkillsForLesson: jest.fn().mockResolvedValue({ links: [], total: 0 }),
      addSkillToLesson: jest.fn().mockResolvedValue({ lessonId: 'l1', skillId: 's1', createdAt: '' }),
      removeSkillFromLesson: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonSkillsController],
      providers: [{ provide: LessonSkillsService, useValue: mockService }],
    })
      .overrideGuard(SupabaseJwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(PermissionGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get(LessonSkillsController);
    service = module.get(LessonSkillsService) as jest.Mocked<LessonSkillsService>;
  });

  it('applies SupabaseJwtAuthGuard and PermissionGuard at class level', () => {
    const guards = getClassGuards(LessonSkillsController);
    const guardNames = guards.map((g) => g.name);
    expect(guardNames).toContain('SupabaseJwtAuthGuard');
    expect(guardNames).toContain('PermissionGuard');
  });

  describe('listSkillsForLesson', () => {
    it('delegates to LessonSkillsService.listSkillsForLesson', async () => {
      await controller.listSkillsForLesson('lesson-id');
      expect(service.listSkillsForLesson).toHaveBeenCalledWith('lesson-id');
    });

    it('requires CONTENT_READ_DRAFT permission', () => {
      const perms = getMethodPermissions(controller, 'listSkillsForLesson');
      expect(perms).toContain(CurriculumPermission.CONTENT_READ_DRAFT);
    });
  });

  describe('addSkillToLesson', () => {
    it('delegates to LessonSkillsService.addSkillToLesson', async () => {
      const input = { skillId: 'skill-1' };
      await controller.addSkillToLesson('lesson-1', input);
      expect(service.addSkillToLesson).toHaveBeenCalledWith('lesson-1', input);
    });

    it('requires CONTENT_UPDATE permission', () => {
      const perms = getMethodPermissions(controller, 'addSkillToLesson');
      expect(perms).toContain(CurriculumPermission.CONTENT_UPDATE);
    });
  });

  describe('removeSkillFromLesson', () => {
    it('delegates to LessonSkillsService.removeSkillFromLesson', async () => {
      await controller.removeSkillFromLesson('lesson-1', 'skill-1');
      expect(service.removeSkillFromLesson).toHaveBeenCalledWith('lesson-1', 'skill-1');
    });

    it('requires CONTENT_UPDATE permission', () => {
      const perms = getMethodPermissions(controller, 'removeSkillFromLesson');
      expect(perms).toContain(CurriculumPermission.CONTENT_UPDATE);
    });
  });
});

const makeMockService = (): jest.Mocked<
  Pick<LessonSkillsService, 'listSkillsForLesson' | 'addSkillToLesson' | 'removeSkillFromLesson'>
> => ({
  listSkillsForLesson: jest.fn(),
  addSkillToLesson: jest.fn(),
  removeSkillFromLesson: jest.fn(),
});

describe('LessonSkillsController (P3-048 additional behavior tests)', () => {
  describe('listSkillsForLesson', () => {
    it('delegates to LessonSkillsService with lessonId', async () => {
      const svc = makeMockService();
      svc.listSkillsForLesson.mockResolvedValue([{ id: 's1' }] as any);
      const ctrl = new LessonSkillsController(svc as unknown as LessonSkillsService);

      await ctrl.listSkillsForLesson('lesson-uuid');

      expect(svc.listSkillsForLesson).toHaveBeenCalledWith('lesson-uuid');
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = [{ skillId: 'skill-uuid' }] as any;
      svc.listSkillsForLesson.mockResolvedValue(expected);
      const ctrl = new LessonSkillsController(svc as unknown as LessonSkillsService);

      expect(await ctrl.listSkillsForLesson('lesson-uuid')).toBe(expected);
    });
  });

  describe('addSkillToLesson', () => {
    it('delegates to LessonSkillsService with lessonId and body', async () => {
      const svc = makeMockService();
      svc.addSkillToLesson.mockResolvedValue({ lessonId: 'l', skillId: 's' } as any);
      const ctrl = new LessonSkillsController(svc as unknown as LessonSkillsService);

      await ctrl.addSkillToLesson('lesson-uuid', { skillId: 'skill-uuid' } as any);

      expect(svc.addSkillToLesson).toHaveBeenCalledWith('lesson-uuid', {
        skillId: 'skill-uuid',
      });
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { lessonId: 'lesson-uuid', skillId: 'skill-uuid' } as any;
      svc.addSkillToLesson.mockResolvedValue(expected);
      const ctrl = new LessonSkillsController(svc as unknown as LessonSkillsService);

      expect(await ctrl.addSkillToLesson('lesson-uuid', {} as any)).toBe(expected);
    });
  });

  describe('removeSkillFromLesson', () => {
    it('delegates to LessonSkillsService with lessonId and skillId', async () => {
      const svc = makeMockService();
      svc.removeSkillFromLesson.mockResolvedValue(undefined);
      const ctrl = new LessonSkillsController(svc as unknown as LessonSkillsService);

      await ctrl.removeSkillFromLesson('lesson-uuid', 'skill-uuid');

      expect(svc.removeSkillFromLesson).toHaveBeenCalledWith('lesson-uuid', 'skill-uuid');
    });

    it('awaits the service call (returns undefined for 204 NO CONTENT)', async () => {
      const svc = makeMockService();
      svc.removeSkillFromLesson.mockResolvedValue(undefined);
      const ctrl = new LessonSkillsController(svc as unknown as LessonSkillsService);

      const result = await ctrl.removeSkillFromLesson('lesson-uuid', 'skill-uuid');

      expect(result).toBeUndefined();
    });
  });
});
