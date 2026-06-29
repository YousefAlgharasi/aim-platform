import { EmptyState } from '../../components/common/EmptyState';
import styles from './SkillStatePage.module.css';

export function SkillStatePage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Skills</h1>
      <EmptyState
        title="Skills not available yet"
        message="Skill mastery tracking isn't available yet. Check back later."
      />
    </div>
  );
}
