import { Link } from 'react-router-dom';
import styles from './StatusPage.module.css';

export function ForbiddenPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.code}>403</h1>
      <p className={styles.message}>Access denied</p>
      <Link to="/" className={styles.link}>Back to Dashboard</Link>
    </div>
  );
}
