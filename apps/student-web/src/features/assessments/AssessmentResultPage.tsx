import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './Assessment.module.css';

interface BreakdownItem {
  label: string;
  score: number;
  total: number;
}

interface AssessmentResult {
  assessmentTitle: string;
  type: 'quiz' | 'exam';
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  grade: string;
  summary: string;
  breakdown: BreakdownItem[];
}

export function AssessmentResultPage() {
  const { assessmentId, attemptId } = useParams<{ assessmentId: string; attemptId: string }>();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchResult() {
    setLoading(true);
    setError('');
    apiClient.get<AssessmentResult>(`/assessments/${assessmentId}/attempts/${attemptId}/result`)
      .then(setResult)
      .catch((err: ApiError) => setError(err.message || 'Failed to load result'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchResult(); }, [assessmentId, attemptId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchResult} />;
  if (!result) return null;

  return (
    <div className={styles.detailContainer}>
      <h1 className={styles.heading}>{result.assessmentTitle} — Result</h1>

      <Card>
        <div className={styles.resultContent}>
          <span className={styles.resultLabel}>Score</span>
          <span className={styles.resultScore}>{result.score}/{result.total}</span>
          <span className={styles.resultLabel}>{result.percentage}%</span>
          <span className={`${styles.resultGrade} ${result.passed ? styles.gradePassed : styles.gradeFailed}`}>
            {result.grade}
          </span>
          <p className={styles.resultSummary}>{result.summary}</p>
        </div>
      </Card>

      {result.breakdown.length > 0 && (
        <Card>
          <div>
            <h2 className={styles.subtitle}>Score Breakdown</h2>
            <div className={styles.breakdownList}>
              {result.breakdown.map((item, i) => (
                <div key={i} className={styles.breakdownItem}>
                  <span className={styles.breakdownLabel}>{item.label}</span>
                  <span className={styles.breakdownValue}>{item.score}/{item.total}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        <Link to={`/assessments/${assessmentId}`}>
          <Button variant="secondary" fullWidth>Back to Assessment</Button>
        </Link>
        <Link to="/assessments">
          <Button variant="primary" fullWidth>All Assessments</Button>
        </Link>
      </div>
    </div>
  );
}
