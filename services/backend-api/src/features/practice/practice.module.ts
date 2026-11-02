import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { LocaleModule } from '../../common/locale/locale.module';
import { DatabaseModule } from '../../database/database.module';
import { ProviderGatewayModule } from '../ai-teacher/provider-gateway/provider-gateway.module';
import { CourseBillingModule } from '../course-billing/course-billing.module';
import { OperationsAdminGuard } from '../operations/operations.guards';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { VoiceSessionStartModule } from '../voice-teacher/session-start/voice-session-start.module';
import { AdminPracticeController } from './admin-practice.controller';
import { PracticeAccessService } from './practice-access.service';
import { PracticeAttemptsService } from './practice-attempts.service';
import { PracticeTopicsService } from './practice-topics.service';
import { StudentPracticeController } from './student-practice.controller';

@Module({
  imports: [
    AuthModule, UsersModule, RolesModule, LocaleModule, DatabaseModule,
    CourseBillingModule, ProviderGatewayModule, VoiceSessionStartModule,
  ],
  controllers: [StudentPracticeController, AdminPracticeController],
  providers: [PracticeAccessService, PracticeTopicsService, PracticeAttemptsService, OperationsAdminGuard],
})
export class PracticeModule {}
