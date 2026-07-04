/**
 * P8-062: Build AI Teacher Orchestrator (Group G — AI Teacher Backend
 * Pipeline). Input/output contract for a single AI Teacher chat turn.
 * `ChatTurnInput.contextRef` and `studentId`/`sessionId` are backend-
 * resolved by the caller, never accepted as a trusted learning-decision
 * value from the client. `ChatTurnResult` carries only the AI Teacher's
 * reply text and provider operational metadata — never a mastery/level/
 * weakness/difficulty/recommendation/review-schedule value
 * (docs/phase-8/no-aim-replacement-rule.md).
 */
import { AiTeacherContextSnapshot } from '../context-builder/context-builder.types';

export interface ChatTurnInput {
  readonly studentId: string;
  readonly sessionId: string;
  readonly contextRef: string;
  readonly studentMessage: string;

  /**
   * P21-010: origin channel for the two ai_chat_messages rows this turn
   * persists (student + ai_teacher). Defaults to 'text' when omitted, so
   * every existing text-chat caller is unaffected. The Voice Teacher path
   * passes 'voice' so a spoken turn is recorded as such.
   */
  readonly channel?: 'text' | 'voice';

  /**
   * P21-021b: id of an already-persisted, empty ai_chat_messages student
   * row to fill in with `studentMessage` instead of inserting a new row.
   * Only ever set by the Voice Teacher path: AudioUploadService creates
   * this placeholder row up front (as the voice_audio_assets FK anchor,
   * before STT has run), so by the time handleTurn() is called the real
   * transcript needs to land on that same row rather than a second one —
   * otherwise a voice turn would show two student bubbles (one empty, one
   * with the real transcript) in chat history. Omitted (undefined) for
   * every text-chat caller, which keeps today's insert-a-new-row behavior.
   */
  readonly existingStudentMessageId?: string;
}

export interface ChatTurnResult {
  readonly text: string;
  readonly isFallback: boolean;
  readonly provider: string;
  readonly model: string;
  readonly latencyMs: number;

  /**
   * P21-010: id of the persisted ai_teacher reply row (ai_chat_messages).
   * Lets a voice-turn caller attach TTS audio_ref/audio_duration_ms onto
   * this exact row after synthesis completes.
   */
  readonly messageId: string;
}

/**
 * P21-008: Input for generating a session's opening greeting — same
 * identity fields as ChatTurnInput, but with no studentMessage since the
 * student has not said anything yet.
 */
export interface GenerateGreetingInput {
  readonly studentId: string;
  readonly sessionId: string;
  readonly contextRef: string;
}

/**
 * P21-008: Same operational shape as ChatTurnResult minus messageId (no
 * ai_chat_messages row exists yet — the caller persists the greeting text
 * itself and gets its own row id from that), plus the assembled context
 * snapshot so the caller can persist it against the greeting message it
 * saves (mirroring how a normal turn's snapshot is persisted).
 */
export interface GenerateGreetingResult {
  readonly text: string;
  readonly isFallback: boolean;
  readonly provider: string;
  readonly model: string;
  readonly latencyMs: number;
  readonly context: AiTeacherContextSnapshot;
}
