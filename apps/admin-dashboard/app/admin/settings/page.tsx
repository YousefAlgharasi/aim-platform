import { AdminPlaceholderPage } from '../../../components/admin-placeholder-page';

export default function AdminSettingsPage() {
  return (
    <AdminPlaceholderPage
      title="Settings"
      description="Admin settings placeholder. Runtime configuration, role management, and permission changes are not implemented yet."
      checklist={[
        'Do not store secrets in client-side settings.',
        'Role changes must be backend-controlled in future tasks.',
        'Environment values exposed to the browser must be non-secret.',
        'Role-based menu placeholders must not be treated as authorization.',
      ]}
    />
  );
}
