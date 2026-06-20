import {
  NotificationRecipientType,
  ReminderScheduleKind,
  ReminderScheduleStatus,
} from './notification-enums';

export class ReminderScheduleEntity {
  id: string;
  ownerId: string;
  ownerType: NotificationRecipientType;
  kind: ReminderScheduleKind;
  cadence: string;
  nextRunAt: Date;
  status: ReminderScheduleStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Request DTO for a caller-requested custom reminder. `nextRunAt`/`status`
// here are a request, not a guarantee -- the backend validates and assigns
// the authoritative schedule (see notification-authority-rules.md).
export class CreateCustomReminderRequestDto {
  cadence: string;
  requestedNextRunAt: Date;
}
