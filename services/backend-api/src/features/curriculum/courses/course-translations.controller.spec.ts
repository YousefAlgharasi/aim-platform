import { CourseTranslationsController } from './course-translations.controller';
import { CourseTranslationsService } from './course-translations.service';
import { CurriculumPermission } from '../curriculum.permissions';
import { REQUIRED_PERMISSIONS_KEY } from '../../../auth/authorization/authorization.constants';

const GUARDS_KEY = '__guards__';

function permissionsOf(method: string): string[] {
  return (
    Reflect.getMetadata(
      REQUIRED_PERMISSIONS_KEY,
      (CourseTranslationsController.prototype as any)[method],
    ) ?? []
  );
}

describe('CourseTranslationsController', () => {
  const service = {
    listTranslations: jest.fn().mockResolvedValue({ courseId: 'c1', translations: [] }),
    upsertTranslation: jest.fn().mockResolvedValue({ locale: 'ar' }),
    deleteTranslation: jest.fn().mockResolvedValue({ deleted: true }),
  };
  const controller = new CourseTranslationsController(service as unknown as CourseTranslationsService);

  it('is protected by the JWT and permission guards', () => {
    const names = (Reflect.getMetadata(GUARDS_KEY, CourseTranslationsController) as Function[]).map((g) => g.name);
    expect(names).toEqual(expect.arrayContaining(['SupabaseJwtAuthGuard', 'PermissionGuard']));
  });

  it('requires draft-read permission to list every translation', () => {
    expect(permissionsOf('listTranslations')).toContain(CurriculumPermission.CONTENT_READ_DRAFT);
    expect(permissionsOf('listTranslations')).not.toContain(CurriculumPermission.CONTENT_READ_PUBLISHED);
  });

  it('requires update permission to write and delete', () => {
    expect(permissionsOf('upsertTranslation')).toContain(CurriculumPermission.CONTENT_UPDATE);
    expect(permissionsOf('deleteTranslation')).toContain(CurriculumPermission.CONTENT_UPDATE);
  });

  it('delegates to the service', async () => {
    await controller.listTranslations('c1');
    await controller.upsertTranslation('c1', 'ar', { title: 'T' });
    await controller.deleteTranslation('c1', 'ar');
    expect(service.listTranslations).toHaveBeenCalledWith('c1');
    expect(service.upsertTranslation).toHaveBeenCalledWith('c1', 'ar', { title: 'T' });
    expect(service.deleteTranslation).toHaveBeenCalledWith('c1', 'ar');
  });
});
