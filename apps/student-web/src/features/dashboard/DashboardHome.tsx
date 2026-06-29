import { EmptyState } from '../../components/common/EmptyState';
import styles from './DashboardHome.module.css';

export function DashboardHome() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Dashboard</h1>
      <EmptyState
        title="Dashboard not available yet"
        message="A personalized dashboard isn't available yet. Check back later."
      />
    </div>
  );
}
