import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { QuestionRenderer } from './QuestionRenderer';
import type { ApiError } from '../../types';
import styles from './Practice.module.css';

interface Choice {
  id: string;
  text: string;
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer';
  text: string;
  choices?: Choice[];
}

interface Feedback {
  correct: boolean;
  explanation: string;
}

interface PracticeSession {
  id: string;
  subjectName: string;
  totalQuestions: number;
  currentIndex: number;
  question: Question;
}

interface PracticeResult {
  score: number;
  total: number;
  summary: string;
}

export function PracticeShell() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [draftAnswer, setDraftAnswer] = useState('');

  function fetchSession() {
    setLoading(true);
    setError('');
    apiClient.get<PracticeSession>(`/api/practice/${sessionId}`)
      .then(s => { setSession(s); setFeedback(null); setDraftAnswer(''); })
      .catch((err: ApiError) => setError(err.message || 'Failed to load practice session'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchSession(); }, [sessionId]);

  function handleSubmit() {
    if (!session || !draftAnswer) return;
    setSubmitting(true);
    apiClient.post<{ feedback?: Feedback; result?: PracticeResult }>(
      `/api/practice/${sessionId}/answer`,
      { questionId: session.question.id, answer: draftAnswer }
    )
      .then(res => {
        if (res.result) {
          setResult(res.result);
        } else if (res.feedback) {
          setFeedback(res.feedback);
        }
      })
      .catch((err: ApiError) => setError(err.message || 'Failed to submit answer'))
      .finally(() => setSubmitting(false));
  }

  function handleNext() {
    fetchSession();
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchSession} />;

  if (result) {
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>Practice Complete</h1>
        <Card>
          <div className={styles.resultContent}>
            <span className={styles.resultScore}>{result.score}/{result.total}</span>
            <p className={styles.resultSummary}>{result.summary}</p>
          </div>
        </Card>
        <Button variant="primary" fullWidth onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!session) return null;

  const progressPercent = ((session.currentIndex) / session.totalQuestions) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.sessionHeader}>
        <h1 className={styles.heading}>{session.subjectName} Practice</h1>
        <div className={styles.progressHeader}>
          <span className={styles.questionCount}>
            Question {session.currentIndex + 1} of {session.totalQuestions}
          </span>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <Card>
        <div className={styles.questionArea}>
          <QuestionRenderer
            question={session.question}
            selectedAnswer={draftAnswer}
            onAnswerChange={setDraftAnswer}
            disabled={!!feedback}
          />

          {feedback && (
            <div className={`${styles.feedbackCard} ${feedback.correct ? styles.feedbackCorrect : styles.feedbackIncorrect}`}>
              <p className={styles.feedbackTitle}>{feedback.correct ? 'Correct!' : 'Incorrect'}</p>
              <p className={styles.feedbackExplanation}>{feedback.explanation}</p>
            </div>
          )}

          <div className={styles.actions}>
            {feedback ? (
              <Button variant="primary" onClick={handleNext}>Next Question</Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit} disabled={submitting || !draftAnswer}>
                {submitting ? 'Submitting…' : 'Submit Answer'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
