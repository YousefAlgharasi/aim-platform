import { INTERCEPTORS_METADATA } from '@nestjs/common/constants';
import { LocaleHeadersInterceptor } from '../../../common/locale/locale-headers.interceptor';
import { LessonsController } from '../lessons.controller';

describe('LessonsController.getRecommendedCourse', () => {
  it('passes the resolved locale to the service', async () => {
    const findRecommendedCourse = jest.fn().mockResolvedValue(null);
    const resolve = jest.fn().mockResolvedValue('ar');
    const controller = new LessonsController({ findRecommendedCourse } as never, {} as never, { resolve } as never);
    const ctx = { requested: 'ar' as const, userId: 'user-1' };

    await controller.getRecommendedCourse({ id: 'user-1', expiresAt: 0 }, ctx);

    expect(resolve).toHaveBeenCalledWith(ctx);
    expect(findRecommendedCourse).toHaveBeenCalledWith('user-1', 'ar');
  });

  it('applies the locale headers interceptor to the handler', () => {
    const interceptors = Reflect.getMetadata(
      INTERCEPTORS_METADATA,
      LessonsController.prototype.getRecommendedCourse,
    ) as unknown[];
    expect(interceptors).toContain(LocaleHeadersInterceptor);
  });
});
