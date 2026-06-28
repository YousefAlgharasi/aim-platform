import { Module } from '@nestjs/common';
import { NotificationsModule } from './notifications.module';
import { ParentsModule } from '../parents/parents.module';
import { NotificationReminderScheduler } from './notification-reminder.scheduler';

@Module({
  imports: [NotificationsModule, ParentsModule],
  providers: [NotificationReminderScheduler],
})
export class NotificationSchedulerModule {}
