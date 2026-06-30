// P13-019: Create Notifications Backend Module
// Wires the Phase 13 notifications feature (templates, preferences, device
// tokens, in-app inbox, reminder schedules, delivery, digests, audit log)
// into the application, including admin read-only endpoints.

import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth';
import { DatabaseModule } from '../../database/database.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { ParentsModule } from '../parents/parents.module';

import { NotificationRepository } from './notification.repository';
import { NotificationAuditService } from './notification-audit.service';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationEligibilityService } from './notification-eligibility.service';
import { NotificationRateLimitService } from './notification-rate-limit.service';
import { NotificationQueueService } from './notification-queue.service';
import { NotificationRetryService } from './notification-retry.service';
import { NotificationDigestService } from './notification-digest.service';
import { InAppNotificationService } from './in-app-notification.service';
import { ReminderScheduleService } from './reminder-schedule.service';
import { DeviceTokenService } from './device-token.service';
import { NotificationDeliveryWorker } from './notification-delivery.worker';

import { DeadlineReminderIntegration } from './deadline-reminder.integration';
import { LearningReminderIntegration } from './learning-reminder.integration';
import { StreakReminderIntegration } from './streak-reminder.integration';
import { ParentSummaryReminderIntegration } from './parent-summary-reminder.integration';

import { PUSH_PROVIDER_ADAPTER } from './push-provider-adapter.interface';
import { EMAIL_PROVIDER_ADAPTER } from './email-provider-adapter.interface';
import { NoopPushProviderAdapter } from './noop-push-provider.adapter';
import { NoopEmailProviderAdapter } from './noop-email-provider.adapter';

import { NotificationAdminGuard, NotificationOwnershipGuard } from './guards';

import { PreferencesController } from './preferences.controller';
import { RemindersController } from './reminders.controller';
import { InboxController } from './inbox.controller';
import { DeviceTokenController } from './device-token.controller';
import { NotificationsAdminController } from './notifications-admin.controller';
import { AdminBroadcastService } from './admin-broadcast.service';
import { NotificationReminderScheduler } from './notification-reminder.scheduler';

@Module({
  imports: [AuthModule, DatabaseModule, AnalyticsModule, UsersModule, RolesModule, ParentsModule],
  controllers: [
    PreferencesController,
    RemindersController,
    InboxController,
    DeviceTokenController,
    NotificationsAdminController,
  ],
  providers: [
    NotificationRepository,
    NotificationAuditService,
    NotificationTemplateService,
    NotificationPreferenceService,
    NotificationEligibilityService,
    NotificationRateLimitService,
    NotificationQueueService,
    NotificationRetryService,
    NotificationDigestService,
    InAppNotificationService,
    ReminderScheduleService,
    DeviceTokenService,
    NotificationDeliveryWorker,
    DeadlineReminderIntegration,
    LearningReminderIntegration,
    StreakReminderIntegration,
    ParentSummaryReminderIntegration,
    NotificationAdminGuard,
    NotificationOwnershipGuard,
    AdminBroadcastService,
    NotificationReminderScheduler,
    { provide: PUSH_PROVIDER_ADAPTER, useClass: NoopPushProviderAdapter },
    { provide: EMAIL_PROVIDER_ADAPTER, useClass: NoopEmailProviderAdapter },
  ],
  exports: [
    NotificationQueueService,
    InAppNotificationService,
    ReminderScheduleService,
    DeadlineReminderIntegration,
    LearningReminderIntegration,
    StreakReminderIntegration,
    ParentSummaryReminderIntegration,
  ],
})
export class NotificationsModule {}
