import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
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

interface StartChatSessionResult {
  sessionId: string;
  studentId: string;
  contextRef: string;
  status: 'active' | 'closed';
  createdAt: string;
}

export function AITeacherEntryPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSessionListItem[]>([]);
  const [contextRef, setContextRef] = useState('');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  function fetchSessions() {
    setLoading(true);
    setError('');
    apiClient.get<ListChatSessionsResult>('/ai-teacher/sessions')
      .then((res) => setSessions(res.sessions))
      .catch((err: ApiError) => setError(err.message || 'Failed to load AI Teacher'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchSessions(); }, []);

  function startSession() {
    if (!contextRef.trim()) return;
    setStarting(true);
    apiClient.post<StartChatSessionResult>('/ai-teacher/sessions', { contextRef: contextRef.trim() })
      .then((session) => navigate(`/ai-teacher/${session.sessionId}`))
      .catch((err: ApiError) => setError(err.message || 'Failed to start session'))
      .finally(() => setStarting(false));
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchSessions} />;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>AI Teacher</h1>

      <Card>
        <div className={styles.entryContent}>
          <span className={styles.entryIcon} aria-hidden="true">🤖</span>
          <p className={styles.description}>
            Ask questions, get explanations, and receive personalized help from your AI teacher.
          </p>
          <Input
            label="What would you like help with?"
            value={contextRef}
            onChange={e => setContextRef(e.target.value)}
            placeholder="e.g. lesson-123 or a topic reference"
          />
          <Button variant="primary" onClick={startSession} disabled={starting || !contextRef.trim()}>
            {starting ? 'Starting…' : 'Start New Session'}
          </Button>
        </div>
      </Card>

      {sessions.length > 0 && (
        <section>
          <h2 className={styles.subtitle}>Recent Sessions</h2>
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
                    {new Date(session.updatedAt).toLocaleDateString()}
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
