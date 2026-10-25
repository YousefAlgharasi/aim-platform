import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import {
  aiTeacherApi,
  GENERAL_CONTEXT_REF,
  lessonContextRef,
  relativeTime,
  sessionLabel,
  type ChatSessionListItem,
} from './aiTeacherApi';
import styles from './AITeacher.module.css';

/** Router state handed to AIChatPage after a session start. */
export interface AIChatLocationState {
  lessonTitle?: string | null;
  lastSessionRecap?: string | null;
  focusRecap?: string | null;
}

function chatState(lessonTitle: string | null): AIChatLocationState {
  return { lessonTitle };
}

/**
 * /ai-teacher
 *
 * Deep links (from other features):
 *   /ai-teacher?lessonId=<uuid>[&lessonTitle=<title>] → starts/resumes the lesson-scoped session
 *   /ai-teacher?contextRef=<ref>                        → starts/resumes a session for that contextRef
 * The backend get-or-creates one session per (student, contextRef), so the
 * lesson's chat and voice turns share one conversation.
 */
export function AITeacherEntryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get('lessonId');
  const explicitContextRef = searchParams.get('contextRef');
  const lessonTitle = searchParams.get('lessonTitle');
  const deepLinkContextRef = explicitContextRef?.trim() || (lessonId ? lessonContextRef(lessonId) : null);

  const [sessions, setSessions] = useState<ChatSessionListItem[]>([]);
  const [loading, setLoading] = useState(!deepLinkContextRef);
  const [loadError, setLoadError] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');
  const autoStarted = useRef(false);

  const startSession = useCallback(
    (contextRef: string, title?: string | null) => {
      setStarting(true);
      setStartError('');
      aiTeacherApi
        .startSession(contextRef)
        .then((session) => {
          const state: AIChatLocationState = {
            lessonTitle: title ?? null,
            lastSessionRecap: session.lastSessionRecap,
            focusRecap: session.focusRecap,
          };
          navigate(`/ai-teacher/${session.sessionId}`, { replace: !!deepLinkContextRef, state });
        })
        .catch((err) => {
          setStartError(getErrorMessage(err, 'Failed to start AI Teacher chat'));
          setStarting(false);
        });
    },
    [navigate, deepLinkContextRef],
  );

  const fetchSessions = useCallback(() => {
    setLoading(true);
    setLoadError('');
    aiTeacherApi
      .listSessions()
      .then((res) => setSessions(res.sessions ?? []))
      .catch((err) => setLoadError(getErrorMessage(err, 'Failed to load AI Teacher')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (deepLinkContextRef) {
      if (autoStarted.current) return;
      autoStarted.current = true;
      startSession(deepLinkContextRef, lessonTitle);
      return;
    }
    fetchSessions();
  }, [deepLinkContextRef, lessonTitle, startSession, fetchSessions]);

  if (deepLinkContextRef) {
    if (startError) {
      return (
        <ErrorState
          message={startError}
          onRetry={() => startSession(deepLinkContextRef, lessonTitle)}
        />
      );
    }
    return <LoadingSpinner />;
  }

  if (loading) return <LoadingSpinner />;
  if (loadError) return <ErrorState message={loadError} onRetry={fetchSessions} />;

  const recent = sessions.slice(0, 5);

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.heading}>AI Teacher</h1>
        <Link to="/ai-teacher/history" className={styles.headerLink}>
          History
        </Link>
      </div>

      <Card>
        <div className={styles.entryContent}>
          <span className={styles.entryIcon} aria-hidden="true">🤖</span>
          <p className={styles.description}>
            Ask questions, get explanations, and receive personalized help from your AI teacher.
          </p>
          {startError && <p className={styles.inlineError} role="alert">{startError}</p>}
          <div className={styles.entryActions}>
            <Button
              variant="primary"
              onClick={() => startSession(GENERAL_CONTEXT_REF)}
              disabled={starting}
            >
              {starting ? 'Starting…' : 'Chat with AI Teacher'}
            </Button>
            <Link to="/voice-teacher" className={styles.secondaryLink}>
              🎙 Talk with Voice Teacher
            </Link>
          </div>
        </div>
      </Card>

      {recent.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.subtitle}>Recent Conversations</h2>
          <div className={styles.historyList}>
            {recent.map((session) => (
              <Card key={session.sessionId}>
                <Link
                  to={`/ai-teacher/${session.sessionId}`}
                  state={chatState(session.contextTitle)}
                  className={styles.historyItem}
                >
                  <span className={styles.historyTopic}>{sessionLabel(session)}</span>
                  <span className={styles.historyMeta}>{relativeTime(session.updatedAt)}</span>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
