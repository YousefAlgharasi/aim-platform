import { Module } from '@nestjs/common';
import { BackendConfigModule } from '../config/backend-config.module';
import { SupabaseJwtAuthGuard } from './supabase-jwt-auth.guard';
import { SupabaseJwtVerifierService } from './supabase-jwt-verifier.service';

@Module({
  imports: [BackendConfigModule],
  providers: [SupabaseJwtAuthGuard, SupabaseJwtVerifierService],
  exports: [SupabaseJwtAuthGuard, SupabaseJwtVerifierService],
})
export class AuthModule {}
