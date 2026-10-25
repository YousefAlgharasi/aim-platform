import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { aiTeacherApi, relativeTime, sessionLabel, type ChatSessionListItem } from './aiTeacherApi';
import type { AIChatLocationState } from './AITeacherEntryPage';
import styles from './AITeacher.module.css';

/**
 * /ai-teacher/history — the student's active AI Teacher conversations
 * (GET /ai-teacher/sessions). Text and voice turns share one session, so each
 * conversation can be reopened in chat or in Voice Teacher.
 */
export function AIHistoryPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(() => {
    setLoading(true);
    setError('');
    aiTeacherApi
      .listSessions()
      .then((res) => setSessions(res.sessions ?? []))
      .catch((err) => setError(getErrorMessage(err, 'Failed to load history')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchHistory} />;

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.heading}>Conversation History</h1>
        <Link to="/ai-teacher" className={styles.headerLink}>
          AI Teacher
        </Link>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          message="Start a conversation with your AI Teacher to see it here."
          actionLabel="Go to AI Teacher"
          onAction={() => navigate('/ai-teacher')}
        />
      ) : (
        <div className={styles.historyList}>
          {sessions.map((session) => {
            const state: AIChatLocationState = { lessonTitle: session.contextTitle };
            return (
              <Card key={session.sessionId}>
                <div className={styles.historyRow}>
                  <Link to={`/ai-teacher/${session.sessionId}`} state={state} className={styles.historyItem}>
                    <span className={styles.historyTopic}>{sessionLabel(session)}</span>
                    <span className={styles.historyMeta}>
                      {session.status === 'active' ? 'Active' : 'Closed'} · {relativeTime(session.updatedAt)}
                    </span>
                  </Link>
                  <Link
                    to={`/voice-teacher/${session.sessionId}`}
                    className={styles.headerLink}
                    aria-label={`Continue ${sessionLabel(session)} in Voice Teacher`}
                  >
                    🎙 Voice
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
