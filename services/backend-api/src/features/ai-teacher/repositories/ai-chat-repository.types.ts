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

  /**
   * Backend-enforced lesson-delivery stage: greeting -> teaching ->
   * complete. See LessonTeachingStageService for the state machine that
   * owns transitions — this repository only persists/reads the value.
   */
  readonly lesson_teaching_stage: 'greeting' | 'teaching' | 'complete';

  /**
   * The lesson this session teaches, resolved once at session start from
   * context_ref (CurrentLessonContextAdapter's own resolution logic) and
   * persisted so later turns and the completion trigger never re-resolve
   * context_ref's loose format. Null for a session with no resolvable
   * lesson (e.g. general chat with no active recommendation either).
   */
  readonly resolved_lesson_id: string | null;
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

  // P21-006: unified text+voice conversation turn columns.
  readonly channel: 'text' | 'voice';
  readonly audio_ref: string | null;
  readonly audio_duration_ms: number | null;
  readonly is_greeting: boolean;
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
