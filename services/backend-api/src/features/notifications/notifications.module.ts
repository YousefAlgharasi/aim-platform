// P13-019: Create Notifications Backend Module
// Establishes the backend feature boundary for Phase 13 notifications and
// reminders. Services, repository, and controller are added by later Phase
// 13 tasks; this module only wires the feature into the application.

import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class NotificationsModule {}
