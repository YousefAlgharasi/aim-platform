import { ApiProperty } from '@nestjs/swagger';
import { DigestFrequency, DigestStatus } from './notification-enums';

export class NotificationDigestEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: ['daily', 'weekly'] })
  frequency!: DigestFrequency;

  @ApiProperty({ enum: ['pending', 'sent', 'failed'] })
  status!: DigestStatus;

  @ApiProperty()
  periodStart!: string;

  @ApiProperty()
  periodEnd!: string;

  @ApiProperty()
  eventCount!: number;

  @ApiProperty({ nullable: true })
  sentAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
