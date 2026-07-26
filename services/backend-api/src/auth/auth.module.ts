import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { BackendConfigModule } from '../config/backend-config.module';
import { BackendConfigService } from '../config/backend-config.service';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../features/users/users.module';
import { RolesModule } from '../features/roles/roles.module';
import { AnalyticsModule } from '../features/analytics/analytics.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { BillingModule } from '../features/billing/billing.module';
import { StudentsModule } from '../features/students/students.module';
import { AuthController } from './auth.controller';
import { AuthLoggingService } from './auth-logging.service';
import { AuthLoginService } from './auth-login.service';
import { AuthProfileBootstrapService } from './auth-profile-bootstrap.service';
import { GoogleStrategy } from './google.strategy';
import { SessionValidationService } from './session-validation.service';
import { SupabaseJwtAuthGuard } from './supabase-jwt-auth.guard';
import { SupabaseJwtVerifierService } from './supabase-jwt-verifier.service';
import { TestLoginController } from './test-login.controller';
import { TestLoginService } from './test-login.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'google' }),
    JwtModule.registerAsync({
      imports: [BackendConfigModule],
      useFactory: (config: BackendConfigService) => ({
        secret: config.supabase.jwtSecret,
        signOptions: { expiresIn: '1h' },
      }),
      inject: [BackendConfigService],
    }),
    BackendConfigModule,
    DatabaseModule,
    UsersModule,
    RolesModule,
    AuthorizationModule,
    forwardRef(() => AnalyticsModule),
    forwardRef(() => BillingModule),
    StudentsModule,
  ],
  controllers: [AuthController, TestLoginController],
  providers: [
    GoogleStrategy,
    SupabaseJwtAuthGuard,
    SupabaseJwtVerifierService,
    SessionValidationService,
    AuthLoggingService,
    AuthProfileBootstrapService,
    AuthLoginService,
    TestLoginService,
  ],
  exports: [
    SupabaseJwtAuthGuard,
    SupabaseJwtVerifierService,
    SessionValidationService,
    AuthLoggingService,
    AuthProfileBootstrapService,
    AuthLoginService,
    AuthorizationModule,
  ],
})
export class AuthModule {}
