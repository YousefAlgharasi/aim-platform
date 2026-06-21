import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './Placement.module.css';

interface PlacementQuestion {
  id: string;
  text: string;
  options: Array<{ id: string; text: string }>;
  questionNumber: number;
  totalQuestions: number;
}

export function PlacementQuestionUI() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<PlacementQuestion | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchNext = useCallback(() => {
    setLoading(true);
    setError('');
    setSelected(null);
    apiClient.get<PlacementQuestion>(`/api/placement/${id}/next`)
      .then(setQuestion)
      .catch((err: ApiError) => {
        if (err.statusCode === 404) {
          navigate(`/placement/${id}/result`);
        } else {
          setError(err.message || 'Failed to load question');
        }
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => { fetchNext(); }, [fetchNext]);

  async function handleSubmit() {
    if (!selected || !question) return;
    setSubmitting(true);
    setError('');
    try {
      await apiClient.post(`/api/placement/${id}/answer`, {
        questionId: question.id,
        answerId: selected,
      });
      fetchNext();
    } catch (err) {
      setError((err as ApiError).message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchNext} />;
  if (!question) return null;

  return (
    <div className={styles.container}>
      <div className={styles.progressHeader}>
        <span className={styles.questionCount}>
          Question {question.questionNumber} of {question.totalQuestions}
        </span>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${(question.questionNumber / question.totalQuestions) * 100}%` }}
            role="progressbar"
            aria-valuenow={question.questionNumber}
            aria-valuemin={0}
            aria-valuemax={question.totalQuestions}
          />
        </div>
      </div>

      <Card>
        <div className={styles.questionContent}>
          <h2 className={styles.questionText}>{question.text}</h2>
          <fieldset className={styles.options}>
            <legend className={styles.srOnly}>Select your answer</legend>
            {question.options.map(option => (
              <label
                key={option.id}
                className={`${styles.option} ${selected === option.id ? styles.optionSelected : ''}`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option.id}
                  checked={selected === option.id}
                  onChange={() => setSelected(option.id)}
                  className={styles.srOnly}
                />
                <span className={styles.optionRadio} />
                <span>{option.text}</span>
              </label>
            ))}
          </fieldset>
        </div>
      </Card>

      <Button onClick={handleSubmit} disabled={!selected || submitting} fullWidth>
        {submitting ? 'Submitting...' : 'Submit answer'}
      </Button>
    </div>
  );
}
