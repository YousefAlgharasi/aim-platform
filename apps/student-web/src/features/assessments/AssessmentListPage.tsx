import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { deadlineStatusLabel, fetchAssessments, type AssessmentListItem } from './assessmentsApi';
import { statusClass } from './assessmentUi';
import styles from './Assessment.module.css';

export function AssessmentListPage() {
  const [assessments, setAssessments] = useState<AssessmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAssessments()
      .then((a) => setAssessments(a ?? []))
      .catch((err) => setError(getErrorMessage(err, 'Failed to load assessments')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchAll} />;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.heading}>Assessments</h1>
        <Link to="/assessments/deadlines" className={styles.headerLink}>Deadlines</Link>
      </div>
      {assessments.length === 0 ? (
        <EmptyState title="No assessments" message="Assessments will appear here when available." />
      ) : (
        <div className={styles.list}>
          {assessments.map((a) => (
            <Link key={a.id} to={`/assessments/${a.id}`} className={styles.cardLink}>
              <Card>
                <div className={styles.assessmentCard}>
                  <div className={styles.badgeRow}>
                    <span className={`${styles.typeBadge} ${a.type === 'quiz' ? styles.typeQuiz : styles.typeExam}`}>
                      {a.type}
                    </span>
                    {a.deadlineStatus && (
                      <span className={`${styles.statusBadge} ${statusClass(a.deadlineStatus)}`}>
                        {deadlineStatusLabel(a.deadlineStatus)}
                      </span>
                    )}
                  </div>
                  <h2 className={styles.cardTitle}>{a.title}</h2>
                  {a.description && (
                    <div className={styles.cardMeta}>
                      <span>{a.description}</span>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
