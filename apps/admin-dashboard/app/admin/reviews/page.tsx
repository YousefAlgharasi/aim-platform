import { AdminPlaceholderPage } from '../../../components/admin-placeholder-page';

export default function AdminReviewsPage() {
  return (
    <AdminPlaceholderPage
      title="Review Queue"
      description="Human review queue placeholder. Disputed grades and AI review workflows are not implemented yet."
      checklist={[
        'Reviewer access must be scoped by backend authorization.',
        'Raw learner internals must not be exposed by default.',
        'Review decisions must be auditable in later tasks.',
      ]}
    />
  );
}
