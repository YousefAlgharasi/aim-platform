// Phase 4 — P4-041
// PlacementModule.
//
// Scope: Placement Test system only.
//
// Registers the placement feature in the NestJS DI container.
// Additional services and controllers (P4-042 onward) will be added here.
//
// Security rules:
//   - DatabaseModule provides DatabaseService for raw SQL queries.
//   - AuthModule provides SupabaseJwtAuthGuard for student endpoints.
//   - StudentsModule provides StudentsService for student_id resolution from JWT.
//   - No AIM Engine runtime, lesson delivery, AI Teacher, or progress dashboard.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { StudentsModule } from '../students/students.module';
import { PlacementController } from './placement.controller';
import { PlacementAttemptService } from './placement-attempt.service';

@Module({
  imports: [DatabaseModule, AuthModule, StudentsModule],
  controllers: [PlacementController],
  providers: [PlacementAttemptService],
  exports: [PlacementAttemptService],
})
export class PlacementModule {}
