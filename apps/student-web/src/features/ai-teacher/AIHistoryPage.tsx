import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import type { ApiError } from '../../types';
import styles from './AITeacher.module.css';

interface ChatSessionListItem {
  sessionId: string;
  contextRef: string;
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}

interface ListChatSessionsResult {
  sessions: ChatSessionListItem[];
}

export function AIHistoryPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchHistory() {
    setLoading(true);
    setError('');
    apiClient.get<ListChatSessionsResult>('/ai-teacher/sessions')
      .then((res) => setSessions(res.sessions))
      .catch((err: ApiError) => setError(err.message || 'Failed to load history'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchHistory(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchHistory} />;
  if (sessions.length === 0) {
    return <EmptyState title="No sessions yet" message="Start a session with your AI Teacher to see history here." />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Session History</h1>

      <div className={styles.historyList}>
        {sessions.map(session => (
          <Card key={session.sessionId}>
            <a
              href={`/ai-teacher/${session.sessionId}`}
              className={styles.historyItem}
              onClick={e => { e.preventDefault(); navigate(`/ai-teacher/${session.sessionId}`); }}
            >
              <span className={styles.historyTopic}>{session.contextRef}</span>
              <span className={styles.historyMeta}>
                {session.status} · {new Date(session.updatedAt).toLocaleDateString()}
              </span>
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}
