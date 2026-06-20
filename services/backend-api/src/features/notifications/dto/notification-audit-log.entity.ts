import { ApiProperty } from '@nestjs/swagger';
import { NotificationAuditEventType } from './notification-enums';

export class NotificationAuditLogEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  eventType!: NotificationAuditEventType;

  @ApiProperty({ nullable: true })
  resourceId!: string | null;

  @ApiProperty({ nullable: true })
  resourceType!: string | null;

  @ApiProperty({ nullable: true, description: 'Safe metadata only — no secrets or sensitive data' })
  metadata!: Record<string, unknown> | null;

  @ApiProperty()
  createdAt!: string;
}
