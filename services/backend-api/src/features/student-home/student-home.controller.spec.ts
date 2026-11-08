import { GUARDS_METADATA, INTERCEPTORS_METADATA } from '@nestjs/common/constants';

import { LocaleHeadersInterceptor } from '../../common/locale/locale-headers.interceptor';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { StudentHomeController } from './student-home.controller';

describe('StudentHomeController', () => {
  const user = { id: 'student-1', expiresAt: 0 };

  it('uses the student id from the JWT and the resolved locale', async () => {
    const home = { getHome: jest.fn().mockResolvedValue({ failedSections: [] }) };
    const resolve = jest.fn().mockResolvedValue('ar');
    const controller = new StudentHomeController(home as never, { resolve } as never);
    const ctx = { requested: 'ar' as const, userId: 'student-1' };

    await controller.getHome(user, ctx);

    expect(resolve).toHaveBeenCalledWith(ctx);
    expect(home.getHome).toHaveBeenCalledWith('student-1', 'ar');
  });

  it('is guarded by JWT auth and the role guard, and sets locale headers', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, StudentHomeController) as unknown[];
    expect(guards).toEqual(expect.arrayContaining([SupabaseJwtAuthGuard, RoleGuard]));
    const interceptors = Reflect.getMetadata(
      INTERCEPTORS_METADATA,
      StudentHomeController.prototype.getHome,
    ) as unknown[];
    expect(interceptors).toContain(LocaleHeadersInterceptor);
  });
});
