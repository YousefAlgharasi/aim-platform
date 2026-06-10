import { AdminPlaceholderPage } from '../../../components/admin-placeholder-page';

export default function AdminContentPage() {
  return (
    <AdminPlaceholderPage
      title="Content"
      description="Content management placeholder. Course, lesson, and asset workflows are not implemented yet."
      checklist={[
        'Future content editing must use Backend API endpoints.',
        'Draft and published content states must be authorization-aware.',
        'No AI provider keys belong in the browser app.',
      ]}
    />
  );
}
