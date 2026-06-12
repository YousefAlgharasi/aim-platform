import { Module } from '@nestjs/common';
import { BackendConfigModule } from '../config/backend-config.module';
import { DatabaseModule } from '../database/database.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { AuthController } from './auth.controller';
import { SessionValidationService } from './session-validation.service';
import { SupabaseJwtAuthGuard } from './supabase-jwt-auth.guard';
import { SupabaseJwtVerifierService } from './supabase-jwt-verifier.service';

@Module({
  imports: [BackendConfigModule, DatabaseModule, AuthorizationModule],
  controllers: [AuthController],
  providers: [SupabaseJwtAuthGuard, SupabaseJwtVerifierService, SessionValidationService],
  exports: [SupabaseJwtAuthGuard, SupabaseJwtVerifierService, SessionValidationService, AuthorizationModule],
})
export class AuthModule {}
