import { EmptyState } from '../../components/common/EmptyState';
import styles from './ProgressSummary.module.css';

export function ProgressSummary() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Progress</h1>
      <EmptyState
        title="Progress not available yet"
        message="Progress tracking isn't available yet. Check back later."
      />
    </div>
  );
}
