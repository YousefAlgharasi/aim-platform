import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './Placement.module.css';

interface PlacementSection {
  id: string;
  title: string;
  skill_code: string;
  order_index: number;
  total_questions: number;
}

interface PlacementQuestion {
  id: string;
  section_id: string;
  text: string;
  options: Array<{ id: string; text: string }>;
  type: string;
  media_url: string | null;
  ordinal: number;
}

export function PlacementQuestionUI() {
  const { id: attemptId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<PlacementQuestion[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const sections = await apiClient.get<PlacementSection[]>('/placement/sections');
      const ordered = [...sections].sort((a, b) => a.order_index - b.order_index);
      const allQuestions: PlacementQuestion[] = [];
      for (const section of ordered) {
        const sectionQuestions = await apiClient.get<PlacementQuestion[]>(
          `/placement/questions?sectionId=${section.id}`,
        );
        allQuestions.push(...[...sectionQuestions].sort((a, b) => a.ordinal - b.ordinal));
      }
      setQuestions(allQuestions);
      setCurrentIndex(0);
      setSelected(null);
    } catch (err) {
      setError((err as ApiError).message || 'Failed to load placement questions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  async function handleSubmit() {
    if (!selected || !questions || !attemptId) return;
    const question = questions[currentIndex];
    setSubmitting(true);
    setError('');
    try {
      await apiClient.post(`/placement/attempts/${attemptId}/answers`, {
        placement_question_id: question.id,
        answer_value: selected,
      });

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
        setSelected(null);
      } else {
        await apiClient.post(`/placement/attempts/${attemptId}/complete`, {});
        navigate(`/placement/${attemptId}/result`);
      }
    } catch (err) {
      setError((err as ApiError).message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={loadQuestions} />;
  if (!questions || questions.length === 0) return null;

  const question = questions[currentIndex];
  const questionNumber = currentIndex + 1;
  const totalQuestions = questions.length;

  return (
    <div className={styles.container}>
      <div className={styles.progressHeader}>
        <span className={styles.questionCount}>
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            role="progressbar"
            aria-valuenow={questionNumber}
            aria-valuemin={0}
            aria-valuemax={totalQuestions}
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
        {submitting
          ? 'Submitting...'
          : questionNumber === totalQuestions
            ? 'Finish placement test'
            : 'Submit answer'}
      </Button>
    </div>
  );
}
