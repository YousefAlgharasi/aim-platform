import { DigestPeriod, DigestState, NotificationRecipientType } from './notification-enums';

export class NotificationDigestEntity {
  id: string;
  recipientId: string;
  recipientType: NotificationRecipientType;
  period: DigestPeriod;
  periodStart: Date;
  periodEnd: Date;
  eventIds: string[];
  state: DigestState;
  createdAt: Date;
}
