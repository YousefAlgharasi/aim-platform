import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { logout } = useAuth();

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Settings</h1>

      <EmptyState
        title="Settings aren't available yet"
        message="There is no settings feature on the backend yet. For language and other profile fields, see your Profile page. For notifications, see Notification Preferences."
      />

      <Card>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <Button variant="ghost" onClick={logout}>Sign out</Button>
        </div>
      </Card>
    </div>
  );
}
