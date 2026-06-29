import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import styles from './Practice.module.css';

export function PracticeShell() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <EmptyState
        title="Practice isn't available yet"
        message="There is no practice feature on the backend yet. Check back later."
      />
      <Button variant="primary" fullWidth onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </Button>
    </div>
  );
}
