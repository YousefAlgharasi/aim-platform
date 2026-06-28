import { getAdminToken } from '../../../lib/api/admin-token';
import { AdminApiClientError } from '../../../lib/api';
import {
  fetchAdminAiPromptTemplates,
  fetchAdminAiModelConfigs,
  fetchAdminAiSafetyEvents,
  fetchAdminAiUsageCost,
  fetchAdminAiAuditLogs,
  createAdminAiPromptDraft,
  publishAdminAiPromptTemplate,
  retireAdminAiPromptTemplate,
  type CreatePromptTemplateDraftPayload,
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

  async function handleCreateDraft(payload: CreatePromptTemplateDraftPayload): Promise<{ error?: string }> {
    'use server';
    const draftToken = await getAdminToken();
    try {
      await createAdminAiPromptDraft(draftToken, payload);
      return {};
    } catch (error) {
      return {
        error: error instanceof AdminApiClientError
          ? `Backend error ${error.status}: ${error.message}`
          : 'Failed to create prompt template draft.',
      };
    }
  }

  async function handlePublish(id: string): Promise<{ error?: string }> {
    'use server';
    const publishToken = await getAdminToken();
    try {
      await publishAdminAiPromptTemplate(publishToken, id);
      return {};
    } catch (error) {
      return {
        error: error instanceof AdminApiClientError
          ? `Backend error ${error.status}: ${error.message}`
          : 'Failed to publish prompt template.',
      };
    }
  }

  async function handleRetire(id: string): Promise<{ error?: string }> {
    'use server';
    const retireToken = await getAdminToken();
    try {
      await retireAdminAiPromptTemplate(retireToken, id);
      return {};
    } catch (error) {
      return {
        error: error instanceof AdminApiClientError
          ? `Backend error ${error.status}: ${error.message}`
          : 'Failed to retire prompt template.',
      };
    }
  }

  return (
    <section className="admin-curriculum-page">
      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      <AiTeacherClient
        section={section}
        rows={rows}
        onCreateDraft={handleCreateDraft}
        onPublish={handlePublish}
        onRetire={handleRetire}
      />
    </section>
  );
}
