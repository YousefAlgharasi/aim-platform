import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './TopBar.module.css';

export function TopBar() {
  const { user } = useAuth();

  return (
    <header className={styles.topbar}>
      <div className={styles.mobileLogo}>AIM</div>
      <div className={styles.spacer} />
      <div className={styles.actions}>
        <Link to="/profile" className={styles.profile} aria-label="Profile">
          {user?.name?.charAt(0).toUpperCase() || '?'}
        </Link>
      </div>
    </header>
  );
}
