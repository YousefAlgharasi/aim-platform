import {
  NotificationCategory,
  NotificationChannel,
  NotificationEventState,
  NotificationRecipientType,
} from './notification-enums';

// `payload` must remain privacy-safe per
// docs/phase-13/notification-privacy-rules.md -- summary-level fields only,
// never raw answers, AIM output, or secrets.
export class NotificationEventEntity {
  id: string;
  recipientId: string;
  recipientType: NotificationRecipientType;
  templateId: string;
  category: NotificationCategory;
  channel: NotificationChannel;
  payload: Record<string, unknown>;
  state: NotificationEventState;
  readAt: Date | null;
  dismissedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
