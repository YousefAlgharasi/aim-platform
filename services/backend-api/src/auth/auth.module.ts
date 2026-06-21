// Phase 2 — P2-025 (AuthProfileBootstrapService and UsersModule added)
import { Module } from '@nestjs/common';
import { BackendConfigModule } from '../config/backend-config.module';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../features/users/users.module';
import { AnalyticsModule } from '../features/analytics/analytics.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { AuthController } from './auth.controller';
import { AuthLoggingService } from './auth-logging.service';
import { AuthProfileBootstrapService } from './auth-profile-bootstrap.service';
import { SessionValidationService } from './session-validation.service';
import { SupabaseJwtAuthGuard } from './supabase-jwt-auth.guard';
import { SupabaseJwtVerifierService } from './supabase-jwt-verifier.service';

@Module({
  imports: [BackendConfigModule, DatabaseModule, UsersModule, AuthorizationModule, AnalyticsModule],
  controllers: [AuthController],
  providers: [
    SupabaseJwtAuthGuard,
    SupabaseJwtVerifierService,
    SessionValidationService,
    AuthLoggingService,
    AuthProfileBootstrapService,
  ],
  exports: [
    SupabaseJwtAuthGuard,
    SupabaseJwtVerifierService,
    SessionValidationService,
    AuthLoggingService,
    AuthProfileBootstrapService,
    AuthorizationModule,
  ],
})
export class AuthModule {}
