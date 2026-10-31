import { INTERCEPTORS_METADATA } from '@nestjs/common/constants';
import { LocaleHeadersInterceptor } from '../../common/locale/locale-headers.interceptor';
import { StudentCertificateController } from '../certificates/student-certificate.controller';
import { StudentCourseBillingController } from './student-course-billing.controller';

describe('locale-aware student controllers', () => {
  it('apply the locale headers interceptor', () => {
    expect(Reflect.getMetadata(INTERCEPTORS_METADATA, StudentCourseBillingController)).toContain(LocaleHeadersInterceptor);
    expect(Reflect.getMetadata(INTERCEPTORS_METADATA, StudentCertificateController)).toContain(LocaleHeadersInterceptor);
  });

  it('resolve the locale and pass it to the payment list', async () => {
    const payments = { listForStudent: jest.fn().mockResolvedValue([]) };
    const resolver = { resolve: jest.fn().mockResolvedValue('ar') };
    const controller = new StudentCourseBillingController({} as never, payments as never, {} as never, resolver as never);
    const ctx = { requested: 'ar', userId: 'u1' } as const;
    await controller.listPayments({ id: 'u1' } as never, ctx);
    expect(resolver.resolve).toHaveBeenCalledWith(ctx);
    expect(payments.listForStudent).toHaveBeenCalledWith('u1', 'ar');
  });

  it('resolve the locale and pass it to my certificates', async () => {
    const certificates = { listForStudent: jest.fn().mockResolvedValue([]) };
    const resolver = { resolve: jest.fn().mockResolvedValue('en') };
    const controller = new StudentCertificateController(certificates as never, resolver as never);
    await controller.getMyCertificates({ id: 'u1' } as never, { requested: null, userId: 'u1' });
    expect(certificates.listForStudent).toHaveBeenCalledWith('u1', 'en');
  });
});
