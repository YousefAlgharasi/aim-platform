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
