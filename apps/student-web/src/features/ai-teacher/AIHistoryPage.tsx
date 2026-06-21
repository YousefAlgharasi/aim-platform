import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import type { ApiError } from '../../types';
import styles from './AITeacher.module.css';

interface ConversationSummary {
  id: string;
  topic: string;
  messageCount: number;
  lastMessage: string;
  updatedAt: string;
  rating: 'positive' | 'negative' | null;
}

export function AIHistoryPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchHistory() {
    setLoading(true);
    setError('');
    apiClient.get<{ conversations: ConversationSummary[] }>('/api/ai-teacher/conversations')
      .then(({ conversations: c }) => setConversations(c))
      .catch((err: ApiError) => setError(err.message || 'Failed to load history'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchHistory(); }, []);

  function submitFeedback(conversationId: string, rating: 'positive' | 'negative') {
    apiClient.post(`/api/ai-teacher/conversations/${conversationId}/feedback`, { rating })
      .then(() => {
        setConversations(prev => prev.map(c =>
          c.id === conversationId ? { ...c, rating } : c
        ));
      })
      .catch(() => {});
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchHistory} />;
  if (conversations.length === 0) {
    return <EmptyState title="No conversations yet" message="Start a conversation with your AI Teacher to see history here." />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Conversation History</h1>

      <div className={styles.historyList}>
        {conversations.map(conv => (
          <Card key={conv.id}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
              <a
                href={`/ai-teacher/${conv.id}`}
                className={styles.historyItem}
                onClick={e => { e.preventDefault(); navigate(`/ai-teacher/${conv.id}`); }}
              >
                <span className={styles.historyTopic}>{conv.topic}</span>
                <span className={styles.historyMeta}>
                  {conv.messageCount} messages · {new Date(conv.updatedAt).toLocaleDateString()}
                </span>
              </a>

              <div className={styles.feedbackSection}>
                <span style={{ fontSize: '12px', color: 'var(--color-neutral-500)' }}>Was this helpful?</span>
                <div className={styles.feedbackButtons}>
                  <button
                    className={`${styles.feedbackBtn} ${conv.rating === 'positive' ? styles.feedbackBtnActive : ''}`}
                    onClick={() => submitFeedback(conv.id, 'positive')}
                    aria-label="Helpful"
                  >
                    👍
                  </button>
                  <button
                    className={`${styles.feedbackBtn} ${conv.rating === 'negative' ? styles.feedbackBtnActive : ''}`}
                    onClick={() => submitFeedback(conv.id, 'negative')}
                    aria-label="Not helpful"
                  >
                    👎
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
