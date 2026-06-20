import { DeliveryAttemptStatus, NotificationChannel } from './notification-enums';

// `provider` is an abstracted name only (e.g. "fcm", "apns", "smtp").
// Provider credentials are never stored on this entity.
export class NotificationDeliveryAttemptEntity {
  id: string;
  notificationEventId: string;
  channel: NotificationChannel;
  provider: string;
  attemptNumber: number;
  status: DeliveryAttemptStatus;
  errorCode: string | null;
  createdAt: Date;
}
