import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAimResults } from './useAimResults';
import { formatDate, humanize, prettifySkillId } from './aimApi';
import styles from './AimPages.module.css';

/** Port of Flutter progress/ui/pages/recommendations_page.dart (GET /aim/students/:id/recommendations). */
export function RecommendationsPage() {
  const { data, loading, error, reload } = useAimResults();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  // Backend returns active recommendations ordered by rank ASC.
  const recs = data.recommendations;

  return (
    <div className={styles.container}>
      <Link to="/progress" className={styles.backLink}>← Progress</Link>
      <h1 className={styles.heading}>Recommendations</h1>
      <p className={styles.intro}>Personalized next steps from the AIM engine, most important first.</p>

      {recs.length === 0 ? (
        <EmptyState title="No recommendations" message="Complete more lessons to get personalized recommendations." />
      ) : (
        <div className={styles.list}>
          {recs.map((r) => (
            <Card key={r.id}>
              <div className={styles.item}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemTitle} title={r.targetSkillId}>{prettifySkillId(r.targetSkillId)}</span>
                  <div className={styles.badges}>
                    <span className={`${styles.badge} ${styles.tonePrimary}`}>{humanize(r.kind)}</span>
                    <span className={styles.badge}>#{r.rank}</span>
                  </div>
                </div>
                <p className={styles.body}>{r.reason}</p>
                <p className={styles.meta}>
                  Generated {formatDate(r.generatedAt)}
                  {r.expiresAt ? ` · Expires ${formatDate(r.expiresAt)}` : ''}
                </p>
                {r.targetLessonId && (
                  <Link to={`/lessons/${r.targetLessonId}`} className={styles.link}>Open lesson →</Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
