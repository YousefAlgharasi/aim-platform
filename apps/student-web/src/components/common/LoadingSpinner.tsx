import styles from './LoadingSpinner.module.css';

export function LoadingSpinner() {
  return (
    <div className={styles.container} role="status" aria-label="Loading">
      <div className={styles.spinner} />
    </div>
  );
}
