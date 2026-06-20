import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth';
import { DatabaseModule } from '../../database/database.module';
import { NotificationRepository } from './notification.repository';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationPreferenceService } from './notification-preference.service';
import { DeviceTokenService } from './device-token.service';
import { ReminderScheduleService } from './reminder-schedule.service';
import { NotificationEligibilityService } from './notification-eligibility.service';
import { NotificationQueueService } from './notification-queue.service';
import { InAppNotificationService } from './in-app-notification.service';
import { NotificationDeliveryWorker } from './notification-delivery.worker';
import { NotificationRetryService } from './notification-retry.service';
import { NotificationDigestService } from './notification-digest.service';
import { NotificationAuditService } from './notification-audit.service';
import { NotificationRateLimitService } from './notification-rate-limit.service';
import { LearningReminderIntegration } from './learning-reminder.integration';
import { DeadlineReminderIntegration } from './deadline-reminder.integration';
import { StreakReminderIntegration } from './streak-reminder.integration';
import { ParentSummaryReminderIntegration } from './parent-summary-reminder.integration';
import { NotificationsController } from './notifications.controller';
import { NotificationsAdminController } from './notifications-admin.controller';
import { NotificationOwnershipGuard, NotificationAdminGuard } from './guards';
import { PUSH_PROVIDER_ADAPTER } from './push-provider-adapter.interface';
import { NoopPushProviderAdapter } from './noop-push-provider.adapter';
import { EMAIL_PROVIDER_ADAPTER } from './email-provider-adapter.interface';
import { NoopEmailProviderAdapter } from './noop-email-provider.adapter';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [NotificationsController, NotificationsAdminController],
  providers: [
    NotificationRepository,
    NotificationTemplateService,
    NotificationPreferenceService,
    DeviceTokenService,
    ReminderScheduleService,
    NotificationEligibilityService,
    NotificationQueueService,
    InAppNotificationService,
    NotificationDeliveryWorker,
    NotificationRetryService,
    NotificationDigestService,
    NotificationAuditService,
    NotificationRateLimitService,
    LearningReminderIntegration,
    DeadlineReminderIntegration,
    StreakReminderIntegration,
    ParentSummaryReminderIntegration,
    NotificationOwnershipGuard,
    NotificationAdminGuard,
    { provide: PUSH_PROVIDER_ADAPTER, useClass: NoopPushProviderAdapter },
    { provide: EMAIL_PROVIDER_ADAPTER, useClass: NoopEmailProviderAdapter },
  ],
  exports: [
    NotificationRepository,
    NotificationTemplateService,
    NotificationPreferenceService,
    DeviceTokenService,
    ReminderScheduleService,
    NotificationEligibilityService,
    NotificationQueueService,
    InAppNotificationService,
    NotificationDeliveryWorker,
    NotificationRetryService,
    NotificationDigestService,
    NotificationAuditService,
    NotificationRateLimitService,
    LearningReminderIntegration,
    DeadlineReminderIntegration,
    StreakReminderIntegration,
    ParentSummaryReminderIntegration,
  ],
})
export class NotificationsModule {}
