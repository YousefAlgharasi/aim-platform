import { INTERCEPTORS_METADATA } from '@nestjs/common/constants';
import { LocaleHeadersInterceptor } from '../../common/locale/locale-headers.interceptor';
import { StudentCoursesController } from './student-courses.controller';

describe('StudentCoursesController', () => {
  it('resolves the locale and passes it to the service', async () => {
    const getCourses = jest.fn().mockResolvedValue({ courses: [] });
    const resolve = jest.fn().mockResolvedValue('ar');
    const controller = new StudentCoursesController({ getCourses } as never, { resolve } as never);
    const ctx = { requested: 'ar' as const, userId: 'user-1' };

    await controller.getCourses({ id: 'user-1', expiresAt: 0 }, ctx);

    expect(resolve).toHaveBeenCalledWith(ctx);
    expect(getCourses).toHaveBeenCalledWith('user-1', 'ar');
  });

  it('applies the locale headers interceptor', () => {
    const interceptors = Reflect.getMetadata(INTERCEPTORS_METADATA, StudentCoursesController) as unknown[];
    expect(interceptors).toContain(LocaleHeadersInterceptor);
  });
});
