import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './AITeacher.module.css';

interface ChatHistoryMessage {
  id: string;
  role: 'student' | 'ai_teacher';
  text: string;
  createdAt: string;
}

interface GetChatHistoryResult {
  sessionId: string;
  messages: ChatHistoryMessage[];
}

interface SubmitStudentMessageResult {
  text: string;
  isFallback: boolean;
  provider: string;
  model: string;
  latencyMs: number;
}

export function AIChatPage() {
  const { conversationId: sessionId } = useParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<ChatHistoryMessage[] | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'helpful' | 'not_helpful'>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function submitFeedback(messageId: string, rating: 'helpful' | 'not_helpful') {
    apiClient.post(`/ai-teacher/messages/${messageId}/feedback`, { rating })
      .then(() => setFeedbackGiven(prev => ({ ...prev, [messageId]: rating })))
      .catch(() => {});
  }

  function fetchHistory() {
    setLoading(true);
    setError('');
    apiClient.get<GetChatHistoryResult>(`/ai-teacher/sessions/${sessionId}/messages`)
      .then((res) => setMessages(res.messages))
      .catch((err: ApiError) => setError(err.message || 'Failed to load session'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchHistory(); }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages?.length]);

  function handleSend() {
    if (!input.trim() || sending || !messages) return;
    const studentMessage = input.trim();
    setInput('');
    setSending(true);

    const tempMessage: ChatHistoryMessage = {
      id: `temp-${Date.now()}`,
      role: 'student',
      text: studentMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages([...messages, tempMessage]);

    apiClient.post<SubmitStudentMessageResult>(`/ai-teacher/sessions/${sessionId}/messages`, {
      message: studentMessage,
    })
      .then(() => {
        return apiClient.get<GetChatHistoryResult>(`/ai-teacher/sessions/${sessionId}/messages`)
          .then((res) => setMessages(res.messages));
      })
      .catch((err: ApiError) => setError(err.message || 'Failed to send message'))
      .finally(() => setSending(false));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error && !messages) return <ErrorState message={error} onRetry={fetchHistory} />;
  if (!messages) return null;

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <Link to="/ai-teacher" className={styles.historyItem} style={{ textDecoration: 'none' }}>
          ←
        </Link>
        <h1 className={styles.chatTitle}>AI Teacher</h1>
      </div>

      <div className={styles.messageList} role="log" aria-label="Chat messages">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`${styles.message} ${msg.role === 'student' ? styles.messageUser : styles.messageAI}`}
          >
            {msg.text}
            <div className={styles.messageTime}>
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            {msg.role === 'ai_teacher' && !msg.id.startsWith('temp-') && (
              <div className={styles.feedbackButtons}>
                <button
                  type="button"
                  className={`${styles.feedbackBtn} ${feedbackGiven[msg.id] === 'helpful' ? styles.feedbackBtnActive : ''}`}
                  onClick={() => submitFeedback(msg.id, 'helpful')}
                  disabled={!!feedbackGiven[msg.id]}
                  aria-label="Helpful"
                >
                  👍
                </button>
                <button
                  type="button"
                  className={`${styles.feedbackBtn} ${feedbackGiven[msg.id] === 'not_helpful' ? styles.feedbackBtnActive : ''}`}
                  onClick={() => submitFeedback(msg.id, 'not_helpful')}
                  disabled={!!feedbackGiven[msg.id]}
                  aria-label="Not helpful"
                >
                  👎
                </button>
              </div>
            )}
          </div>
        ))}
        {sending && (
          <div className={styles.typingIndicator}>AI Teacher is thinking…</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div style={{ padding: '0 var(--space-16)', color: 'var(--color-danger-500)', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div className={styles.inputArea}>
        <textarea
          className={styles.chatInput}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question…"
          rows={1}
          disabled={sending}
          aria-label="Message input"
        />
        <Button variant="primary" onClick={handleSend} disabled={sending || !input.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
