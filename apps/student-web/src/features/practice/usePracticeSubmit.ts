import { useState, useCallback } from 'react';
import { apiClient } from '../../api/client';
import type { ApiError } from '../../types';

interface Feedback {
  correct: boolean;
  explanation: string;
  correctAnswer?: string;
}

interface PracticeResult {
  score: number;
  total: number;
  summary: string;
}

interface SubmitResponse {
  feedback?: Feedback;
  result?: PracticeResult;
}

export function usePracticeSubmit(sessionId: string) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [result, setResult] = useState<PracticeResult | null>(null);

  const submitAnswer = useCallback((questionId: string, answer: string) => {
    setSubmitting(true);
    setError('');
    return apiClient.post<SubmitResponse>(`/api/practice/${sessionId}/answer`, {
      questionId,
      answer,
    })
      .then(res => {
        if (res.result) setResult(res.result);
        if (res.feedback) setFeedback(res.feedback);
        return res;
      })
      .catch((err: ApiError) => {
        setError(err.message || 'Failed to submit answer');
        throw err;
      })
      .finally(() => setSubmitting(false));
  }, [sessionId]);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
    setError('');
  }, []);

  return { submitAnswer, submitting, error, feedback, result, clearFeedback };
}
