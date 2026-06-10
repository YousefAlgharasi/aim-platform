import { AdminPlaceholderPage } from '../../components/admin-placeholder-page';

export default function AdminOverviewPage() {
  return (
    <AdminPlaceholderPage
      title="Admin Overview"
      description="Internal overview placeholder. Production dashboard analytics are not implemented in Phase 1."
      checklist={[
        'Use Backend API for future admin workflows.',
        'Keep authorization final on the Backend API.',
        'Do not expose service-role keys or database credentials.',
      ]}
    />
  );
}
