import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth';
import { DatabaseModule } from '../../database/database.module';
import { AimModule } from '../aim/aim.module';
import { AssessmentsModule } from '../assessments/assessments.module';
import { StudentsModule } from '../students/students.module';
import { ParentAccessPolicyService } from './parent-access-policy.service';
import { ParentChildLinkService } from './parent-child-link.service';
import { ParentConsentService } from './parent-consent.service';
import { ParentChildProgressService } from './parent-child-progress.service';
import { ParentAssessmentSummaryService } from './parent-assessment-summary.service';
import { ParentActivitySummaryService } from './parent-activity-summary.service';
import { ParentReportService } from './parent-report.service';
import { ParentInvitationService } from './parent-invitation.service';
import { ParentNotificationPreferenceService } from './parent-notification-preference.service';
import { ParentDashboardSummaryService } from './parent-dashboard-summary.service';
import { ParentRepository } from './parent.repository';
import { ParentChildAccessGuard } from './guards';
import { ParentsController } from './parents.controller';
import { ParentsService } from './parents.service';

@Module({
  imports: [AuthModule, DatabaseModule, AimModule, AssessmentsModule, StudentsModule],
  controllers: [ParentsController],
  providers: [
    ParentsService,
    ParentRepository,
    ParentChildLinkService,
    ParentConsentService,
    ParentAccessPolicyService,
    ParentChildAccessGuard,
    ParentDashboardSummaryService,
    ParentChildProgressService,
    ParentAssessmentSummaryService,
    ParentActivitySummaryService,
    ParentReportService,
    ParentInvitationService,
    ParentNotificationPreferenceService,
  ],
  exports: [
    ParentsService,
    ParentRepository,
    ParentChildLinkService,
    ParentConsentService,
    ParentAccessPolicyService,
    ParentChildAccessGuard,
    ParentDashboardSummaryService,
    ParentChildProgressService,
    ParentAssessmentSummaryService,
    ParentActivitySummaryService,
    ParentReportService,
    ParentInvitationService,
    ParentNotificationPreferenceService,
  ],
})
export class ParentsModule {}
