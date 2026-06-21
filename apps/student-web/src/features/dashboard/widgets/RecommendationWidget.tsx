import { Link } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { EmptyState } from '../../../components/common/EmptyState';
import styles from './Widgets.module.css';

interface Recommendation {
  id: string;
  title: string;
  type: string;
  reason: string;
}

interface RecommendationWidgetProps {
  recommendations: Recommendation[];
}

export function RecommendationWidget({ recommendations }: RecommendationWidgetProps) {
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
        <h3 className={styles.listTitle}>Recommended for you</h3>
        <ul className={styles.recList}>
          {recommendations.map(rec => (
            <li key={rec.id} className={styles.recItem}>
              <Link to={`/lessons/${rec.id}`} className={styles.recLink}>
                <span className={styles.recType}>{rec.type}</span>
                <span className={styles.recName}>{rec.title}</span>
                <span className={styles.recReason}>{rec.reason}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
