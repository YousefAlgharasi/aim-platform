import { AdminPlaceholderPage } from '../../../components/admin-placeholder-page';

export default function AdminStudentsPage() {
  return (
    <AdminPlaceholderPage
      title="Students"
      description="Student administration placeholder. No learner records are loaded or modified in this task."
      checklist={[
        'Future access must be role-scoped.',
        'Future learner records must come from the Backend API.',
        'No direct database access is allowed from the dashboard.',
      ]}
    />
  );
}
