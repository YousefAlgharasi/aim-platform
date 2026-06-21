import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Button } from '../../components/common/Button';
import type { LessonData } from './LessonPlayerShell';
import type { ApiError } from '../../types';

interface LessonNavigationProps {
  lesson: LessonData;
  onStatusChange: () => void;
}

export function LessonNavigation({ lesson, onStatusChange }: LessonNavigationProps) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleComplete() {
    setSubmitting(true);
    setError('');
    apiClient.post(`/api/lessons/${lesson.id}/complete`, {})
      .then(() => {
        onStatusChange();
        if (lesson.nextLessonId) {
          navigate(`/lessons/${lesson.nextLessonId}`);
        } else {
          navigate(`/curriculum/${lesson.subjectId}`);
        }
      })
      .catch((err: ApiError) => setError(err.message || 'Failed to complete lesson'))
      .finally(() => setSubmitting(false));
  }

  return (
    <>
      {lesson.prevLessonId ? (
        <Button variant="secondary" onClick={() => navigate(`/lessons/${lesson.prevLessonId}`)}>
          ← Previous
        </Button>
      ) : (
        <span />
      )}

      {error && <span style={{ color: 'var(--color-danger-500)', fontSize: '13px' }}>{error}</span>}

      {lesson.status === 'completed' ? (
        lesson.nextLessonId ? (
          <Button variant="primary" onClick={() => navigate(`/lessons/${lesson.nextLessonId}`)}>
            Next →
          </Button>
        ) : (
          <Button variant="primary" onClick={() => navigate(`/curriculum/${lesson.subjectId}`)}>
            Back to Course
          </Button>
        )
      ) : (
        <Button variant="primary" onClick={handleComplete} disabled={submitting}>
          {submitting ? 'Completing…' : 'Complete & Continue'}
        </Button>
      )}
    </>
  );
}
