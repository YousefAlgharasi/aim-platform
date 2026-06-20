import { NotificationRecipientType } from './notification-enums';

export class NotificationQuietHoursEntity {
  id: string;
  userId: string;
  userType: NotificationRecipientType;
  startTime: string;
  endTime: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request DTO for updating the caller's quiet-hour window. The backend
// validates ownership and format; it does not retroactively affect
// already-queued dispatch decisions.
export class UpdateQuietHoursRequestDto {
  startTime: string;
  endTime: string;
  timezone: string;
}
