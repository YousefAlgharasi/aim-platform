import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { fetchAttemptResult, type AttemptResult } from './assessmentsApi';
import styles from './Assessment.module.css';

export function AssessmentResultPage() {
  const { assessmentId, attemptId } = useParams<{ assessmentId: string; attemptId: string }>();
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResult = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAttemptResult(attemptId ?? '')
      .then(setResult)
      .catch((err) => setError(getErrorMessage(err, 'Failed to load result')))
      .finally(() => setLoading(false));
  }, [attemptId]);

  useEffect(() => { fetchResult(); }, [fetchResult]);

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
          <span className={styles.deadlineText}>Graded {new Date(result.gradedAt).toLocaleString()}</span>
          {result.maxScore > 0 && (
            <span className={styles.resultLabel}>{Math.round((result.score / result.maxScore) * 100)}%</span>
          )}
          <span className={`${styles.resultGrade} ${result.passed ? styles.gradePassed : styles.gradeFailed}`}>
            {result.passed ? 'Passed' : 'Not passed'}
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
              {result.breakdown.map((item, index) => (
                <div key={item.assessmentQuestionLinkId ?? index} className={styles.breakdownItem}>
                  <span className={styles.breakdownLabel}>
                    Question {index + 1}
                    {item.isCorrect === undefined || item.isCorrect === null ? '' : item.isCorrect ? ' · Correct' : ' · Incorrect'}
                  </span>
                  <span className={styles.breakdownValue}>{item.pointsAwarded}/{item.pointsPossible}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className={styles.buttonStack}>
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
