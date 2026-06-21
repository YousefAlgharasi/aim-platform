import { Outlet } from 'react-router-dom';
import styles from './PublicLayout.module.css';

export function PublicLayout() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.logo}>AIM</div>
        <Outlet />
      </main>
    </div>
  );
}
