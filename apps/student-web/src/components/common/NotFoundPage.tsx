import { Link } from 'react-router-dom';
import styles from './StatusPage.module.css';

export function NotFoundPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>Page not found</p>
      <Link to="/" className={styles.link}>Back to Dashboard</Link>
    </div>
  );
}
