import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import type { ApiError } from '../../types';
import styles from './Assessment.module.css';

interface Assessment {
  id: string;
  title: string;
  type: 'quiz' | 'exam';
  status: 'available' | 'completed' | 'upcoming';
  deadline: string | null;
  questionCount: number;
  duration: string;
  attemptsUsed: number;
  attemptsAllowed: number;
}

export function AssessmentListPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchAssessments() {
    setLoading(true);
    setError('');
    apiClient.get<{ assessments: Assessment[] }>('/api/assessments')
      .then(({ assessments: a }) => setAssessments(a))
      .catch((err: ApiError) => setError(err.message || 'Failed to load assessments'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchAssessments(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchAssessments} />;
  if (assessments.length === 0) {
    return <EmptyState title="No assessments" message="Assessments will appear here when available." />;
  }

  function getStatusClass(status: Assessment['status']) {
    switch (status) {
      case 'available': return styles.statusAvailable;
      case 'completed': return styles.statusCompleted;
      case 'upcoming': return styles.statusUpcoming;
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Assessments</h1>
      <div className={styles.list}>
        {assessments.map(a => (
          <Link key={a.id} to={`/assessments/${a.id}`} className={styles.cardLink}>
            <Card>
              <div className={styles.assessmentCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                  <span className={`${styles.typeBadge} ${a.type === 'quiz' ? styles.typeQuiz : styles.typeExam}`}>
                    {a.type}
                  </span>
                  <span className={`${styles.statusBadge} ${getStatusClass(a.status)}`}>
                    {a.status}
                  </span>
                </div>
                <h2 className={styles.cardTitle}>{a.title}</h2>
                <div className={styles.cardMeta}>
                  <span>{a.questionCount} questions</span>
                  <span>{a.duration}</span>
                  <span>{a.attemptsUsed}/{a.attemptsAllowed} attempts</span>
                </div>
                {a.deadline && (
                  <span className={styles.deadlineText}>
                    Due: {new Date(a.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
