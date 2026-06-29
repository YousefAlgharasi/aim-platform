import { useParams, Link } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import styles from './Assessment.module.css';

export function AttemptScreen() {
  const { assessmentId } = useParams<{ assessmentId: string; attemptId: string }>();

  return (
    <div className={styles.attemptShell}>
      <EmptyState
        title="Taking assessments isn't available yet"
        message="The backend doesn't yet expose attempt questions or per-question answer submission for this assessment. Check back soon."
      />
      <Link to={`/assessments/${assessmentId}`} className={styles.cardLink}>
        Back to assessment
      </Link>
    </div>
  );
}
