// Phase 4 — P4-053
// Admin placement management placeholder page.
//
// Scope: Placement Test phase only.
// Full placement management UI implemented in P4-054 (list) and P4-058 (status UI).
//
// Security rules:
// - Only pilot_admin and content_manager roles can access this section.
// - Role enforcement is handled by the backend API, not by this page.
// - No placement scoring, CEFR thresholds, or skill maps are displayed here.
// - No AIM Engine runtime, AI Teacher, or lesson delivery features are included.

import { AdminPlaceholderPage } from '../../../components/admin-placeholder-page';

export default function AdminPlacementPage() {
  return (
    <AdminPlaceholderPage
      title="Placement"
      description="Placement test management. Admins can create, publish, and archive placement tests. Full management UI is implemented in P4-054 and P4-058."
      checklist={[
        'Access must be restricted to pilot_admin and content_manager roles.',
        'Placement test status transitions (draft → published → archived) are enforced by the Backend API.',
        'Only one placement test may be published at a time — enforced by the backend.',
        'Placement scoring, CEFR level assignment, and skill maps are computed by the backend only.',
        'No AIM Engine runtime, AI Teacher, or lesson delivery features are included.',
      ]}
    />
  );
}
