import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './AITeacher.module.css';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  topic: string;
  messages: Message[];
}

export function AIChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function fetchConversation() {
    setLoading(true);
    setError('');
    apiClient.get<Conversation>(`/ai-teacher/conversations/${conversationId}`)
      .then(setConversation)
      .catch((err: ApiError) => setError(err.message || 'Failed to load conversation'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchConversation(); }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages.length]);

  function handleSend() {
    if (!input.trim() || sending) return;
    const userMessage = input.trim();
    setInput('');
    setSending(true);

    if (conversation) {
      setConversation({
        ...conversation,
        messages: [...conversation.messages, {
          id: `temp-${Date.now()}`,
          role: 'user',
          content: userMessage,
          timestamp: new Date().toISOString(),
        }],
      });
    }

    apiClient.post<{ message: Message }>(`/ai-teacher/conversations/${conversationId}/messages`, {
      content: userMessage,
    })
      .then(({ message }) => {
        setConversation(prev => prev ? {
          ...prev,
          messages: [...prev.messages.filter(m => !m.id.startsWith('temp-')),
            { id: `user-${Date.now()}`, role: 'user', content: userMessage, timestamp: new Date().toISOString() },
            message,
          ],
        } : null);
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
  if (error && !conversation) return <ErrorState message={error} onRetry={fetchConversation} />;
  if (!conversation) return null;

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <Link to="/ai-teacher" className={styles.historyItem} style={{ textDecoration: 'none' }}>
          ←
        </Link>
        <h1 className={styles.chatTitle}>{conversation.topic}</h1>
      </div>

      <div className={styles.messageList} role="log" aria-label="Chat messages">
        {conversation.messages.map(msg => (
          <div
            key={msg.id}
            className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageAI}`}
          >
            {msg.content}
            <div className={styles.messageTime}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
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
