import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './Assessment.module.css';

interface AssessmentSection {
  id: string;
  title: string;
  order: number;
  questionCount: number;
}

interface DeadlineStatusResult {
  deadlineId: string;
  opensAt: string;
  closesAt: string;
  extendedClosesAt: string | null;
  status: string;
}

interface AssessmentDetail {
  id: string;
  type: 'quiz' | 'exam' | string;
  title: string;
  description: string | null;
  sections: AssessmentSection[];
  maxAttempts: number;
  timeLimitSeconds: number | null;
  deadline: DeadlineStatusResult | null;
}

interface ResultHistoryItem {
  attemptId: string;
  attemptNumber: number;
  score: number;
  maxScore: number;
  passed: boolean;
  gradedAt: string;
}

interface ResultHistoryResponse {
  assessmentId: string;
  totalAttempts: number;
  results: ResultHistoryItem[];
}

export function AssessmentDetailPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<AssessmentDetail | null>(null);
  const [history, setHistory] = useState<ResultHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  function fetchDetail() {
    setLoading(true);
    setError('');
    Promise.all([
      apiClient.get<AssessmentDetail>(`/student/assessments/${assessmentId}`),
      apiClient.get<ResultHistoryResponse>(`/student/assessments/${assessmentId}/history`),
    ])
      .then(([d, h]) => {
        setDetail(d);
        setHistory(h);
      })
      .catch((err: ApiError) => setError(err.message || 'Failed to load assessment'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchDetail(); }, [assessmentId]);

  function handleStart() {
    setStarting(true);
    apiClient.post<{ attemptId: string }>(`/student/assessments/${assessmentId}/attempts`, {})
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
          {detail.description && <p className={styles.description}>{detail.description}</p>}

          <div className={styles.attemptInfo}>
            <span>{detail.sections.reduce((sum, s) => sum + s.questionCount, 0)} questions</span>
            {detail.timeLimitSeconds && <span>{Math.round(detail.timeLimitSeconds / 60)} min</span>}
            <span>{history?.totalAttempts ?? 0}/{detail.maxAttempts} attempts used</span>
          </div>

          {detail.deadline && (
            <span className={styles.deadlineText}>
              Deadline: {new Date(detail.deadline.closesAt).toLocaleString()} ({detail.deadline.status})
            </span>
          )}
        </div>
      </Card>

      <Button variant="primary" fullWidth onClick={handleStart} disabled={starting}>
        {starting ? 'Starting…' : 'Start Attempt'}
      </Button>

      {history && history.results.length > 0 && (
        <section>
          <h2 className={styles.subtitle}>Past Attempts</h2>
          <div className={styles.list}>
            {history.results.map(attempt => (
              <Card key={attempt.attemptId}>
                <div className={styles.assessmentCard}>
                  <div className={styles.cardMeta}>
                    <span>{new Date(attempt.gradedAt).toLocaleDateString()}</span>
                    <span>{attempt.score}/{attempt.maxScore}</span>
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
