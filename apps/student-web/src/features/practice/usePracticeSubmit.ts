import { useState, useCallback } from 'react';
import { getErrorMessage } from '../../api/client';
import { submitAttempt, type AttemptResponse } from './practiceApi';

export interface AttemptFeedback {
  questionId: string;
  answerValue: string;
  /** Backend-evaluated; undefined when the backend didn't include feedback. */
  isCorrect?: boolean;
}

/**
 * Submits one answer: POST /sessions/:sessionId/attempt?feedback=true
 * { itemId, answerValue, startedAt, includeFeedback: true }. Correctness comes
 * only from the backend response.
 */
export function usePracticeSubmit(sessionId: string) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<AttemptFeedback | null>(null);

  const submitAnswer = useCallback(
    (questionId: string, answerValue: string, shownAt: Date): Promise<AttemptResponse> => {
      setSubmitting(true);
      setError('');
      // Like Flutter: nudge startedAt slightly into the past to avoid clock-drift issues.
      const startedAt = new Date(Math.min(shownAt.getTime() - 2000, Date.now())).toISOString();
      return submitAttempt(sessionId, { itemId: questionId, answerValue, startedAt })
        .then(res => {
          setFeedback({ questionId, answerValue, isCorrect: res.isCorrect });
          return res;
        })
        .catch(err => {
          setError(getErrorMessage(err, 'Failed to submit answer'));
          throw err;
        })
        .finally(() => setSubmitting(false));
    },
    [sessionId],
  );

  const clearFeedback = useCallback(() => {
    setFeedback(null);
    setError('');
  }, []);

  return { submitAnswer, submitting, error, feedback, clearFeedback };
}
