import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { QuestionRenderer } from '../practice/QuestionRenderer';
import type { ApiError } from '../../types';
import styles from './Assessment.module.css';

interface Choice {
  id: string;
  text: string;
}

interface AttemptQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer';
  text: string;
  choices?: Choice[];
}

interface AttemptData {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  questions: AttemptQuestion[];
  timeRemainingSeconds: number;
  status: 'in_progress' | 'submitted' | 'timed_out';
}

export function AttemptScreen() {
  const { assessmentId, attemptId } = useParams<{ assessmentId: string; attemptId: string }>();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function fetchAttempt() {
    setLoading(true);
    setError('');
    apiClient.get<AttemptData>(`/assessments/${assessmentId}/attempts/${attemptId}`)
      .then(data => {
        setAttempt(data);
        setTimeRemaining(data.timeRemainingSeconds);
      })
      .catch((err: ApiError) => setError(err.message || 'Failed to load attempt'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchAttempt(); }, [assessmentId, attemptId]);

  useEffect(() => {
    if (timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining > 0]);

  const handleSubmit = useCallback(() => {
    if (!attempt) return;
    setSubmitting(true);
    apiClient.post(`/assessments/${assessmentId}/attempts/${attemptId}/submit`, { answers })
      .then(() => navigate(`/assessments/${assessmentId}/result/${attemptId}`))
      .catch((err: ApiError) => setError(err.message || 'Failed to submit attempt'))
      .finally(() => setSubmitting(false));
  }, [attempt, answers, assessmentId, attemptId, navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchAttempt} />;
  if (!attempt) return null;

  const currentQuestion = attempt.questions[currentIndex];
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLowTime = timeRemaining < 300;

  return (
    <div className={styles.attemptShell}>
      <div className={styles.timerBar}>
        <span className={`${styles.timer} ${isLowTime ? styles.timerWarning : ''}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <div className={styles.questionNav}>
          {attempt.questions.map((q, i) => (
            <button
              key={q.id}
              className={`${styles.questionDot} ${i === currentIndex ? styles.dotCurrent : ''} ${answers[q.id] ? styles.dotAnswered : ''}`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Question ${i + 1}${answers[q.id] ? ', answered' : ''}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className={styles.questionArea}>
          <QuestionRenderer
            question={currentQuestion}
            selectedAnswer={answers[currentQuestion.id] || ''}
            onAnswerChange={val => setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }))}
            disabled={submitting}
          />
        </div>
      </Card>

      <div className={styles.actions}>
        <Button
          variant="secondary"
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
        >
          ← Previous
        </Button>

        {currentIndex < attempt.questions.length - 1 ? (
          <Button variant="primary" onClick={() => setCurrentIndex(prev => prev + 1)}>
            Next →
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Assessment'}
          </Button>
        )}
      </div>
    </div>
  );
}
