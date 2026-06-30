import { getAdminToken } from '../../../lib/api/admin-token';
import { AdminApiClientError } from '../../../lib/api';
import {
  fetchAdminNotificationTemplates,
  fetchAdminNotificationQueue,
  fetchAdminReminderSchedules,
  fetchAdminNotificationPreferences,
  fetchAdminNotificationAuditLogs,
  fetchAdminBroadcasts,
  createAdminBroadcast,
  runAdminBroadcastNow,
  disableAdminBroadcast,
  enableAdminBroadcast,
  deleteAdminBroadcast,
  type CreateBroadcastPayload,
} from '../../../lib/api/admin-notifications-api';
import { NotificationsClient, type NotificationsSection } from './notifications-client';

const SECTIONS: NotificationsSection[] = ['broadcasts', 'templates', 'queue', 'schedules', 'preferences', 'audit-logs'];

type Props = {
  searchParams: Promise<{ section?: string; page?: string; status?: string; actorId?: string; action?: string }>;
};

export default async function AdminNotificationsPage({ searchParams }: Props) {
  const { section: sectionParam, page: pageParam, status, actorId, action } = await searchParams;
  const section: NotificationsSection = SECTIONS.includes(sectionParam as NotificationsSection)
    ? (sectionParam as NotificationsSection)
    : 'broadcasts';
  const page = parseInt(pageParam ?? '1', 10) || 1;
  const token = await getAdminToken();

  let fetchError: string | null = null;
  let total = 0;
  let limit = 20;
  let rows: unknown[] = [];

  try {
    switch (section) {
      case 'broadcasts': {
        const result = await fetchAdminBroadcasts(token, page, 20);
        rows = result.data as unknown[];
        total = result.total;
        limit = result.limit;
        break;
      }
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

  async function handleCreateBroadcast(payload: CreateBroadcastPayload): Promise<{ error?: string }> {
    'use server';
    const t = await getAdminToken();
    try {
      await createAdminBroadcast(t, payload);
      return {};
    } catch (error) {
      return {
        error: error instanceof AdminApiClientError
          ? `Backend error ${error.status}: ${error.message}`
          : 'Failed to create broadcast.',
      };
    }
  }

  async function handleRunBroadcast(id: string): Promise<{ error?: string }> {
    'use server';
    const t = await getAdminToken();
    try {
      await runAdminBroadcastNow(t, id);
      return {};
    } catch (error) {
      return {
        error: error instanceof AdminApiClientError
          ? `Backend error ${error.status}: ${error.message}`
          : 'Failed to run broadcast.',
      };
    }
  }

  async function handleDisableBroadcast(id: string): Promise<{ error?: string }> {
    'use server';
    const t = await getAdminToken();
    try {
      await disableAdminBroadcast(t, id);
      return {};
    } catch (error) {
      return {
        error: error instanceof AdminApiClientError
          ? `Backend error ${error.status}: ${error.message}`
          : 'Failed to disable broadcast.',
      };
    }
  }

  async function handleEnableBroadcast(id: string): Promise<{ error?: string }> {
    'use server';
    const t = await getAdminToken();
    try {
      await enableAdminBroadcast(t, id);
      return {};
    } catch (error) {
      return {
        error: error instanceof AdminApiClientError
          ? `Backend error ${error.status}: ${error.message}`
          : 'Failed to enable broadcast.',
      };
    }
  }

  async function handleDeleteBroadcast(id: string): Promise<{ error?: string }> {
    'use server';
    const t = await getAdminToken();
    try {
      await deleteAdminBroadcast(t, id);
      return {};
    } catch (error) {
      return {
        error: error instanceof AdminApiClientError
          ? `Backend error ${error.status}: ${error.message}`
          : 'Failed to delete broadcast.',
      };
    }
  }

  return (
    <section className="admin-curriculum-page">
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
        onCreateBroadcast={handleCreateBroadcast}
        onRunBroadcast={handleRunBroadcast}
        onDisableBroadcast={handleDisableBroadcast}
        onEnableBroadcast={handleEnableBroadcast}
        onDeleteBroadcast={handleDeleteBroadcast}
      />
    </section>
  );
}
