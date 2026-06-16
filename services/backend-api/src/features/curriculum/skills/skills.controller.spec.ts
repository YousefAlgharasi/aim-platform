import { Test, TestingModule } from '@nestjs/testing';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
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

describe('SkillsController', () => {
  let controller: SkillsController;
  let service: jest.Mocked<SkillsService>;

  beforeEach(async () => {
    const mockService = {
      listSkills: jest.fn().mockResolvedValue({ skills: [], total: 0, page: 1, limit: 20 }),
      getSkill: jest.fn().mockResolvedValue({ id: 'uuid' }),
      getSkillByKey: jest.fn().mockResolvedValue({ id: 'uuid' }),
      createSkill: jest.fn().mockResolvedValue({ id: 'uuid' }),
      updateSkill: jest.fn().mockResolvedValue({ id: 'uuid' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [{ provide: SkillsService, useValue: mockService }],
    })
      .overrideGuard(SupabaseJwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(PermissionGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get(SkillsController);
    service = module.get(SkillsService) as jest.Mocked<SkillsService>;
  });

  it('applies SupabaseJwtAuthGuard and PermissionGuard at class level', () => {
    const guards = getClassGuards(SkillsController);
    const guardNames = guards.map((g) => g.name);
    expect(guardNames).toContain('SupabaseJwtAuthGuard');
    expect(guardNames).toContain('PermissionGuard');
  });

  describe('listSkills', () => {
    it('delegates to SkillsService.listSkills', async () => {
      await controller.listSkills('1', '20');
      expect(service.listSkills).toHaveBeenCalled();
    });

    it('requires CONTENT_READ_DRAFT permission', () => {
      const perms = getMethodPermissions(controller, 'listSkills');
      expect(perms).toContain(CurriculumPermission.CONTENT_READ_DRAFT);
    });
  });

  describe('createSkill', () => {
    it('delegates to SkillsService.createSkill', async () => {
      const input = { key: 'grammar.past_simple.forms', title: 'Past Simple Forms', domain: 'grammar' as const };
      await controller.createSkill(input);
      expect(service.createSkill).toHaveBeenCalledWith(input);
    });

    it('requires CONTENT_UPDATE permission', () => {
      const perms = getMethodPermissions(controller, 'createSkill');
      expect(perms).toContain(CurriculumPermission.CONTENT_UPDATE);
    });
  });

  describe('updateSkill', () => {
    it('delegates to SkillsService.updateSkill', async () => {
      await controller.updateSkill('test-id', { title: 'Updated' });
      expect(service.updateSkill).toHaveBeenCalledWith('test-id', { title: 'Updated' });
    });
  });
});
