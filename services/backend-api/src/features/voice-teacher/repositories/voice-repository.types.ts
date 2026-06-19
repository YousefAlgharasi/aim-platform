/**
 * P9-027: Add Voice Backend Repositories.
 * Row shapes for the seven voice persistence tables
 * (voice_sessions, voice_messages, voice_audio_assets,
 * voice_transcripts, voice_provider_logs, voice_safety_events,
 * voice_feedback). These mirror the migration columns from
 * P9-018..P9-024 exactly. No mastery, level, weakness, difficulty,
 * recommendation, or review-schedule fields exist here — that
 * remains AIM Engine authority.
 */

export interface VoiceSessionRow {
  readonly id: string;
  readonly student_id: string;
  readonly context_ref: string;
  readonly status: 'active' | 'ended';
  readonly created_at: string;
  readonly updated_at: string;
}

export interface VoiceMessageRow {
  readonly id: string;
  readonly session_id: string;
  readonly student_id: string;
  readonly transcript: string | null;
  readonly reply: string | null;
  readonly audio_ref: string | null;
  readonly status: 'pending' | 'transcribed' | 'replied' | 'synthesized' | 'failed';
  readonly created_at: string;
}

export interface VoiceAudioAssetRow {
  readonly id: string;
  readonly message_id: string;
  readonly student_id: string;
  readonly storage_key: string;
  readonly content_type: string;
  readonly duration_ms: number | null;
  readonly created_at: string;
}

export interface VoiceTranscriptRow {
  readonly id: string;
  readonly message_id: string;
  readonly session_id: string;
  readonly transcript_text: string;
  readonly language_code: string | null;
  readonly confidence: number | null;
  readonly segments: unknown | null;
  readonly provider_ref: string | null;
  readonly created_at: string;
}

export interface VoiceProviderLogRow {
  readonly id: string;
  readonly message_id: string;
  readonly provider_type: 'stt' | 'tts';
  readonly provider: string;
  readonly model: string;
  readonly status: 'success' | 'error' | 'timeout';
  readonly error_category: string | null;
  readonly latency_ms: number | null;
  readonly created_at: string;
}

export interface VoiceSafetyEventRow {
  readonly id: string;
  readonly session_id: string;
  readonly message_id: string | null;
  readonly direction: 'input' | 'output';
  readonly decision: 'allowed' | 'rejected';
  readonly reason_category: string | null;
  readonly created_at: string;
}

export interface VoiceFeedbackRow {
  readonly id: string;
  readonly message_id: string;
  readonly session_id: string;
  readonly student_id: string;
  readonly rating: 'helpful' | 'not_helpful';
  readonly created_at: string;
}
