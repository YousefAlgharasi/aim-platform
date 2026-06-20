import { ApiProperty } from '@nestjs/swagger';

export class QuietHoursEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  enabled!: boolean;

  @ApiProperty({ description: 'HH:mm format, e.g. 22:00' })
  startTime!: string;

  @ApiProperty({ description: 'HH:mm format, e.g. 07:00' })
  endTime!: string;

  @ApiProperty({ description: 'IANA timezone, e.g. Asia/Riyadh' })
  timezone!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
