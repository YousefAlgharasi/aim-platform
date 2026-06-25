import { AdminPageHeader } from '../../../components/layout';
import { AdminCard } from '../../../components/common';

const sections = [
  {
    title: 'Notification Templates',
    description: 'Manage notification templates for push, email, and in-app channels.',
  },
  {
    title: 'Delivery Queue',
    description: 'Monitor notification delivery status, retries, and failures.',
  },
  {
    title: 'Reminder Schedules',
    description: 'View and manage deadline, learning, progress, and summary reminders.',
  },
  {
    title: 'User Preferences',
    description: 'Overview of notification preference settings across users.',
  },
  {
    title: 'Notification Audit Log',
    description: 'Track notification sends, bounces, and preference changes.',
  },
];

export default function AdminNotificationsPage() {
  return (
    <section>
      <AdminPageHeader
        eyebrow="Communication"
        title="Notifications"
        description="Manage notification templates, delivery queues, reminders, and audit logs."
      />

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 'var(--space-24)' }}>
        Notification delivery and rate limiting are handled by the Backend API.
        All notification events are logged.
      </p>

      <div style={{ display: 'grid', gap: 'var(--space-16)' }}>
        {sections.map((s) => (
          <AdminCard key={s.title}>
            <h3 style={{
              fontSize: 15,
              fontWeight: 'var(--weight-semibold)' as unknown as number,
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-4)',
            }}>
              {s.title}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              {s.description}
            </p>
          </AdminCard>
        ))}
      </div>
    </section>
  );
}
