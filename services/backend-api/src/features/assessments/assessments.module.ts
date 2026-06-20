// P10-019: AssessmentsModule.
//
// Scope: Assessment feature module (quizzes, exams, deadlines) only.
//
// Security rules:
//   - No AIM Engine, AI Teacher, payments, parent dashboard, or voice AI here.
//   - Backend is the final authority for grading, scoring, pass/fail,
//     deadline status, and attempt eligibility.
//   - No secrets, service-role keys, database credentials, or AI provider keys.

import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { AssessmentGradingService } from './assessment-grading.service';
import { AssessmentScorePolicyService } from './assessment-score-policy.service';
import { AssessmentResultService } from './assessment-result.service';
import { AssessmentFeedbackService } from './assessment-feedback.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [
    AssessmentGradingService,
    AssessmentScorePolicyService,
    AssessmentResultService,
    AssessmentFeedbackService,
  ],
  exports: [
    AssessmentGradingService,
    AssessmentScorePolicyService,
    AssessmentResultService,
    AssessmentFeedbackService,
  ],
})
export class AssessmentsModule {}
