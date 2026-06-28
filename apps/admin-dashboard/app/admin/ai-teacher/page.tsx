import { getAdminToken } from '../../../lib/api/admin-token';
import { AdminApiClientError } from '../../../lib/api';
import {
  fetchAdminAiPromptTemplates,
  fetchAdminAiModelConfigs,
  fetchAdminAiSafetyEvents,
  fetchAdminAiUsageCost,
  fetchAdminAiAuditLogs,
} from '../../../lib/api/admin-ai-teacher-api';
import { AiTeacherClient, type AiTeacherSection } from './ai-teacher-client';

const SECTIONS: AiTeacherSection[] = ['prompts', 'model-configs', 'safety', 'usage', 'audit-logs'];

type Props = {
  searchParams: Promise<{ section?: string }>;
};

export default async function AdminAITeacherPage({ searchParams }: Props) {
  const { section: sectionParam } = await searchParams;
  const section: AiTeacherSection = SECTIONS.includes(sectionParam as AiTeacherSection)
    ? (sectionParam as AiTeacherSection)
    : 'prompts';
  const token = await getAdminToken();

  let fetchError: string | null = null;
  let rows: unknown[] = [];

  try {
    switch (section) {
      case 'prompts':
        rows = await fetchAdminAiPromptTemplates(token);
        break;
      case 'model-configs':
        rows = await fetchAdminAiModelConfigs(token);
        break;
      case 'safety':
        rows = await fetchAdminAiSafetyEvents(token);
        break;
      case 'usage':
        rows = await fetchAdminAiUsageCost(token);
        break;
      case 'audit-logs':
        rows = await fetchAdminAiAuditLogs(token);
        break;
    }
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load AI Teacher data.';
  }

  return (
    <section className="admin-curriculum-page">
      <header className="admin-page-header">
        <p className="eyebrow">Admin — AI Management</p>
        <h1>AI Teacher</h1>
        <p className="admin-page-meta">{rows.length} {section.replace(/-/g, ' ')} entr{rows.length !== 1 ? 'ies' : 'y'}</p>
      </header>

      <div className="admin-boundary-note">
        <strong>Read-only:</strong> AI Teacher prompt templates, model configuration, safety reviews,
        usage/cost tracking, and audit logs are written server-side by the backend API.
        No data can be edited from this surface.
      </div>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      <AiTeacherClient section={section} rows={rows} />
    </section>
  );
}
