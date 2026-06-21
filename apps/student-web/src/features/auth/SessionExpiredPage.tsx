import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import styles from './AuthPages.module.css';

export function SessionExpiredPage() {
  return (
    <Card>
      <div className={styles.form}>
        <h1 className={styles.title}>Session expired</h1>
        <p className={styles.text}>
          Your session has expired. Please sign in again to continue.
        </p>
        <Link to="/login">
          <Button fullWidth>Sign in</Button>
        </Link>
      </div>
    </Card>
  );
}
