import { GUARDS_METADATA, INTERCEPTORS_METADATA } from '@nestjs/common/constants';

import { RoleGuard } from '../../auth/authorization/role.guard';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { LocaleHeadersInterceptor } from '../../common/locale/locale-headers.interceptor';
import { StudentCoursePathController } from './student-course-path.controller';

describe('StudentCoursePathController', () => {
  const user = { id: 'student-1', expiresAt: 0 };

  it('checks course access before loading, using the JWT user and resolved locale', async () => {
    const calls: string[] = [];
    const path = { getPath: jest.fn().mockImplementation(async () => { calls.push('path'); return {}; }) };
    const courseAccess = { assertCanView: jest.fn().mockImplementation(async () => { calls.push('access'); }) };
    const resolve = jest.fn().mockResolvedValue('ar');
    const controller = new StudentCoursePathController(path as never, courseAccess as never, { resolve } as never);
    const ctx = { requested: 'ar' as const, userId: 'student-1' };

    await controller.getPath('course-1', user, ctx);

    expect(calls).toEqual(['access', 'path']);
    expect(courseAccess.assertCanView).toHaveBeenCalledWith('student-1', 'course-1');
    expect(path.getPath).toHaveBeenCalledWith('student-1', 'course-1', 'ar');
  });

  it('is guarded and sets locale headers', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, StudentCoursePathController) as unknown[];
    expect(guards).toEqual(expect.arrayContaining([SupabaseJwtAuthGuard, RoleGuard]));
    const interceptors = Reflect.getMetadata(
      INTERCEPTORS_METADATA,
      StudentCoursePathController.prototype.getPath,
    ) as unknown[];
    expect(interceptors).toContain(LocaleHeadersInterceptor);
  });
});
