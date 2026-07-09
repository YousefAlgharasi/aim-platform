// P10-019: AssessmentsModule.
//
// Scope: Assessment feature module (quizzes, exams, deadlines) only.
//
// Security rules:
//   - Backend is the final authority for grading, scoring, pass/fail,
//     deadline status, and attempt eligibility.
//   - No AI Teacher, payments, parent dashboard, or voice AI here.
//   - AssessmentAimBridgeService feeds already-graded questions into the
//     AIM pipeline via SessionsModule's AimAttemptBridgeService — it never
//     calls the AIM Engine directly, and never recomputes correctness
//     (isCorrect is taken as-is from AssessmentGradingService).
//   - No secrets, service-role keys, database credentials, or AI provider keys.

import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { SessionsModule } from '../sessions/sessions.module';
import { TtsGatewayModule } from '../voice-teacher/tts-gateway/tts-gateway.module';
import { AssessmentGradingService } from './assessment-grading.service';
import { AssessmentScorePolicyService } from './assessment-score-policy.service';
import { AssessmentResultService } from './assessment-result.service';
import { AssessmentFeedbackService } from './assessment-feedback.service';
import { AssessmentRepository } from './assessment.repository';
import { AssessmentService } from './assessment.service';
import { AssessmentDeadlineService } from './assessment-deadline.service';
import { AttemptLifecycleService } from './assessment-attempt.service';
import { AssessmentSubmissionFlowService } from './assessment-submission-flow.service';
import { AssessmentProgressIntegrationService } from './assessment-progress-integration.service';
import { AssessmentAimBridgeService } from './assessment-aim-bridge.service';
import { QuestionDeliveryService } from './question-delivery.service';
import { AnswerSubmissionService } from './answer-submission.service';
import { AssessmentQuestionAudioService } from './assessment-question-audio.service';
import { AssessmentController } from './assessment.controller';
import { AssessmentPermissionGuard } from './guards/assessment-permission.guard';
import { AssessmentAttemptOwnershipGuard } from './guards/assessment-attempt-ownership.guard';
import { AssessmentResultOwnershipGuard } from './guards/assessment-result-ownership.guard';
import { AssessmentAuditService } from './assessment-audit.service';

@Module({
  imports: [DatabaseModule, AuthModule, AnalyticsModule, SessionsModule, TtsGatewayModule],
  controllers: [AssessmentController],
  providers: [
    AssessmentRepository,
    AssessmentService,
    AssessmentDeadlineService,
    AttemptLifecycleService,
    AssessmentGradingService,
    AssessmentScorePolicyService,
    AssessmentResultService,
    AssessmentFeedbackService,
    AssessmentSubmissionFlowService,
    AssessmentProgressIntegrationService,
    AssessmentAimBridgeService,
    QuestionDeliveryService,
    AnswerSubmissionService,
    AssessmentQuestionAudioService,
    AssessmentPermissionGuard,
    AssessmentAttemptOwnershipGuard,
    AssessmentResultOwnershipGuard,
    AssessmentAuditService,
  ],
  exports: [
    AssessmentRepository,
    AssessmentService,
    AssessmentDeadlineService,
    AttemptLifecycleService,
    AssessmentGradingService,
    AssessmentScorePolicyService,
    AssessmentResultService,
    AssessmentFeedbackService,
    AssessmentSubmissionFlowService,
    AssessmentProgressIntegrationService,
    AssessmentAimBridgeService,
    QuestionDeliveryService,
    AnswerSubmissionService,
    AssessmentQuestionAudioService,
    AssessmentPermissionGuard,
    AssessmentAttemptOwnershipGuard,
    AssessmentResultOwnershipGuard,
    AssessmentAuditService,
  ],
})
export class AssessmentsModule {}
