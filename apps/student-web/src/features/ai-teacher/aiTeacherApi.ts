import { apiClient } from '../../api/client';
import { config } from '../../config';
import type { ApiError } from '../../types';

// Contracts mirror services/backend-api/src/features/ai-teacher/** and the
// Flutter models in apps/mobile/lib/features/ai_teacher/data/models.

export type ChatSessionStatus = 'active' | 'closed';

/** POST /ai-teacher/sessions (body: { contextRef }) — get-or-create per (student, contextRef). */
export interface StartChatSessionResult {
  sessionId: string;
  studentId: string;
  contextRef: string;
  status: ChatSessionStatus;
  createdAt: string;
  focusRecap: string | null;
  lastSessionRecap: string | null;
}

/** GET /ai-teacher/sessions — the student's active sessions (text and voice share this table). */
export interface ChatSessionListItem {
  sessionId: string;
  contextRef: string;
  contextTitle: string | null;
  status: ChatSessionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ListChatSessionsResult {
  sessions: ChatSessionListItem[];
}

/** GET /ai-teacher/sessions/:id/messages */
export interface ChatHistoryMessage {
  id: string;
  role: 'student' | 'ai_teacher';
  text: string;
  createdAt: string;
  channel: 'text' | 'voice';
  audioRef: string | null;
  audioDurationMs: number | null;
  isGreeting: boolean;
}

export interface GetChatHistoryResult {
  sessionId: string;
  messages: ChatHistoryMessage[];
  focusRecap: string | null;
}

/** POST /ai-teacher/sessions/:id/messages (body: { message }) */
export interface SubmitStudentMessageResult {
  text: string;
  isFallback: boolean;
  provider: string;
  model: string;
  latencyMs: number;
}

export type FeedbackRating = 'helpful' | 'not_helpful';

/** POST /ai-teacher/messages/:messageId/feedback (body: { rating }) */
export interface SubmitFeedbackResult {
  feedbackId: string;
  messageId: string;
  rating: FeedbackRating;
  createdAt: string;
}

/** GET /ai-teacher/sessions/:id/safety-status */
export interface SafetyStatusResult {
  sessionId: string;
  status: 'ok' | 'limited';
  lastCheckedAt: string | null;
}

/** Context used when a session is opened without a specific lesson (same as Flutter). */
export const GENERAL_CONTEXT_REF = 'general';

/** Lesson-scoped contextRef understood by the backend's current-lesson context adapter. */
export function lessonContextRef(lessonId: string): string {
  return `lesson:${lessonId}`;
}

/** Readable label for a raw contextRef (same rule as Flutter's _prettifyContextRef). */
export function prettifyContextRef(contextRef: string): string {
  const lastSegment = contextRef.split(':').pop() ?? contextRef;
  const label = lastSegment
    .split(/[_-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  return label || contextRef;
}

export function sessionLabel(session: Pick<ChatSessionListItem, 'contextRef' | 'contextTitle'>): string {
  if (session.contextTitle) return session.contextTitle;
  if (session.contextRef === GENERAL_CONTEXT_REF) return 'General conversation';
  return prettifyContextRef(session.contextRef);
}

export function relativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export const aiTeacherApi = {
  startSession: (contextRef: string) =>
    apiClient.post<StartChatSessionResult>('/ai-teacher/sessions', { contextRef }),
  listSessions: () => apiClient.get<ListChatSessionsResult>('/ai-teacher/sessions'),
  getHistory: (sessionId: string) =>
    apiClient.get<GetChatHistoryResult>(`/ai-teacher/sessions/${encodeURIComponent(sessionId)}/messages`),
  sendMessage: (sessionId: string, message: string) =>
    apiClient.post<SubmitStudentMessageResult>(
      `/ai-teacher/sessions/${encodeURIComponent(sessionId)}/messages`,
      { message },
    ),
  submitFeedback: (messageId: string, rating: FeedbackRating) =>
    apiClient.post<SubmitFeedbackResult>(`/ai-teacher/messages/${encodeURIComponent(messageId)}/feedback`, {
      rating,
    }),
  getSafetyStatus: (sessionId: string) =>
    apiClient.get<SafetyStatusResult>(`/ai-teacher/sessions/${encodeURIComponent(sessionId)}/safety-status`),
};

// ---------------------------------------------------------------------------
// Streaming: POST /ai-teacher/sessions/:id/messages/stream (SSE over POST)
// ---------------------------------------------------------------------------

export interface StreamDoneEvent {
  type: 'done';
  isFallback: boolean;
  provider: string;
  model: string;
}

/** Thrown when the stream request is rejected with 401 before anything was processed. */
export class StreamUnauthorizedError extends Error {
  constructor() {
    super('Stream request unauthorized');
    this.name = 'StreamUnauthorizedError';
  }
}

const ACCESS_TOKEN_KEY = 'aim_access_token';

function readAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

function streamError(message: string, statusCode = 0, code = 'STREAM_FAILED'): ApiError {
  return { code, statusCode, message };
}

/**
 * Unwraps one SSE `data:` payload. The backend's global ApiResponseInterceptor
 * may wrap each emitted MessageEvent, so the event can arrive either bare
 * (`{type,...}`) or nested under one or more `data` keys.
 */
function unwrapEvent(payload: unknown): { type?: unknown; [k: string]: unknown } | null {
  let current = payload;
  for (let i = 0; i < 4; i += 1) {
    if (!current || typeof current !== 'object') return null;
    const obj = current as Record<string, unknown>;
    if (typeof obj.type === 'string') return obj;
    if (obj.success === false) {
      const err = obj.error as Partial<ApiError> | undefined;
      throw streamError(err?.message || 'AI Teacher could not reply right now.', err?.statusCode ?? 0, err?.code);
    }
    current = obj.data;
  }
  return null;
}

/**
 * Streams the AI Teacher reply. Calls onChunk for every safety-filtered chunk
 * and resolves with the terminal `done` event. Throws StreamUnauthorizedError
 * on a 401 (caller should fall back to the non-streaming endpoint, which goes
 * through apiClient's token refresh), or an ApiError otherwise.
 */
export async function streamMessage(
  sessionId: string,
  message: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<StreamDoneEvent | null> {
  const token = readAccessToken();
  if (!token) throw new StreamUnauthorizedError();

  const baseUrl = config.apiBaseUrl.replace(/\/+$/, '');
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/ai-teacher/sessions/${encodeURIComponent(sessionId)}/messages/stream`, {
      method: 'POST',
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
      signal,
    });
  } catch (err) {
    if ((err as { name?: string } | null)?.name === 'AbortError') throw err;
    throw streamError("Can't reach the server. Check your connection and try again.", 0, 'NETWORK_ERROR');
  }

  if (response.status === 401) throw new StreamUnauthorizedError();

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const err = (body as { error?: Partial<ApiError> } | null)?.error;
    throw streamError(
      err?.message || 'AI Teacher could not reply right now.',
      err?.statusCode ?? response.status,
      err?.code ?? `HTTP_${response.status}`,
    );
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    // Not a stream (e.g. an error envelope returned with a 2xx).
    const body = await response.json().catch(() => null);
    unwrapEvent(body);
    throw streamError('AI Teacher could not reply right now.');
  }

  if (!response.body) throw streamError('Streaming is not supported in this browser.', 0, 'STREAM_UNSUPPORTED');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let done: StreamDoneEvent | null = null;

  const handleEvent = (raw: string) => {
    let eventName = 'message';
    const dataLines: string[] = [];
    raw.split(/\r?\n/).forEach((line) => {
      if (line.startsWith('event:')) eventName = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, ''));
    });
    const data = dataLines.join('\n').trim();
    if (eventName === 'error') {
      throw streamError(data || 'AI Teacher could not reply right now.', 0, 'STREAM_ERROR');
    }
    if (!data) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch {
      return; // never display malformed payloads as chat content
    }
    const event = unwrapEvent(parsed);
    if (!event) return;
    if (event.type === 'chunk' && typeof event.text === 'string') {
      onChunk(event.text);
    } else if (event.type === 'done') {
      done = {
        type: 'done',
        isFallback: event.isFallback === true,
        provider: String(event.provider ?? ''),
        model: String(event.model ?? ''),
      };
    }
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done: finished } = await reader.read();
    if (value) buffer += decoder.decode(value, { stream: true });
    if (finished) buffer += decoder.decode();
    const parts = buffer.split(/\r?\n\r?\n/);
    buffer = finished ? '' : parts.pop() ?? '';
    parts.forEach((part) => {
      if (part.trim()) handleEvent(part);
    });
    if (finished) break;
  }

  return done;
}
