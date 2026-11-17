import { getAdminToken } from '../../../core/api/admin-token';
import { AdminApiClientError } from '../../../core/api';
import {
  fetchAdminAiSystemPrompt,
  saveAdminAiPromptPart,
  resetAdminAiPromptPart,
  addAdminAiRule,
  updateAdminAiRule,
  deleteAdminAiRule,
  fetchAdminAiPromptTemplates,
  fetchAdminAiModelConfigs,
  fetchAdminAiSafetyEvents,
  fetchAdminAiUsageCost,
  fetchAdminAiAuditLogs,
  createAdminAiPromptDraft,
  publishAdminAiPromptTemplate,
  retireAdminAiPromptTemplate,
  type CreatePromptTemplateDraftPayload,
} from '../../../core/api/admin-ai-teacher-api';
import { AiTeacherClient, type AiTeacherSection } from '../../../features/ai-teacher';

const SECTIONS: AiTeacherSection[] = ['system-prompt', 'safety', 'usage'];

type Props = {
  searchParams: Promise<{ section?: string }>;
};

export default async function AdminAITeacherPage({ searchParams }: Props) {
  const { section: sectionParam } = await searchParams;
  const section: AiTeacherSection = SECTIONS.includes(sectionParam as AiTeacherSection)
    ? (sectionParam as AiTeacherSection)
    : 'system-prompt';
  const token = await getAdminToken();

  let fetchError: string | null = null;
  let rows: unknown[] = [];

  try {
    switch (section) {
      case 'system-prompt':
        rows = [await fetchAdminAiSystemPrompt(token)];
        break;
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

  async function run(fn: (t: string) => Promise<void>, fallback: string): Promise<{ error?: string }> {
    const t = await getAdminToken();
    try {
      await fn(t);
      return {};
    } catch (error) {
      return { error: error instanceof AdminApiClientError ? error.message : fallback };
    }
  }
  async function savePart(key: string, body: string) {
    'use server';
    return run((t) => saveAdminAiPromptPart(t, key, body), 'Failed to save the prompt.');
  }
  async function resetPart(key: string) {
    'use server';
    return run((t) => resetAdminAiPromptPart(t, key), 'Failed to reset the prompt.');
  }
  async function addRule(rule: { title: string; body: string; courseTitles?: string[] | null }) {
    'use server';
    return run((t) => addAdminAiRule(t, rule), 'Failed to add the rule.');
  }
  async function updateRule(id: string, patch: { title?: string; body?: string; enabled?: boolean; courseTitles?: string[] | null }) {
    'use server';
    return run((t) => updateAdminAiRule(t, id, patch), 'Failed to update the rule.');
  }
  async function deleteRule(id: string) {
    'use server';
    return run((t) => deleteAdminAiRule(t, id), 'Failed to delete the rule.');
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
        systemPromptActions={{ savePart, resetPart, addRule, updateRule, deleteRule }}
      />
    </section>
  );
}
