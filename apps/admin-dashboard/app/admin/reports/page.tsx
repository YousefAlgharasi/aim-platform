import { AdminPlaceholderPage } from '../../../components/admin-placeholder-page';

export default function AdminReportsPage() {
  return (
    <AdminPlaceholderPage
      title="Reports"
      description="Reports placeholder. Analytics and operational reports are not implemented in this task."
      checklist={[
        'Reports must use backend-approved summaries.',
        'No raw AIM Engine internals should be displayed directly.',
        'No local calculation of mastery, weakness, or recommendations.',
      ]}
    />
  );
}
