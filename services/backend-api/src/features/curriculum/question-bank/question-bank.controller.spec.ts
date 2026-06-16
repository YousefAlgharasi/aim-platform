import { Test, TestingModule } from '@nestjs/testing';
import { QuestionBankController } from './question-bank.controller';
import { QuestionBankService } from './question-bank.service';
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

describe('QuestionBankController', () => {
  let controller: QuestionBankController;
  let service: jest.Mocked<QuestionBankService>;

  beforeEach(async () => {
    const mockService = {
      listQuestions: jest.fn().mockResolvedValue({ questions: [], total: 0, page: 1, limit: 20 }),
      getQuestion: jest.fn().mockResolvedValue({ id: 'uuid' }),
      createQuestion: jest.fn().mockResolvedValue({ id: 'uuid' }),
      updateQuestion: jest.fn().mockResolvedValue({ id: 'uuid' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionBankController],
      providers: [{ provide: QuestionBankService, useValue: mockService }],
    })
      .overrideGuard(SupabaseJwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(PermissionGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get(QuestionBankController);
    service = module.get(QuestionBankService) as jest.Mocked<QuestionBankService>;
  });

  it('applies SupabaseJwtAuthGuard and PermissionGuard at class level', () => {
    const guards = getClassGuards(QuestionBankController);
    const guardNames = guards.map((g) => g.name);
    expect(guardNames).toContain('SupabaseJwtAuthGuard');
    expect(guardNames).toContain('PermissionGuard');
  });

  describe('listQuestions', () => {
    it('delegates to QuestionBankService.listQuestions', async () => {
      await controller.listQuestions('1', '20');
      expect(service.listQuestions).toHaveBeenCalled();
    });

    it('requires CONTENT_READ_DRAFT permission', () => {
      const perms = getMethodPermissions(controller, 'listQuestions');
      expect(perms).toContain(CurriculumPermission.CONTENT_READ_DRAFT);
    });
  });

  describe('createQuestion', () => {
    it('requires CONTENT_UPDATE permission', () => {
      const perms = getMethodPermissions(controller, 'createQuestion');
      expect(perms).toContain(CurriculumPermission.CONTENT_UPDATE);
    });
  });
});
