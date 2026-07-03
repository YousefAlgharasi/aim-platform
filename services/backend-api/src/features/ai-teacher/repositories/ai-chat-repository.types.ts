// P8-026: Add Backend AI Chat Repositories
// Row shapes for the six AI Teacher chat persistence tables
// (ai_chat_sessions, ai_chat_messages, ai_context_snapshots,
// ai_provider_logs, ai_safety_events, ai_teacher_feedback).
//
// These mirror the migration columns from P8-018..P8-023 exactly.
// No mastery, level, weakness, difficulty, recommendation, or
// review-schedule fields exist here — that remains AIM Engine authority.

export interface AiChatSessionRow {
  readonly id: string;
  readonly student_id: string;
  readonly context_ref: string;
  readonly status: 'active' | 'closed';
  readonly created_at: string;
  readonly updated_at: string;
}

export interface AiChatSessionWithContextTitleRow extends AiChatSessionRow {
  readonly context_title: string | null;
}

export interface AiChatMessageRow {
  readonly id: string;
  readonly session_id: string;
  readonly student_id: string;
  readonly role: 'student' | 'ai_teacher';
  readonly text: string;
  readonly created_at: string;
}

export interface AiContextSnapshotRow {
  readonly id: string;
  readonly session_id: string;
  readonly message_id: string;
  readonly student_id: string;
  readonly context_data: unknown;
  readonly created_at: string;
}

export interface AiProviderLogRow {
  readonly id: string;
  readonly session_id: string;
  readonly provider: string;
  readonly model: string;
  readonly status: 'success' | 'error' | 'timeout';
  readonly error_category: string | null;
  readonly latency_ms: number | null;
  readonly created_at: string;
}

export interface AiSafetyEventRow {
  readonly id: string;
  readonly session_id: string;
  readonly direction: 'input' | 'output';
  readonly decision: 'allowed' | 'rejected';
  readonly reason_category: string | null;
  readonly created_at: string;
}

export interface AiTeacherFeedbackRow {
  readonly id: string;
  readonly message_id: string;
  readonly student_id: string;
  readonly rating: 'helpful' | 'not_helpful';
  readonly created_at: string;
}
