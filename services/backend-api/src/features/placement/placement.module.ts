// Phase 4 — P4-040 (initial) / P4-037 (module skeleton) / P4-042 (answer submit) / P4-043 (complete) / P4-044 (validation)
// PlacementModule.
//
// Scope: Placement Test system only.
//
// This module registers the placement feature in the NestJS DI container.
// Additional services (P4-045 through P4-048) will be added as they are implemented.
//
// Security rules:
//   - No AIM Engine runtime, lesson delivery, AI Teacher, or progress dashboard.
//   - No secrets, service-role keys, database credentials, or privileged config here.
//   - DatabaseModule is imported to provide DatabaseService for SQL queries.
//   - AuthModule is imported to provide SupabaseJwtAuthGuard for student endpoints.

import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { PlacementController } from './placement.controller';
import { PlacementQuestionDeliveryService } from './placement-question-delivery.service';
import { PlacementAnswerSubmitService } from './placement-answer-submit.service';
import { PlacementAttemptCompleteService } from './placement-attempt-complete.service';
import { PlacementAnswerValidationService } from './placement-answer-validation.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [PlacementController],
  providers: [
    PlacementQuestionDeliveryService,
    PlacementAnswerSubmitService,
    PlacementAttemptCompleteService,
    PlacementAnswerValidationService,
  ],
  exports: [
    PlacementQuestionDeliveryService,
    PlacementAnswerSubmitService,
    PlacementAttemptCompleteService,
    PlacementAnswerValidationService,
  ],
})
export class PlacementModule {}
