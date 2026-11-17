// Admin AI Teacher API client (read-only)
import { adminApiClient } from './admin-api-client';
import { decodeArray } from './decoders';

/* ---- Prompt Templates ---- */

export type AdminAiPromptTemplateItem = {
  readonly id: string;
  readonly name: string;
  readonly version: number;
  readonly locale: string;
  readonly audience: string;
  readonly status: string;
  readonly body: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

function decodePromptTemplate(v: unknown): AdminAiPromptTemplateItem {
  const o = v as Record<string, unknown>;
  return {
    id:        String(o.id ?? ''),
    name:      String(o.name ?? ''),
    version:   Number(o.version ?? 0),
    locale:    String(o.locale ?? ''),
    audience:  String(o.audience ?? ''),
    status:    String(o.status ?? ''),
    body:      String(o.body ?? ''),
    createdAt: String(o.created_at ?? o.createdAt ?? ''),
    updatedAt: String(o.updated_at ?? o.updatedAt ?? ''),
  };
}

export async function fetchAdminAiPromptTemplates(token: string): Promise<AdminAiPromptTemplateItem[]> {
  const envelope = await adminApiClient.get(
    '/admin/ai/prompts',
    (v) => decodeArray(v, decodePromptTemplate),
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}

export type CreatePromptTemplateDraftPayload = {
  readonly name: string;
  readonly locale: string;
  readonly audience: string;
  readonly body: string;
  readonly safetyTags?: Record<string, unknown>;
};

export async function createAdminAiPromptDraft(
  token: string,
  payload: CreatePromptTemplateDraftPayload,
): Promise<AdminAiPromptTemplateItem> {
  const envelope = await adminApiClient.post(
    '/admin/ai/prompts',
    decodePromptTemplate,
    { headers: { authorization: `Bearer ${token}` }, body: payload },
  );
  return envelope.data;
}

export async function publishAdminAiPromptTemplate(token: string, id: string): Promise<AdminAiPromptTemplateItem> {
  const envelope = await adminApiClient.post(
    `/admin/ai/prompts/${encodeURIComponent(id)}/publish`,
    decodePromptTemplate,
    { headers: { authorization: `Bearer ${token}` }, body: {} },
  );
  return envelope.data;
}

export async function retireAdminAiPromptTemplate(token: string, id: string): Promise<AdminAiPromptTemplateItem> {
  const envelope = await adminApiClient.post(
    `/admin/ai/prompts/${encodeURIComponent(id)}/retire`,
    decodePromptTemplate,
    { headers: { authorization: `Bearer ${token}` }, body: {} },
  );
  return envelope.data;
}

/* ---- Model Configs ---- */

export type AdminAiModelConfigItem = {
  readonly id: string;
  readonly name: string;
  readonly providerKeyRef: string;
  readonly modelId: string;
  readonly tier: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

function decodeModelConfig(v: unknown): AdminAiModelConfigItem {
  const o = v as Record<string, unknown>;
  return {
    id:             String(o.id ?? ''),
    name:           String(o.name ?? ''),
    providerKeyRef: String(o.provider_key_ref ?? o.providerKeyRef ?? ''),
    modelId:        String(o.model_id ?? o.modelId ?? ''),
    tier:           String(o.tier ?? ''),
    status:         String(o.status ?? ''),
    createdAt:      String(o.created_at ?? o.createdAt ?? ''),
    updatedAt:      String(o.updated_at ?? o.updatedAt ?? ''),
  };
}

export async function fetchAdminAiModelConfigs(token: string): Promise<AdminAiModelConfigItem[]> {
  const envelope = await adminApiClient.get(
    '/admin/ai/model-configs',
    (v) => decodeArray(v, decodeModelConfig),
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}

/* ---- Safety: rejected events ---- */

export type AdminAiSafetyEventItem = {
  readonly id: string;
  readonly targetType: string;
  readonly targetId: string;
  readonly category: string;
  readonly severity: string;
  readonly action: string;
  readonly createdAt: string;
};

function decodeSafetyEvent(v: unknown): AdminAiSafetyEventItem {
  const o = v as Record<string, unknown>;
  return {
    id:         String(o.id ?? ''),
    targetType: String(o.target_type ?? o.targetType ?? ''),
    targetId:   String(o.target_id ?? o.targetId ?? ''),
    category:   String(o.category ?? ''),
    severity:   String(o.severity ?? ''),
    action:     String(o.action ?? ''),
    createdAt:  String(o.created_at ?? o.createdAt ?? ''),
  };
}

export async function fetchAdminAiSafetyEvents(token: string, limit = 100): Promise<AdminAiSafetyEventItem[]> {
  const envelope = await adminApiClient.get(
    '/admin/ai/safety/events',
    (v) => decodeArray(v, decodeSafetyEvent),
    { headers: { authorization: `Bearer ${token}` }, query: { limit } },
  );
  return envelope.data;
}

/* ---- Usage & Cost ---- */

export type AdminAiUsageCostItem = {
  readonly id: string;
  readonly studentId: string;
  readonly eventType: string;
  readonly tokensUsed: number | null;
  readonly costEstimate: string;
  readonly quotaPeriod: string;
  readonly createdAt: string;
};

function decodeUsageCost(v: unknown): AdminAiUsageCostItem {
  const o = v as Record<string, unknown>;
  return {
    id:           String(o.id ?? ''),
    studentId:    String(o.student_id ?? o.studentId ?? ''),
    eventType:    String(o.event_type ?? o.eventType ?? ''),
    tokensUsed:   typeof o.tokens_used === 'number' ? o.tokens_used : typeof o.tokensUsed === 'number' ? o.tokensUsed : null,
    costEstimate: String(o.cost_estimate ?? o.costEstimate ?? ''),
    quotaPeriod:  String(o.quota_period ?? o.quotaPeriod ?? ''),
    createdAt:    String(o.created_at ?? o.createdAt ?? ''),
  };
}

export async function fetchAdminAiUsageCost(token: string, limit = 100): Promise<AdminAiUsageCostItem[]> {
  const envelope = await adminApiClient.get(
    '/admin/ai/usage',
    (v) => decodeArray(v, decodeUsageCost),
    { headers: { authorization: `Bearer ${token}` }, query: { limit } },
  );
  return envelope.data;
}

/* ---- Audit Logs ---- */

export type AdminAiAuditLogItem = {
  readonly id: string;
  readonly actorId: string | null;
  readonly action: string;
  readonly resourceType: string;
  readonly resourceId: string | null;
  readonly createdAt: string;
};

function decodeAuditLog(v: unknown): AdminAiAuditLogItem {
  const o = v as Record<string, unknown>;
  return {
    id:           String(o.id ?? ''),
    actorId:      typeof (o.actor_id ?? o.actorId) === 'string' ? String(o.actor_id ?? o.actorId) : null,
    action:       String(o.action ?? ''),
    resourceType: String(o.resource_type ?? o.resourceType ?? ''),
    resourceId:   typeof (o.resource_id ?? o.resourceId) === 'string' ? String(o.resource_id ?? o.resourceId) : null,
    createdAt:    String(o.created_at ?? o.createdAt ?? ''),
  };
}

export async function fetchAdminAiAuditLogs(token: string, limit = 100): Promise<AdminAiAuditLogItem[]> {
  const envelope = await adminApiClient.get(
    '/admin/ai/audit/logs',
    (v) => decodeArray(v, decodeAuditLog),
    { headers: { authorization: `Bearer ${token}` }, query: { limit } },
  );
  return envelope.data;
}

export type AdminAiPromptPart = {
  readonly key: 'identity' | 'greeting' | 'teaching' | 'complete' | 'practice';
  readonly default: string;
  readonly override: string | null;
  readonly effective: string;
};
export type AdminAiCustomRule = {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly enabled: boolean;
  readonly sortOrder: number;
  readonly courseTitles: string[] | null;
  readonly updatedAt: string;
};
export type AdminAiSystemPrompt = {
  readonly parts: readonly AdminAiPromptPart[];
  readonly rules: readonly AdminAiCustomRule[];
  readonly practiceGreeting: string;
  readonly greetingInstruction: string;
  readonly lessonCompleteMarker: string;
  readonly contextSections: readonly string[];
  readonly safetyRules: readonly string[];
};

function decodeSystemPrompt(v: unknown): AdminAiSystemPrompt {
  const o = (v ?? {}) as Record<string, any>;
  const s = (x: unknown) => (typeof x === 'string' ? x : '');
  const list = (x: unknown) => (Array.isArray(x) ? x.map(String) : []);
  return {
    parts: (Array.isArray(o.parts) ? o.parts : []).map((p: any) => ({
      key: p.key,
      default: s(p.default),
      override: typeof p.override === 'string' ? p.override : null,
      effective: s(p.effective),
    })),
    rules: (Array.isArray(o.rules) ? o.rules : []).map((r: any) => ({
      id: s(r.id), title: s(r.title), body: s(r.body), enabled: r.enabled !== false,
      sortOrder: typeof r.sortOrder === 'number' ? r.sortOrder : 0,
      courseTitles: Array.isArray(r.courseTitles) ? r.courseTitles.map(String) : null, updatedAt: s(r.updatedAt),
    })),
    practiceGreeting: s(o.practiceGreeting),
    greetingInstruction: s(o.greetingInstruction),
    lessonCompleteMarker: s(o.lessonCompleteMarker),
    contextSections: list(o.contextSections),
    safetyRules: list(o.safetyRules),
  };
}

export async function fetchAdminAiSystemPrompt(token: string): Promise<AdminAiSystemPrompt> {
  const envelope = await adminApiClient.get('/admin/ai/system-prompt', decodeSystemPrompt, {
    headers: { authorization: `Bearer ${token}` },
  });
  return envelope.data;
}

const auth = (token: string) => ({ authorization: `Bearer ${token}` });

export async function saveAdminAiPromptPart(token: string, key: string, body: string): Promise<void> {
  await adminApiClient.put(`/admin/ai/system-prompt/parts/${encodeURIComponent(key)}`, decodeSystemPrompt, { headers: auth(token), body: { body } });
}
export async function resetAdminAiPromptPart(token: string, key: string): Promise<void> {
  await adminApiClient.delete(`/admin/ai/system-prompt/parts/${encodeURIComponent(key)}`, decodeSystemPrompt, { headers: auth(token) });
}
export async function addAdminAiRule(token: string, rule: { title: string; body: string; courseTitles?: string[] | null }): Promise<void> {
  await adminApiClient.post('/admin/ai/system-prompt/rules', decodeSystemPrompt, { headers: auth(token), body: rule });
}
export async function updateAdminAiRule(token: string, id: string, patch: { title?: string; body?: string; enabled?: boolean; courseTitles?: string[] | null }): Promise<void> {
  await adminApiClient.patch(`/admin/ai/system-prompt/rules/${encodeURIComponent(id)}`, decodeSystemPrompt, { headers: auth(token), body: patch });
}
export async function deleteAdminAiRule(token: string, id: string): Promise<void> {
  await adminApiClient.delete(`/admin/ai/system-prompt/rules/${encodeURIComponent(id)}`, decodeSystemPrompt, { headers: auth(token) });
}
