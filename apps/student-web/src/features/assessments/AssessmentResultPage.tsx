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
  assessmentQuestionLinkId: string;
  sectionId: string | null;
  pointsAwarded: number;
  pointsPossible: number;
  isCorrect?: boolean;
}

interface AssessmentResult {
  resultId: string;
  attemptId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  latePenaltyApplied: boolean;
  gradedAt: string;
  feedbackAllowed: boolean;
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
    apiClient.get<AssessmentResult>(`/student/assessments/attempts/${attemptId}/result`)
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
      <h1 className={styles.heading}>Result</h1>

      <Card>
        <div className={styles.resultContent}>
          <span className={styles.resultLabel}>Score</span>
          <span className={styles.resultScore}>{result.score}/{result.maxScore}</span>
          <span className={styles.resultLabel}>{Math.round((result.score / result.maxScore) * 100)}%</span>
          <span className={`${styles.resultGrade} ${result.passed ? styles.gradePassed : styles.gradeFailed}`}>
            {result.passed ? 'Passed' : 'Failed'}
          </span>
          {result.latePenaltyApplied && (
            <p className={styles.resultSummary}>A late penalty was applied to this attempt.</p>
          )}
        </div>
      </Card>

      {result.feedbackAllowed && result.breakdown.length > 0 && (
        <Card>
          <div>
            <h2 className={styles.subtitle}>Score Breakdown</h2>
            <div className={styles.breakdownList}>
              {result.breakdown.map((item) => (
                <div key={item.assessmentQuestionLinkId} className={styles.breakdownItem}>
                  <span className={styles.breakdownLabel}>
                    {item.isCorrect === undefined ? '' : item.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                  <span className={styles.breakdownValue}>{item.pointsAwarded}/{item.pointsPossible}</span>
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
