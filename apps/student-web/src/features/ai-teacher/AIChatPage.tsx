import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import {
  aiTeacherApi,
  streamMessage,
  StreamUnauthorizedError,
  type ChatHistoryMessage,
  type FeedbackRating,
} from './aiTeacherApi';
import type { AIChatLocationState } from './AITeacherEntryPage';
import styles from './AITeacher.module.css';

// Same quick-action prompts as Flutter's AiSuggestedPromptsRow.
const SUGGESTED_PROMPTS = [
  'Explain grammar',
  'Quick quiz',
  'Check my writing',
  'Give an example',
  'Practice speaking',
];

type FeedbackEntry = { rating: FeedbackRating | null; status: 'submitting' | 'done' };

function formatTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function AIChatPage() {
  const { conversationId: sessionId = '' } = useParams<{ conversationId: string }>();
  const location = useLocation();
  const navState = (location.state ?? {}) as AIChatLocationState;

  const [messages, setMessages] = useState<ChatHistoryMessage[] | null>(null);
  const [focusRecap, setFocusRecap] = useState<string | null>(navState.focusRecap ?? null);
  const [safetyLimited, setSafetyLimited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [sendError, setSendError] = useState('');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, FeedbackEntry>>({});
  const [feedbackError, setFeedbackError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  /** Advisory only; failures never replace the conversation (Flutter loadSafetyStatus). */
  const loadSafetyStatus = useCallback(() => {
    aiTeacherApi
      .getSafetyStatus(sessionId)
      .then((res) => mountedRef.current && setSafetyLimited(res.status === 'limited'))
      .catch(() => {});
  }, [sessionId]);

  /** Best-effort refresh after a send; returns whether it succeeded. */
  const refreshHistory = useCallback(async (): Promise<boolean> => {
    try {
      const res = await aiTeacherApi.getHistory(sessionId);
      if (!mountedRef.current) return true;
      setMessages(res.messages ?? []);
      setFocusRecap(res.focusRecap ?? null);
      return true;
    } catch {
      return false;
    }
  }, [sessionId]);

  const fetchHistory = useCallback(() => {
    setLoading(true);
    setLoadError('');
    aiTeacherApi
      .getHistory(sessionId)
      .then((res) => {
        setMessages(res.messages ?? []);
        setFocusRecap(res.focusRecap ?? null);
        loadSafetyStatus();
      })
      .catch((err) => setLoadError(getErrorMessage(err, 'AI Teacher is temporarily unavailable. Your progress is safe, and you can try again.')))
      .finally(() => setLoading(false));
  }, [sessionId, loadSafetyStatus]);

  useEffect(() => {
    setMessages(null);
    setFeedback({});
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages?.length, streamingText, sending]);

  function submitFeedback(messageId: string, rating: FeedbackRating) {
    if (feedback[messageId]) return;
    setFeedbackError('');
    setFeedback((prev) => ({ ...prev, [messageId]: { rating, status: 'submitting' } }));
    aiTeacherApi
      .submitFeedback(messageId, rating)
      .then(() => setFeedback((prev) => ({ ...prev, [messageId]: { rating, status: 'done' } })))
      .catch((err) => {
        if ((err as { statusCode?: number })?.statusCode === 409) {
          // Already rated earlier (the history response doesn't carry ratings).
          setFeedback((prev) => ({ ...prev, [messageId]: { rating: null, status: 'done' } }));
          return;
        }
        setFeedback((prev) => {
          const next = { ...prev };
          delete next[messageId];
          return next;
        });
        setFeedbackError(getErrorMessage(err, 'Could not send feedback. Please try again.'));
      });
  }

  async function send(text: string) {
    const studentMessage = text.trim();
    if (!studentMessage || sending || !messages) return;

    setInput('');
    setSendError('');
    setSending(true);
    setStreamingText(null);

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...(prev ?? []),
      {
        id: tempId,
        role: 'student',
        text: studentMessage,
        createdAt: new Date().toISOString(),
        channel: 'text',
        audioRef: null,
        audioDurationMs: null,
        isGreeting: false,
      },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;
    let streamed = '';
    let replyText: string | null = null;

    try {
      try {
        await streamMessage(
          sessionId,
          studentMessage,
          (chunk) => {
            streamed += chunk;
            if (mountedRef.current) setStreamingText(streamed);
          },
          controller.signal,
        );
        replyText = streamed;
      } catch (err) {
        if (!(err instanceof StreamUnauthorizedError)) throw err;
        // 401 before processing: fall back to the non-streaming endpoint,
        // which goes through apiClient's token refresh.
        const reply = await aiTeacherApi.sendMessage(sessionId, studentMessage);
        replyText = reply.text;
      }
      if (!mountedRef.current) return;

      const refreshed = await refreshHistory();
      if (!mountedRef.current) return;
      if (!refreshed && replyText) {
        // Keep the reply on screen until the next successful refresh.
        setMessages((prev) => [
          ...(prev ?? []),
          {
            id: `temp-reply-${Date.now()}`,
            role: 'ai_teacher',
            text: replyText as string,
            createdAt: new Date().toISOString(),
            channel: 'text',
            audioRef: null,
            audioDurationMs: null,
            isGreeting: false,
          },
        ]);
      }
    } catch (err) {
      if ((err as { name?: string } | null)?.name === 'AbortError' || !mountedRef.current) return;
      setSendError(getErrorMessage(err, 'Failed to send your message. Please try again.'));
      // The student message may have been persisted before the failure.
      const refreshed = await refreshHistory();
      if (!refreshed && mountedRef.current) {
        setMessages((prev) => (prev ?? []).filter((m) => m.id !== tempId));
        setInput(studentMessage);
      }
    } finally {
      abortRef.current = null;
      if (mountedRef.current) {
        setStreamingText(null);
        setSending(false);
        loadSafetyStatus();
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  if (loading && !messages) return <LoadingSpinner />;
  if (loadError && !messages) return <ErrorState message={loadError} onRetry={fetchHistory} />;
  if (!messages) return null;

  const isEmpty = messages.length === 0 && !sending;

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <Link to="/ai-teacher" className={styles.iconLink} aria-label="Back to AI Teacher">
          <span className={styles.backArrow} aria-hidden="true">←</span>
        </Link>
        <div className={styles.chatTitleGroup}>
          <h1 className={styles.chatTitle}>AI Teacher</h1>
          <span className={styles.chatSubtitle}>{navState.lessonTitle || 'Always here to help'}</span>
        </div>
        <Link to={`/voice-teacher/${sessionId}`} className={styles.headerLink}>
          Voice
        </Link>
        <Link to="/ai-teacher/history" className={styles.headerLink}>
          History
        </Link>
      </div>

      <div className={styles.callouts}>
        {safetyLimited && (
          <Banner variant="warning">
            <strong>AI Teacher is limited right now.</strong> Some responses in this conversation were held
            back to keep things safe. You can keep chatting, or start a new conversation.
          </Banner>
        )}
        {focusRecap && <Banner variant="info">{focusRecap}</Banner>}
        {navState.lastSessionRecap && (
          <Banner variant="success">
            <strong>Welcome back.</strong> {navState.lastSessionRecap}
          </Banner>
        )}
      </div>

      <div className={styles.messageList} role="log" aria-live="polite" aria-label="Chat messages">
        {isEmpty && (
          <div className={styles.chatEmpty}>
            <span className={styles.entryIcon} aria-hidden="true">💬</span>
            <p className={styles.historyTopic}>Ask me anything</p>
            <p className={styles.description}>Start the conversation with a question or pick a suggestion below.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isStudent = msg.role === 'student';
          const entry = feedback[msg.id];
          const canRate = !isStudent && !msg.id.startsWith('temp-');
          return (
            <div
              key={msg.id}
              className={`${styles.message} ${isStudent ? styles.messageUser : styles.messageAI}`}
              aria-label={isStudent ? 'Your message' : 'AI Teacher'}
            >
              <div className={styles.messageText}>{msg.text}</div>
              <div className={styles.messageTime}>
                {msg.channel === 'voice' && <span className={styles.channelTag}>🎙 Voice · </span>}
                {formatTime(msg.createdAt)}
              </div>
              {canRate && (
                <div className={styles.feedbackRow}>
                  <span className={styles.feedbackLabel}>
                    {entry?.status === 'done' ? 'Thanks for your feedback' : 'Was this helpful?'}
                  </span>
                  <div className={styles.feedbackButtons}>
                    <button
                      type="button"
                      className={`${styles.feedbackBtn} ${entry?.rating === 'helpful' ? styles.feedbackBtnActive : ''}`}
                      onClick={() => submitFeedback(msg.id, 'helpful')}
                      disabled={!!entry}
                      aria-pressed={entry?.rating === 'helpful'}
                      aria-label="Mark AI Teacher reply as helpful"
                    >
                      👍
                    </button>
                    <button
                      type="button"
                      className={`${styles.feedbackBtn} ${entry?.rating === 'not_helpful' ? styles.feedbackBtnActive : ''}`}
                      onClick={() => submitFeedback(msg.id, 'not_helpful')}
                      disabled={!!entry}
                      aria-pressed={entry?.rating === 'not_helpful'}
                      aria-label="Mark AI Teacher reply as not helpful"
                    >
                      👎
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {sending && streamingText !== null && streamingText.length > 0 && (
          <div className={`${styles.message} ${styles.messageAI}`} aria-busy="true">
            <div className={styles.messageText}>{streamingText}</div>
          </div>
        )}
        {sending && !streamingText && (
          <div className={styles.typingIndicator}>AI Teacher is thinking…</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {(sendError || feedbackError) && (
        <div className={styles.inlineErrorBar} role="alert">
          {sendError || feedbackError}
        </div>
      )}

      {!sending && (
        <div className={styles.promptRow} aria-label="Suggested prompts">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button key={prompt} type="button" className={styles.topicChip} onClick={() => send(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className={styles.inputArea}>
        <textarea
          className={styles.chatInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question…"
          rows={1}
          disabled={sending}
          aria-label="Message input"
        />
        <Button variant="primary" onClick={() => send(input)} disabled={sending || !input.trim()}>
          {sending ? 'Sending…' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
