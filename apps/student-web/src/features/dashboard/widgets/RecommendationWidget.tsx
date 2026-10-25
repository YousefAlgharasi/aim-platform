import { Link } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { EmptyState } from '../../../components/common/EmptyState';
import { humanize, prettifySkillId, type RecommendationEntry } from '../../progress/aimApi';
import styles from './Widgets.module.css';

interface RecommendationWidgetProps {
  /** Active AIM recommendations, already ordered by rank by the backend. */
  recommendations: RecommendationEntry[];
  limit?: number;
}

export function RecommendationWidget({ recommendations, limit = 3 }: RecommendationWidgetProps) {
  if (recommendations.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No recommendations"
          message="Complete more lessons to get personalized recommendations."
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className={styles.listWidget}>
        <div className={styles.headerRow}>
          <h3 className={styles.listTitle}>Recommended for you</h3>
          <Link to="/progress/recommendations" className={styles.viewAll}>View all</Link>
        </div>
        <ul className={styles.recList}>
          {recommendations.slice(0, limit).map((rec) => (
            <li key={rec.id} className={styles.recItem}>
              <Link
                to={rec.targetLessonId ? `/lessons/${rec.targetLessonId}` : '/progress/recommendations'}
                className={styles.recLink}
              >
                <span className={styles.recType}>{humanize(rec.kind)}</span>
                <span className={styles.recName}>{prettifySkillId(rec.targetSkillId)}</span>
                <span className={styles.recReason}>{rec.reason}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
