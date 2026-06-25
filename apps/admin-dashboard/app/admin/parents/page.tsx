import { AdminPageHeader } from '../../../components/layout';
import { AdminCard } from '../../../components/common';

const sections = [
  {
    title: 'Parent-Child Links',
    description: 'View and manage parent-student account linking and guardianship records.',
  },
  {
    title: 'Invitations',
    description: 'Track parent invitation status — sent, accepted, revoked, and expired.',
  },
  {
    title: 'Consent Management',
    description: 'Review parental consent records and data-sharing permissions.',
  },
  {
    title: 'Progress Visibility',
    description: 'Configure what progress, assessment, and activity data parents can view.',
  },
  {
    title: 'Safety Summaries',
    description: 'View AI safety summaries shared with parents for their children.',
  },
];

export default function AdminParentsPage() {
  return (
    <section>
      <AdminPageHeader
        eyebrow="Family Management"
        title="Parents & Guardians"
        description="Manage parent-child links, invitations, consent, and progress visibility."
      />

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 'var(--space-24)' }}>
        Parent account linking and consent management are enforced by the Backend API.
        All changes are audited.
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
