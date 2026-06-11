import { Module } from '@nestjs/common';
import { BackendConfigModule } from '../config/backend-config.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { AuthController } from './auth.controller';
import { SupabaseJwtAuthGuard } from './supabase-jwt-auth.guard';
import { SupabaseJwtVerifierService } from './supabase-jwt-verifier.service';

@Module({
  imports: [BackendConfigModule, AuthorizationModule],
  controllers: [AuthController],
  providers: [SupabaseJwtAuthGuard, SupabaseJwtVerifierService],
  exports: [SupabaseJwtAuthGuard, SupabaseJwtVerifierService, AuthorizationModule],
})
export class AuthModule {}
