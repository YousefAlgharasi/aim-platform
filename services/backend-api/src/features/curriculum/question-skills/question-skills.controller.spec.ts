import { Test, TestingModule } from '@nestjs/testing';
import { QuestionSkillsController } from './question-skills.controller';
import { QuestionSkillsService } from './question-skills.service';
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

describe('QuestionSkillsController', () => {
  let controller: QuestionSkillsController;
  let service: jest.Mocked<QuestionSkillsService>;

  beforeEach(async () => {
    const mockService = {
      listSkillsForQuestion: jest.fn().mockResolvedValue({ links: [], total: 0 }),
      addSkillToQuestion: jest.fn().mockResolvedValue({ questionId: 'q1', skillId: 's1' }),
      setPrimarySkill: jest.fn().mockResolvedValue({ questionId: 'q1', skillId: 's1', isPrimary: true }),
      removeSkillFromQuestion: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionSkillsController],
      providers: [{ provide: QuestionSkillsService, useValue: mockService }],
    })
      .overrideGuard(SupabaseJwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(PermissionGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get(QuestionSkillsController);
    service = module.get(QuestionSkillsService) as jest.Mocked<QuestionSkillsService>;
  });

  it('applies SupabaseJwtAuthGuard and PermissionGuard at class level', () => {
    const guards = getClassGuards(QuestionSkillsController);
    const guardNames = guards.map((g) => g.name);
    expect(guardNames).toContain('SupabaseJwtAuthGuard');
    expect(guardNames).toContain('PermissionGuard');
  });

  describe('listSkillsForQuestion', () => {
    it('delegates to QuestionSkillsService.listSkillsForQuestion', async () => {
      await controller.listSkillsForQuestion('q1');
      expect(service.listSkillsForQuestion).toHaveBeenCalledWith('q1');
    });

    it('requires CONTENT_READ_DRAFT permission', () => {
      const perms = getMethodPermissions(controller, 'listSkillsForQuestion');
      expect(perms).toContain(CurriculumPermission.CONTENT_READ_DRAFT);
    });
  });

  describe('addSkillToQuestion', () => {
    it('requires CONTENT_UPDATE permission', () => {
      const perms = getMethodPermissions(controller, 'addSkillToQuestion');
      expect(perms).toContain(CurriculumPermission.SKILL_LINKS_MANAGE);
    });
  });

  describe('removeSkillFromQuestion', () => {
    it('requires CONTENT_UPDATE permission', () => {
      const perms = getMethodPermissions(controller, 'removeSkillFromQuestion');
      expect(perms).toContain(CurriculumPermission.SKILL_LINKS_MANAGE);
    });
  });
});
