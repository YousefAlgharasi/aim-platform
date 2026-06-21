import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './Assessment.module.css';

interface AssessmentDetail {
  id: string;
  title: string;
  type: 'quiz' | 'exam';
  description: string;
  questionCount: number;
  duration: string;
  deadline: string | null;
  attemptsUsed: number;
  attemptsAllowed: number;
  eligible: boolean;
  rules: string[];
  pastAttempts: Array<{
    id: string;
    date: string;
    score: number;
    total: number;
    passed: boolean;
  }>;
}

export function AssessmentDetailPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  function fetchDetail() {
    setLoading(true);
    setError('');
    apiClient.get<AssessmentDetail>(`/api/assessments/${assessmentId}`)
      .then(setDetail)
      .catch((err: ApiError) => setError(err.message || 'Failed to load assessment'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchDetail(); }, [assessmentId]);

  function handleStart() {
    setStarting(true);
    apiClient.post<{ attemptId: string }>(`/api/assessments/${assessmentId}/attempts`, {})
      .then(({ attemptId }) => navigate(`/assessments/${assessmentId}/attempt/${attemptId}`))
      .catch((err: ApiError) => setError(err.message || 'Failed to start attempt'))
      .finally(() => setStarting(false));
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchDetail} />;
  if (!detail) return null;

  return (
    <div className={styles.detailContainer}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
          <span className={`${styles.typeBadge} ${detail.type === 'quiz' ? styles.typeQuiz : styles.typeExam}`}>
            {detail.type}
          </span>
        </div>
        <h1 className={styles.heading}>{detail.title}</h1>
      </div>

      <Card>
        <div className={styles.detailContent}>
          <p className={styles.description}>{detail.description}</p>

          <div className={styles.attemptInfo}>
            <span>{detail.questionCount} questions</span>
            <span>{detail.duration}</span>
            <span>{detail.attemptsUsed}/{detail.attemptsAllowed} attempts used</span>
          </div>

          {detail.deadline && (
            <span className={styles.deadlineText}>
              Deadline: {new Date(detail.deadline).toLocaleString()}
            </span>
          )}

          {detail.rules.length > 0 && (
            <div>
              <h2 className={styles.subtitle}>Rules</h2>
              <ul className={styles.rulesList}>
                {detail.rules.map((rule, i) => (
                  <li key={i} className={styles.ruleItem}>
                    <span className={styles.ruleIcon} aria-hidden="true">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {detail.eligible && (
        <Button variant="primary" fullWidth onClick={handleStart} disabled={starting}>
          {starting ? 'Starting…' : 'Start Attempt'}
        </Button>
      )}

      {!detail.eligible && (
        <Card>
          <p className={styles.description} style={{ textAlign: 'center' }}>
            You are not currently eligible to take this assessment.
          </p>
        </Card>
      )}

      {detail.pastAttempts.length > 0 && (
        <section>
          <h2 className={styles.subtitle}>Past Attempts</h2>
          <div className={styles.list}>
            {detail.pastAttempts.map(attempt => (
              <Card key={attempt.id}>
                <div className={styles.assessmentCard}>
                  <div className={styles.cardMeta}>
                    <span>{new Date(attempt.date).toLocaleDateString()}</span>
                    <span>{attempt.score}/{attempt.total}</span>
                    <span className={`${styles.statusBadge} ${attempt.passed ? styles.statusAvailable : styles.statusCompleted}`}>
                      {attempt.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
