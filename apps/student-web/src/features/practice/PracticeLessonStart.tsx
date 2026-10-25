import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { startPracticeSession } from './practiceApi';
import type { LessonRouteState } from '../lessons/LessonPlayerShell';

/**
 * Route: /practice/lesson/:lessonId
 * Starts a 'lesson_practice' learning session (POST /sessions/start), then
 * replaces the URL with /practice/:sessionId?lessonId=… where PracticeShell runs it.
 */
export function PracticeLessonStart() {
  const { lessonId = '' } = useParams<{ lessonId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const startedFor = useRef<string | null>(null);

  const start = useCallback(() => {
    setError('');
    startPracticeSession()
      .then(session => {
        navigate(`/practice/${session.id}?lessonId=${encodeURIComponent(lessonId)}`, {
          replace: true,
          state: location.state as LessonRouteState | null,
        });
      })
      .catch(err => setError(getErrorMessage(err, 'Failed to start practice session')));
  }, [lessonId, location.state, navigate]);

  useEffect(() => {
    // Guard against double-invocation (React StrictMode) creating two sessions.
    if (startedFor.current === lessonId) return;
    startedFor.current = lessonId;
    start();
  }, [lessonId, start]);

  if (error) return <ErrorState message={error} onRetry={start} />;
  return <LoadingSpinner />;
}
