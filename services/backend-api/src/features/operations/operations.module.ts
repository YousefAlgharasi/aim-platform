import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { OperationsRepository } from './operations.repository';
import { SupportTicketService } from './support-ticket.service';
import { FeedbackService } from './feedback.service';
import { FeatureRequestService } from './feature-request.service';
import { IncidentService } from './incident.service';
import { MaintenanceWindowService } from './maintenance-window.service';
import { ReleaseNotesService } from './release-notes.service';
import { OperationalStatusService } from './operational-status.service';
import { FeatureFlagService } from './feature-flag.service';
import { OperationsAuditService } from './operations-audit.service';
import { SupportTicketController } from './support-ticket.controller';
import { FeedbackController } from './feedback.controller';
import { FeatureRequestController } from './feature-request.controller';
import { ReleaseNotesController } from './release-notes.controller';
import { OperationalStatusController } from './operational-status.controller';
import { MaintenanceWindowController } from './maintenance-window.controller';
import { AdminSupportController } from './admin-support.controller';
import { AdminIncidentController } from './admin-incident.controller';
import { AdminMaintenanceController } from './admin-maintenance.controller';
import { AdminReleaseNotesController } from './admin-release-notes.controller';
import { AdminFeatureFlagsController } from './admin-feature-flags.controller';
import { AdminOperationsDashboardController } from './admin-operations-dashboard.controller';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [
    OperationsRepository,
    SupportTicketService,
    FeedbackService,
    FeatureRequestService,
    IncidentService,
    MaintenanceWindowService,
    ReleaseNotesService,
    OperationalStatusService,
    FeatureFlagService,
    OperationsAuditService,
  ],
  controllers: [
    SupportTicketController,
    FeedbackController,
    FeatureRequestController,
    ReleaseNotesController,
    OperationalStatusController,
    MaintenanceWindowController,
    AdminSupportController,
    AdminIncidentController,
    AdminMaintenanceController,
    AdminReleaseNotesController,
    AdminFeatureFlagsController,
    AdminOperationsDashboardController,
  ],
  exports: [
    OperationsRepository,
    SupportTicketService,
    FeedbackService,
    FeatureRequestService,
    IncidentService,
    MaintenanceWindowService,
    ReleaseNotesService,
    OperationalStatusService,
    FeatureFlagService,
    OperationsAuditService,
  ],
})
export class OperationsModule {}
