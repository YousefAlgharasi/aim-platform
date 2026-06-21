import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './AITeacher.module.css';

interface AITeacherConfig {
  suggestedTopics: string[];
  recentConversations: Array<{
    id: string;
    topic: string;
    lastMessage: string;
    updatedAt: string;
  }>;
}

export function AITeacherEntryPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<AITeacherConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  function fetchConfig() {
    setLoading(true);
    setError('');
    apiClient.get<AITeacherConfig>('/api/ai-teacher')
      .then(setConfig)
      .catch((err: ApiError) => setError(err.message || 'Failed to load AI Teacher'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchConfig(); }, []);

  function startConversation(topic?: string) {
    setStarting(true);
    apiClient.post<{ conversationId: string }>('/api/ai-teacher/conversations', { topic })
      .then(({ conversationId }) => navigate(`/ai-teacher/${conversationId}`))
      .catch((err: ApiError) => setError(err.message || 'Failed to start conversation'))
      .finally(() => setStarting(false));
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchConfig} />;
  if (!config) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>AI Teacher</h1>

      <Card>
        <div className={styles.entryContent}>
          <span className={styles.entryIcon} aria-hidden="true">🤖</span>
          <p className={styles.description}>
            Ask questions, get explanations, and receive personalized help from your AI teacher.
          </p>
          <Button variant="primary" onClick={() => startConversation()} disabled={starting}>
            {starting ? 'Starting…' : 'Start New Conversation'}
          </Button>
        </div>
      </Card>

      {config.suggestedTopics.length > 0 && (
        <section>
          <h2 className={styles.subtitle}>Suggested Topics</h2>
          <div className={styles.topicList}>
            {config.suggestedTopics.map(topic => (
              <button
                key={topic}
                className={styles.topicChip}
                onClick={() => startConversation(topic)}
                disabled={starting}
              >
                {topic}
              </button>
            ))}
          </div>
        </section>
      )}

      {config.recentConversations.length > 0 && (
        <section>
          <h2 className={styles.subtitle}>Recent Conversations</h2>
          <div className={styles.historyList}>
            {config.recentConversations.map(conv => (
              <Card key={conv.id}>
                <a
                  href={`/ai-teacher/${conv.id}`}
                  className={styles.historyItem}
                  onClick={e => { e.preventDefault(); navigate(`/ai-teacher/${conv.id}`); }}
                >
                  <span className={styles.historyTopic}>{conv.topic}</span>
                  <span className={styles.historyMeta}>
                    {conv.lastMessage} · {new Date(conv.updatedAt).toLocaleDateString()}
                  </span>
                </a>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
