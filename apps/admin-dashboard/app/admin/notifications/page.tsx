import { getAdminToken } from '../../../lib/api/admin-token';
import { AdminApiClientError } from '../../../lib/api';
import {
  fetchAdminNotificationTemplates,
  fetchAdminNotificationQueue,
  fetchAdminReminderSchedules,
  fetchAdminNotificationPreferences,
  fetchAdminNotificationAuditLogs,
} from '../../../lib/api/admin-notifications-api';
import { NotificationsClient, type NotificationsSection } from './notifications-client';

const SECTIONS: NotificationsSection[] = ['templates', 'queue', 'schedules', 'preferences', 'audit-logs'];

type Props = {
  searchParams: Promise<{ section?: string; page?: string; status?: string; actorId?: string; action?: string }>;
};

export default async function AdminNotificationsPage({ searchParams }: Props) {
  const { section: sectionParam, page: pageParam, status, actorId, action } = await searchParams;
  const section: NotificationsSection = SECTIONS.includes(sectionParam as NotificationsSection)
    ? (sectionParam as NotificationsSection)
    : 'templates';
  const page = parseInt(pageParam ?? '1', 10) || 1;
  const token = await getAdminToken();

  let fetchError: string | null = null;
  let total = 0;
  let limit = 20;
  let rows: unknown[] = [];

  try {
    switch (section) {
      case 'templates': {
        const result = await fetchAdminNotificationTemplates(token, page, 50);
        rows = result.data as unknown[];
        total = result.total;
        limit = result.limit;
        break;
      }
      case 'queue': {
        const result = await fetchAdminNotificationQueue(token, page, 20);
        rows = result.data as unknown[];
        total = result.total;
        limit = result.limit;
        break;
      }
      case 'schedules': {
        const result = await fetchAdminReminderSchedules(token, page, 20, status);
        rows = result.data as unknown[];
        total = result.total;
        limit = result.limit;
        break;
      }
      case 'preferences': {
        const result = await fetchAdminNotificationPreferences(token, page, 20);
        rows = result.data as unknown[];
        total = result.total;
        limit = result.limit;
        break;
      }
      case 'audit-logs': {
        const result = await fetchAdminNotificationAuditLogs(token, page, 50, {
          ...(actorId ? { actorId } : {}),
          ...(action ? { action } : {}),
        });
        rows = result.data as unknown[];
        total = result.total;
        limit = result.limit;
        break;
      }
    }
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load notifications data.';
  }

  return (
    <section className="admin-curriculum-page">
      <header className="admin-page-header">
        <p className="eyebrow">Admin — Communication</p>
        <h1>Notifications</h1>
        <p className="admin-page-meta">{total} {section.replace(/-/g, ' ')} entr{total !== 1 ? 'ies' : 'y'}</p>
      </header>

      <div className="admin-boundary-note">
        <strong>Read-only:</strong> Notification templates, delivery, schedules, preferences,
        and audit logs are written server-side by the backend API. No data can be edited from this surface.
      </div>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      <NotificationsClient
        section={section}
        rows={rows}
        total={total}
        page={page}
        totalPages={Math.ceil(total / limit)}
        filterStatus={status ?? ''}
        filterActorId={actorId ?? ''}
        filterAction={action ?? ''}
      />
    </section>
  );
}
