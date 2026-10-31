import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { LocaleModule } from '../../common/locale/locale.module';
import { DatabaseModule } from '../../database/database.module';
import { OperationsAdminGuard } from '../operations/operations.guards';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { AdminCourseBillingController } from './admin-course-billing.controller';
import { CourseAccessService } from './course-access.service';
import { CoursePaymentService } from './course-payment.service';
import { CoursePriceService } from './course-price.service';
import { PaymentImageService } from './payment-image.service';
import { PaymentWalletService } from './payment-wallet.service';
import { PublicWalletImageController } from './public-wallet-image.controller';
import { StudentCourseBillingController } from './student-course-billing.controller';

@Module({
  imports: [LocaleModule, DatabaseModule, AuthModule, UsersModule, RolesModule],
  controllers: [StudentCourseBillingController, PublicWalletImageController, AdminCourseBillingController],
  providers: [
    CourseAccessService,
    CoursePaymentService,
    CoursePriceService,
    PaymentImageService,
    PaymentWalletService,
    OperationsAdminGuard,
  ],
  exports: [CourseAccessService],
})
export class CourseBillingModule {}
