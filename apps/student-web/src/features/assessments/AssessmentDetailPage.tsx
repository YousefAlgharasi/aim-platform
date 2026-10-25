import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import {
  deadlineStatusLabel,
  fetchAssessmentDetail,
  fetchAssessmentHistory,
  startAssessmentAttempt,
  type AssessmentDetail,
  type ResultHistory,
} from './assessmentsApi';
import { assessmentErrorMessage } from './assessmentErrors';
import { statusClass } from './assessmentUi';
import styles from './Assessment.module.css';

const CLOSED_STATUSES = new Set(['closed', 'expired', 'missed']);

export function AssessmentDetailPage() {
  const { assessmentId = '' } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<AssessmentDetail | null>(null);
  const [history, setHistory] = useState<ResultHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [startError, setStartError] = useState('');

  const fetchDetail = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([
      fetchAssessmentDetail(assessmentId),
      // History failing must not hide the assessment itself.
      fetchAssessmentHistory(assessmentId).catch(() => null),
    ])
      .then(([d, h]) => {
        setDetail(d);
        setHistory(h);
      })
      .catch((err) => setError(getErrorMessage(err, 'Failed to load assessment')))
      .finally(() => setLoading(false));
  }, [assessmentId]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  async function handleStart() {
    setStarting(true);
    setStartError('');
    try {
      // The backend returns the existing open attempt if there is one (resume).
      const attempt = await startAssessmentAttempt(assessmentId);
      navigate(`/assessments/${assessmentId}/attempt/${attempt.attemptId}`);
    } catch (err) {
      setStartError(assessmentErrorMessage(err, 'Failed to start attempt'));
      setStarting(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchDetail} />;
  if (!detail) return null;

  const totalQuestions = detail.sections.reduce((sum, s) => sum + s.questionCount, 0);
  const deadline = detail.deadline;
  const deadlineClosed = !!deadline && CLOSED_STATUSES.has(deadline.status);
  const notOpenYet = deadline?.status === 'upcoming';
  const closesAt = deadline ? deadline.extendedClosesAt ?? deadline.closesAt : null;

  return (
    <div className={styles.detailContainer}>
      <Link to="/assessments" className={styles.backLink}>← All assessments</Link>
      <div>
        <div className={styles.badgeRow}>
          <span className={`${styles.typeBadge} ${detail.type === 'quiz' ? styles.typeQuiz : styles.typeExam}`}>
            {detail.type}
          </span>
          {deadline && (
            <span className={`${styles.statusBadge} ${statusClass(deadline.status)}`}>
              {deadlineStatusLabel(deadline.status)}
            </span>
          )}
        </div>
        <h1 className={styles.heading}>{detail.title}</h1>
      </div>

      <Card>
        <div className={styles.detailContent}>
          {detail.description && <p className={styles.description}>{detail.description}</p>}

          <div className={styles.attemptInfo}>
            <span>{totalQuestions} question{totalQuestions === 1 ? '' : 's'}</span>
            {detail.timeLimitSeconds ? <span>{Math.round(detail.timeLimitSeconds / 60)} min</span> : <span>No time limit</span>}
            <span>{history?.totalAttempts ?? 0}/{detail.maxAttempts} attempts used</span>
          </div>

          {detail.sections.length > 1 && (
            <ul className={styles.rulesList}>
              {[...detail.sections].sort((a, b) => a.order - b.order).map((s) => (
                <li key={s.id} className={styles.ruleItem}>
                  {s.title} — {s.questionCount} question{s.questionCount === 1 ? '' : 's'}
                </li>
              ))}
            </ul>
          )}

          {deadline && (
            <span className={styles.deadlineText}>
              {notOpenYet
                ? `Opens ${new Date(deadline.opensAt).toLocaleString()}`
                : `Due ${new Date(closesAt as string).toLocaleString()}`}
              {deadline.extendedClosesAt ? ' (extended)' : ''}
            </span>
          )}
        </div>
      </Card>

      {startError && <Banner variant="error">{startError}</Banner>}
      {deadlineClosed && <Banner variant="info">This assessment is closed.</Banner>}

      <Button variant="primary" fullWidth onClick={handleStart} disabled={starting}>
        {starting ? 'Starting…' : 'Start or continue attempt'}
      </Button>

      {history && history.results.length > 0 && (
        <section>
          <h2 className={styles.subtitle}>Past attempts</h2>
          <div className={styles.list}>
            {history.results.map((attempt) => (
              <Link
                key={attempt.resultId}
                to={`/assessments/${assessmentId}/result/${attempt.attemptId}`}
                className={styles.cardLink}
              >
                <Card>
                  <div className={styles.assessmentCard}>
                    <div className={styles.cardMeta}>
                      <span>Attempt {attempt.attemptNumber}</span>
                      <span>{new Date(attempt.gradedAt).toLocaleDateString()}</span>
                      <span>{attempt.score}/{attempt.maxScore}</span>
                      <span className={`${styles.statusBadge} ${attempt.passed ? styles.statusAvailable : styles.statusCompleted}`}>
                        {attempt.passed ? 'Passed' : 'Not passed'}
                      </span>
                      {attempt.latePenaltyApplied && <span>Late penalty</span>}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
