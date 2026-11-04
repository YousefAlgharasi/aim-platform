import { INTERCEPTORS_METADATA } from '@nestjs/common/constants';
import { LocaleHeadersInterceptor } from '../../common/locale/locale-headers.interceptor';
import { EnrollmentController } from './enrollment.controller';

describe('EnrollmentController', () => {
  const user = { id: 'user-1', expiresAt: 0 };
  const ctx = { requested: 'ar' as const, userId: 'user-1' };

  function build() {
    const enrollmentService = {
      enroll: jest.fn().mockResolvedValue({}),
      getCurrentEnrollment: jest.fn().mockResolvedValue({}),
    };
    const courseAccess = { assertAccess: jest.fn().mockResolvedValue(undefined) };
    const resolve = jest.fn().mockResolvedValue('ar');
    const controller = new EnrollmentController(enrollmentService as never, courseAccess as never, { resolve } as never);
    return { controller, enrollmentService, resolve };
  }

  it('passes the resolved locale to getCurrentEnrollment', async () => {
    const { controller, enrollmentService, resolve } = build();

    await controller.getCurrent(user, ctx);

    expect(resolve).toHaveBeenCalledWith(ctx);
    expect(enrollmentService.getCurrentEnrollment).toHaveBeenCalledWith('user-1', 'ar');
  });

  it('passes the resolved locale to enroll', async () => {
    const { controller, enrollmentService } = build();

    await controller.enroll('course-1', user, ctx);

    expect(enrollmentService.enroll).toHaveBeenCalledWith('user-1', 'course-1', 'ar');
  });

  it('applies the locale headers interceptor', () => {
    const interceptors = Reflect.getMetadata(INTERCEPTORS_METADATA, EnrollmentController) as unknown[];
    expect(interceptors).toContain(LocaleHeadersInterceptor);
  });
});
