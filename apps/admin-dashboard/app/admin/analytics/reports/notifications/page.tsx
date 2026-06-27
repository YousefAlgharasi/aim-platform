import Link from 'next/link';
import { getAdminToken } from '../../../../../lib/api/admin-token';
import { AdminApiClientError } from '../../../../../lib/api';
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
      fetchNotificationAuditLogs(token, 50, 0),
      fetchNotificationTemplates(token),
    ]);
  } catch (error) {
    fetchError = error instanceof AdminApiClientError
      ? `Backend error ${error.status}: ${error.message}`
      : 'Failed to load notification data.';
  }

  return (
    <section className="nr-page">
      <nav className="nr-breadcrumb">
        <Link href="/admin/analytics" className="nr-breadcrumb-link">Analytics</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
        <span className="nr-breadcrumb-current">Notification Reports</span>
      </nav>

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
        .nr-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
        .nr-breadcrumb-link { color: var(--text-link); text-decoration: none; }
        .nr-breadcrumb-link:hover { text-decoration: underline; }
        .nr-breadcrumb-current { color: var(--text-secondary); font-weight: 500; }
        .nr-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .nr-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .nr-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .nr-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
      `}</style>
    </section>
  );
}
