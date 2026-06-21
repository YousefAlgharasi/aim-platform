// P18-023/P18-025: AI Teacher governance entities/types
// Row shapes for the prompt template, model config, safety check, usage
// cost event, and audit log tables created in P18-014..P18-021. These never
// carry mastery, weakness, difficulty, recommendation, or review-schedule
// fields — that remains AIM Engine authority. provider_key_ref is a
// non-secret reference string only; no provider API keys/secrets appear
// here.

export interface AiPromptTemplateRow {
  readonly id: string;
  readonly name: string;
  readonly version: number;
  readonly locale: string;
  readonly audience: string;
  readonly status: 'draft' | 'active' | 'retired';
  readonly body: string;
  readonly safety_tags: unknown;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface AiModelConfigRow {
  readonly id: string;
  readonly name: string;
  readonly provider_key_ref: string;
  readonly model_id: string;
  readonly tier: 'economy' | 'standard' | 'premium';
  readonly status: 'draft' | 'active' | 'retired';
  readonly limits: unknown;
  readonly parameters: unknown;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface AiTeacherSafetyCheckRow {
  readonly id: string;
  readonly target_type: 'message' | 'voice_segment';
  readonly target_id: string;
  readonly category: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly action: 'allowed' | 'flagged' | 'blocked';
  readonly metadata: unknown;
  readonly created_at: string;
}

export interface AiUsageCostEventRow {
  readonly id: string;
  readonly student_id: string;
  readonly event_type: 'text_generation' | 'stt' | 'tts';
  readonly model_config_id: string | null;
  readonly request_id: string;
  readonly tokens_used: number | null;
  readonly duration_seconds: number | null;
  readonly cost_estimate: string;
  readonly quota_period: 'daily' | 'monthly';
  readonly metadata: unknown;
  readonly created_at: string;
}

export interface AiTeacherAuditLogRow {
  readonly id: string;
  readonly actor_id: string | null;
  readonly action: string;
  readonly resource_type: string;
  readonly resource_id: string | null;
  readonly details: unknown;
  readonly created_at: string;
}
