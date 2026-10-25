import { apiClient } from '../../api/client';

// Contracts mirror services/backend-api/src/features/voice-teacher/** (only the
// controllers actually registered in VoiceTeacherModule) and the Flutter models
// in apps/mobile/lib/features/voice_teacher/data/models.

/** POST /voice-teacher/sessions (session-start-api controller; body: { contextRef }). */
export interface StartVoiceSessionResult {
  sessionId: string;
  studentId: string;
  contextRef: string;
  status: 'active' | 'closed';
  createdAt: string;
  focusRecap: string | null;
  lastSessionRecap: string | null;
}

/** GET /voice-teacher/sessions/:sessionId/messages */
export interface VoiceMessage {
  id: string;
  role: 'student' | 'teacher';
  text: string;
  audioRef: string | null;
  createdAt: string;
  channel: 'text' | 'voice';
  audioDurationMs: number | null;
  isGreeting: boolean;
}

export interface VoiceSessionHistoryResult {
  sessionId: string;
  messages: VoiceMessage[];
}

/** POST /voice-teacher/sessions/:sessionId/audio (multipart field `audio`). */
export interface VoiceAudioSubmitResult {
  text: string;
  audioRef: string | null;
  isFallback: boolean;
  latencyMs: number;
}

/** Backend ALLOWED_AUDIO_TYPES (voice-audio-submit.controller.ts). Exact match on the part's Content-Type. */
export const ALLOWED_AUDIO_MIME_TYPES = ['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/wav', 'audio/mp4'];
/** Backend multer limit. */
export const MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024;
/** Backend audio duration policy (audio-upload.constants.ts). */
export const MAX_RECORDING_MS = 120_000;
export const MIN_RECORDING_MS = 300;

const EXTENSIONS: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/mp4': 'm4a',
};

export const voiceTeacherApi = {
  startSession: (contextRef: string) =>
    apiClient.post<StartVoiceSessionResult>('/voice-teacher/sessions', { contextRef }),

  getHistory: (sessionId: string) =>
    apiClient.get<VoiceSessionHistoryResult>(`/voice-teacher/sessions/${encodeURIComponent(sessionId)}/messages`),

  submitAudio: (sessionId: string, audio: Blob, mimeType: string) => {
    const form = new FormData();
    // Content-Type of the part must be the bare mime type (no `;codecs=`), or
    // the backend answers with its "unsupported type" fallback.
    const typed = audio.type === mimeType ? audio : new Blob([audio], { type: mimeType });
    form.append('audio', typed, `recording.${EXTENSIONS[mimeType] ?? 'webm'}`);
    return apiClient.postForm<VoiceAudioSubmitResult>(
      `/voice-teacher/sessions/${encodeURIComponent(sessionId)}/audio`,
      form,
    );
  },

  /** Stored audio (TTS reply or recorded turn) by reference. */
  getAudio: (audioRef: string) => apiClient.getBlob(`/voice-teacher/audio/${encodeURIComponent(audioRef)}`),

  /** Lazily synthesizes (or reuses) a message's TTS audio — for replies without an audioRef. */
  getMessageAudio: (messageId: string) =>
    apiClient.getBlob(`/voice-teacher/messages/${encodeURIComponent(messageId)}/audio`),
};
