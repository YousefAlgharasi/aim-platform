import { Test, TestingModule } from '@nestjs/testing';
import { ContentStatusWorkflowController } from './content-status-workflow.controller';
import { ContentStatusWorkflowService } from './content-status-workflow.service';
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

describe('ContentStatusWorkflowController', () => {
  let controller: ContentStatusWorkflowController;
  let service: jest.Mocked<ContentStatusWorkflowService>;

  beforeEach(async () => {
    const mockService = {
      publish: jest.fn().mockResolvedValue({ id: 'uuid', status: 'published' }),
      archive: jest.fn().mockResolvedValue({ id: 'uuid', status: 'archived' }),
      restore: jest.fn().mockResolvedValue({ id: 'uuid', status: 'draft' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentStatusWorkflowController],
      providers: [{ provide: ContentStatusWorkflowService, useValue: mockService }],
    })
      .overrideGuard(SupabaseJwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(PermissionGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get(ContentStatusWorkflowController);
    service = module.get(ContentStatusWorkflowService) as jest.Mocked<ContentStatusWorkflowService>;
  });

  it('applies SupabaseJwtAuthGuard and PermissionGuard at class level', () => {
    const guards = getClassGuards(ContentStatusWorkflowController);
    const guardNames = guards.map((g) => g.name);
    expect(guardNames).toContain('SupabaseJwtAuthGuard');
    expect(guardNames).toContain('PermissionGuard');
  });

  describe('publish', () => {
    it('delegates to ContentStatusWorkflowService.publish', async () => {
      await controller.publish('lessons', 'entity-id');
      expect(service.publish).toHaveBeenCalledWith('lessons', 'entity-id');
    });

    it('requires CONTENT_PUBLISH permission', () => {
      const perms = getMethodPermissions(controller, 'publish');
      expect(perms).toContain(CurriculumPermission.CONTENT_PUBLISH);
    });
  });

  describe('archive', () => {
    it('delegates to ContentStatusWorkflowService.archive', async () => {
      await controller.archive('courses', 'entity-id');
      expect(service.archive).toHaveBeenCalledWith('courses', 'entity-id');
    });

    it('requires CONTENT_ARCHIVE permission', () => {
      const perms = getMethodPermissions(controller, 'archive');
      expect(perms).toContain(CurriculumPermission.CONTENT_ARCHIVE);
    });
  });

  describe('restore', () => {
    it('delegates to ContentStatusWorkflowService.restore', async () => {
      await controller.restore('skills', 'entity-id');
      expect(service.restore).toHaveBeenCalledWith('skills', 'entity-id');
    });

    it('requires CONTENT_RESTORE permission', () => {
      const perms = getMethodPermissions(controller, 'restore');
      expect(perms).toContain(CurriculumPermission.CONTENT_RESTORE);
    });
  });
});
