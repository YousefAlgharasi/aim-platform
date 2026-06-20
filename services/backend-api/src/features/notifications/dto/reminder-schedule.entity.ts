import { ApiProperty } from '@nestjs/swagger';
import { ReminderType, ReminderScheduleStatus } from './notification-enums';

export class ReminderScheduleEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: ['learning_plan', 'review_schedule', 'deadline', 'streak', 'custom'] })
  reminderType!: ReminderType;

  @ApiProperty({ enum: ['active', 'paused', 'completed', 'cancelled'] })
  status!: ReminderScheduleStatus;

  @ApiProperty({ nullable: true })
  referenceId!: string | null;

  @ApiProperty()
  cronExpression!: string;

  @ApiProperty({ nullable: true })
  nextFireAt!: string | null;

  @ApiProperty({ nullable: true })
  lastFiredAt!: string | null;

  @ApiProperty({ nullable: true })
  endsAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
