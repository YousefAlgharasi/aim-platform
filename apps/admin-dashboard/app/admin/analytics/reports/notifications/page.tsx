import { getAdminToken } from '../../../../../lib/api/admin-token';
import {
  fetchNotificationAuditLogs,
  fetchNotificationTemplates,
  type NotificationAuditLog,
  type NotificationTemplate,
} from '../../../../../lib/api/admin-notification-analytics-api';
import { NotificationReportsClient } from './notification-reports-client';

export default async function AdminNotificationReportsPage() {
  const token = await getAdminToken();

  let auditLogs: NotificationAuditLog[] = [];
  let templates: NotificationTemplate[] = [];
  let fetchError: string | null = null;

  try {
    [auditLogs, templates] = await Promise.all([
      fetchNotificationAuditLogs(token, 50, 0).catch(() => [] as NotificationAuditLog[]),
      fetchNotificationTemplates(token).catch(() => [] as NotificationTemplate[]),
    ]);
  } catch {
    fetchError = 'Could not load notification data. The notification service may not be configured yet.';
  }

  return (
    <section className="nr-page">
      <div className="nr-header">
        <div>
          <p className="nr-eyebrow">Analytics</p>
          <h1 className="nr-title">Notification Reports</h1>
          <p className="nr-subtitle">Notification delivery audit logs and templates.</p>
        </div>
      </div>

      {fetchError && <div className="admin-error-banner" role="alert">{fetchError}</div>}

      {!fetchError && (
        <NotificationReportsClient auditLogs={auditLogs} templates={templates} />
      )}

      <style>{`
        .nr-page { display: flex; flex-direction: column; gap: 20px; }
        .nr-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .nr-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .nr-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .nr-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
      `}</style>
    </section>
  );
}
