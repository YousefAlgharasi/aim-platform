// Phase 4 — P4-039/P4-040/P4-037/P4-041/P4-042/P4-043/P4-044/P4-045/P4-046/P4-047/P4-048/P4-049/P4-050/P4-051
// PlacementModule.
//
// Scope: Placement Test system only.
//
// Security rules:
//   - No AIM Engine runtime, lesson delivery, AI Teacher, or progress dashboard.
//   - No secrets, service-role keys, or privileged config here.

import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { PlacementController } from './placement.controller';
import { PlacementAdminController } from './placement-admin.controller';
import { PlacementAdminTestReadService } from './placement-admin-test-read.service';
import { PlacementAdminWriteService } from './placement-admin-write.service';
import { PlacementQuestionDeliveryService } from './placement-question-delivery.service';
import { PlacementAttemptService } from './placement-attempt.service';
import { PlacementAnswerSubmitService } from './placement-answer-submit.service';
import { PlacementAttemptCompleteService } from './placement-attempt-complete.service';
import { PlacementAnswerValidationService } from './placement-answer-validation.service';
import { PlacementScoringService } from './placement-scoring.service';
import { PlacementResultService } from './placement-result.service';
import { PlacementInitialLearningPathService } from './placement-initial-learning-path.service';
import { PlacementLevelStateService } from './placement-level-state.service';
import { PlacementResultReadService } from './placement-result-read.service';
import { PlacementRetakePolicyService } from './placement-retake-policy.service';
import { PlacementAuditService } from './placement-audit.service';
import { PlacementAnalyticsService } from './placement-analytics.service';
import { PlacementPermissionGuard } from './placement-permission.guard';
import { PlacementSectionsService } from './placement-sections.service';
import { PlacementTestReadService } from './placement-test-read.service';

@Module({
  imports: [DatabaseModule, AuthModule, RolesModule, UsersModule],
  controllers: [PlacementController, PlacementAdminController],
  providers: [
    PlacementTestReadService,
    PlacementAdminTestReadService,
    PlacementAdminWriteService,
    PlacementSectionsService,
    PlacementQuestionDeliveryService,
    PlacementAttemptService,
    PlacementRetakePolicyService,
    PlacementAnswerSubmitService,
    PlacementAttemptCompleteService,
    PlacementAnswerValidationService,
    PlacementScoringService,
    PlacementResultService,
    PlacementInitialLearningPathService,
    PlacementLevelStateService,
    PlacementResultReadService,
    PlacementAuditService,
    PlacementAnalyticsService,
    PlacementPermissionGuard,
  ],
  exports: [
    PlacementTestReadService,
    PlacementSectionsService,
    PlacementQuestionDeliveryService,
    PlacementAttemptService,
    PlacementRetakePolicyService,
    PlacementAnswerSubmitService,
    PlacementAttemptCompleteService,
    PlacementAnswerValidationService,
    PlacementScoringService,
    PlacementResultService,
    PlacementInitialLearningPathService,
    PlacementResultReadService,
    PlacementAuditService,
    PlacementPermissionGuard,
  ],
})
export class PlacementModule {}
