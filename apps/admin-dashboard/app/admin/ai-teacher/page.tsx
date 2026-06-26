import { AdminPageHeader } from '../../../components/layout';
import { AdminCard } from '../../../components/common';

const sections = [
  {
    title: 'Prompt Templates',
    description: 'Create, publish, and retire prompt templates used by the AI Teacher.',
  },
  {
    title: 'Model Configuration',
    description: 'Configure AI model providers, parameters, and per-student usage limits.',
  },
  {
    title: 'Safety & Content Filtering',
    description: 'Review flagged content, safety events, and moderation decisions.',
  },
  {
    title: 'Usage & Cost Tracking',
    description: 'Monitor AI usage metrics, token consumption, and costs per student.',
  },
  {
    title: 'AI Audit Logs',
    description: 'View audit trail of AI interactions, prompt changes, and governance events.',
  },
];

export default function AdminAITeacherPage() {
  return (
    <section>
      <AdminPageHeader
        eyebrow="AI Management"
        title="AI Teacher"
        description="Manage prompt templates, model configuration, safety reviews, and usage tracking."
      />

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 'var(--space-24)' }}>
        AI Teacher configuration and safety controls are enforced by the Backend API.
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
