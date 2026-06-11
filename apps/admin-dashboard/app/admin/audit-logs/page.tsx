import { AdminPlaceholderPage } from '../../../components/admin-placeholder-page';

export default function AdminAuditLogsPage() {
  return (
    <AdminPlaceholderPage
      title="Audit Logs"
      description="Audit log placeholder. Admin action history, content change events, and review decisions are not implemented in this task."
      checklist={[
        'Audit log reads must be role-scoped to pilot_admin and project_owner.',
        'Logs must be written server-side by the Backend API — never from the client.',
        'No raw learner data or AI provider responses should appear in audit entries.',
        'Audit entries must be append-only and must not be editable from this surface.',
      ]}
    />
  );
}
