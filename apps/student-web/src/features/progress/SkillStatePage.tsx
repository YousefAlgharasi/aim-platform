import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAimResults } from './useAimResults';
import { masteryTier, prettifySkillId, tierLabel, toPercent, trendLabel } from './aimApi';
import styles from './SkillStatePage.module.css';

const OPEN_WEAKNESS_STATUSES = new Set(['open', 'improving']);

export function SkillStatePage() {
  const { data, loading, error, reload } = useAimResults();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  // Backend order is preserved (Flutter never reorders AIM output).
  const skills = data.skillStates;
  const weakSkillIds = new Set(
    data.weaknessRecords
      .filter((w) => OPEN_WEAKNESS_STATUSES.has(w.status.toLowerCase()))
      .map((w) => w.skillId),
  );

  return (
    <div className={styles.container}>
      <Link to="/progress" className={styles.backLink}>← Progress</Link>
      <h1 className={styles.heading}>Skills</h1>

      {skills.length === 0 ? (
        <EmptyState
          title="No skill data yet"
          message="Your skill mastery appears here after you complete lessons, practice or assessments."
        />
      ) : (
        <div className={styles.skillList}>
          {skills.map((s) => {
            const pct = toPercent(s.masteryScore);
            const tier = masteryTier(s.masteryScore);
            const prev = s.previousMasteryScore != null ? toPercent(s.previousMasteryScore) : null;
            const name = prettifySkillId(s.skillId);
            return (
              <Card key={s.skillId}>
                <div className={styles.skillItem}>
                  <div className={styles.skillHeader}>
                    <span className={styles.skillName} title={s.skillId}>{name}</span>
                    <span className={tier === 'needsWork' || weakSkillIds.has(s.skillId) ? styles.weaknessBadge : styles.tierBadge}>
                      {tierLabel[tier]}
                    </span>
                  </div>
                  <div
                    className={styles.masteryBar}
                    role="progressbar"
                    aria-label={`${name} mastery`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={pct}
                  >
                    <div className={tier === 'needsWork' ? styles.masteryFillWeak : styles.masteryFill} style={{ width: `${pct}%` }} />
                  </div>
                  <div className={styles.skillHeader}>
                    <span className={styles.masteryLabel}>
                      Mastery {pct}%{prev != null ? ` · was ${prev}%` : ''}
                    </span>
                    <span className={styles.masteryLabel}>{trendLabel(s.masteryTrend)}</span>
                  </div>
                  <span className={styles.masteryLabel}>
                    Confidence {toPercent(s.masteryConfidence)}% · Last evaluated{' '}
                    {new Date(s.lastEvaluatedAt).toLocaleDateString()}
                  </span>
                  {weakSkillIds.has(s.skillId) && (
                    <p className={styles.recommendation}>
                      This skill is flagged as an area to improve. <Link to="/progress/weaknesses">See details</Link>
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
