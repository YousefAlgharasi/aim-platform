// Phase 4 — P4-040/P4-037/P4-042/P4-043/P4-044/P4-045/P4-046/P4-047
// PlacementModule.
//
// Scope: Placement Test system only.
//
// Security rules:
//   - No AIM Engine runtime, lesson delivery, AI Teacher, or progress dashboard.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { PlacementController } from './placement.controller';
import { PlacementQuestionDeliveryService } from './placement-question-delivery.service';
import { PlacementAnswerSubmitService } from './placement-answer-submit.service';
import { PlacementAttemptCompleteService } from './placement-attempt-complete.service';
import { PlacementAnswerValidationService } from './placement-answer-validation.service';
import { PlacementScoringService } from './placement-scoring.service';
import { PlacementResultService } from './placement-result.service';
import { PlacementInitialLearningPathService } from './placement-initial-learning-path.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [PlacementController],
  providers: [
    PlacementQuestionDeliveryService,
    PlacementAnswerSubmitService,
    PlacementAttemptCompleteService,
    PlacementAnswerValidationService,
    PlacementScoringService,
    PlacementResultService,
    PlacementInitialLearningPathService,
  ],
  exports: [
    PlacementQuestionDeliveryService,
    PlacementAnswerSubmitService,
    PlacementAttemptCompleteService,
    PlacementAnswerValidationService,
    PlacementScoringService,
    PlacementResultService,
    PlacementInitialLearningPathService,
  ],
})
export class PlacementModule {}
