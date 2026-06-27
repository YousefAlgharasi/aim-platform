import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth';
import { DatabaseModule } from '../../database/database.module';
import { NotificationsAdminController } from './notifications-admin.controller';
import { NotificationAuditService } from './notification-audit.service';
import { NotificationRepository } from './notification.repository';
import { NotificationAdminGuard } from './guards';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [NotificationsAdminController],
  providers: [NotificationAuditService, NotificationRepository, NotificationAdminGuard],
  exports: [NotificationRepository],
})
export class NotificationsModule {}
