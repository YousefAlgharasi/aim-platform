import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { fetchEngagementSummary, type DailyGoalSummary } from '../dashboard/dashboardApi';
import { useAimResults } from './useAimResults';
import { dueLabel, humanize, masteryTier, prettifySkillId, tierLabel, toPercent } from './aimApi';
import styles from './ProgressSummary.module.css';

const OPEN_WEAKNESS_STATUSES = new Set(['open', 'improving']);
const OPEN_REVIEW_STATUSES = new Set(['due', 'pending', 'rescheduled']);

export function ProgressSummary() {
  const { data, loading, error, reload } = useAimResults();
  // Day streak is supplementary (Flutter reads it from the Home engagement summary);
  // its failure must not block the AIM data.
  const [goal, setGoal] = useState<DailyGoalSummary | null>(null);

  useEffect(() => {
    fetchEngagementSummary()
      .then((s) => setGoal(s?.goal ?? null))
      .catch(() => setGoal(null));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const { skillStates, weaknessRecords, reviewSchedules, recommendations } = data;
  const isEmpty =
    skillStates.length === 0 &&
    weaknessRecords.length === 0 &&
    reviewSchedules.length === 0 &&
    recommendations.length === 0;

  const avgMastery =
    skillStates.length > 0
      ? Math.round(skillStates.reduce((sum, s) => sum + toPercent(s.masteryScore), 0) / skillStates.length)
      : null;
  const openWeaknesses = weaknessRecords.filter((w) => OPEN_WEAKNESS_STATUSES.has(w.status.toLowerCase()));
  const openReviews = reviewSchedules
    .filter((r) => OPEN_REVIEW_STATUSES.has(r.status.toLowerCase()))
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  const topSkills = [...skillStates].sort((a, b) => b.masteryScore - a.masteryScore).slice(0, 5);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Progress</h1>

      <div className={styles.statsRow}>
        <Card>
          <div className={styles.stat}>
            <span className={styles.statValue}>{skillStates.length}</span>
            <span className={styles.statLabel}>Skills tracked</span>
          </div>
        </Card>
        <Card>
          <div className={styles.stat}>
            <span className={styles.statValue}>{avgMastery == null ? '—' : `${avgMastery}%`}</span>
            <span className={styles.statLabel}>Average mastery</span>
          </div>
        </Card>
        <Card>
          <div className={styles.stat}>
            <span className={styles.statValue}>{openReviews.length}</span>
            <span className={styles.statLabel}>Reviews scheduled</span>
          </div>
        </Card>
        <Card>
          <div className={styles.stat}>
            <span className={styles.statValue}>{goal ? goal.streakDays : '—'}</span>
            <span className={styles.statLabel}>Day streak</span>
          </div>
        </Card>
      </div>

      {isEmpty ? (
        <EmptyState
          title="No progress yet"
          message="Complete lessons and practice to see your skill mastery, weaknesses and review schedule here."
        />
      ) : (
        <>
          <section>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Skills</h2>
              <Link to="/progress/skills" className={styles.viewAll}>View all</Link>
            </div>
            {topSkills.length === 0 ? (
              <Card><p className={styles.muted}>No skill mastery data yet.</p></Card>
            ) : (
              <Card>
                <div className={styles.subjectList}>
                  {topSkills.map((s) => {
                    const pct = toPercent(s.masteryScore);
                    return (
                      <div key={s.skillId} className={styles.subjectItem}>
                        <div className={styles.rowBetween}>
                          <span className={styles.subjectName}>{prettifySkillId(s.skillId)}</span>
                          <span className={styles.muted}>{tierLabel[masteryTier(s.masteryScore)]}</span>
                        </div>
                        <div
                          className={styles.progressBar}
                          role="progressbar"
                          aria-label={`${prettifySkillId(s.skillId)} mastery`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={pct}
                        >
                          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                        </div>
                        <div className={styles.subjectStats}>
                          <span>Mastery {pct}%</span>
                          <span>Confidence {toPercent(s.masteryConfidence)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </section>

          <section>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Areas to improve</h2>
              <Link to="/progress/weaknesses" className={styles.viewAll}>View all</Link>
            </div>
            <Card>
              {openWeaknesses.length === 0 ? (
                <p className={styles.muted}>No open weaknesses. Keep it up!</p>
              ) : (
                <div className={styles.chipRow}>
                  {openWeaknesses.slice(0, 8).map((w) => (
                    <span key={w.weaknessId} className={styles.chip}>
                      {prettifySkillId(w.skillId)} · {humanize(w.severity)}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          </section>

          <section>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Review schedule</h2>
              <Link to="/progress/reviews" className={styles.viewAll}>View all</Link>
            </div>
            <Card>
              {openReviews.length === 0 ? (
                <p className={styles.muted}>Nothing to review right now.</p>
              ) : (
                <ul className={styles.plainList}>
                  {openReviews.slice(0, 4).map((r) => (
                    <li key={r.scheduleId} className={styles.rowBetween}>
                      <span className={styles.subjectName}>{prettifySkillId(r.skillId)}</span>
                      <span className={styles.muted}>{dueLabel(r.dueAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>

          <section>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recommendations</h2>
              <Link to="/progress/recommendations" className={styles.viewAll}>View all</Link>
            </div>
            <Card>
              {recommendations.length === 0 ? (
                <p className={styles.muted}>No recommendations right now.</p>
              ) : (
                <ul className={styles.plainList}>
                  {recommendations.slice(0, 3).map((r) => (
                    <li key={r.id} className={styles.recItem}>
                      <span className={styles.recKind}>{humanize(r.kind)} · {prettifySkillId(r.targetSkillId)}</span>
                      <span>{r.reason}</span>
                      {r.targetLessonId && (
                        <Link to={`/lessons/${r.targetLessonId}`} className={styles.viewAll}>Open lesson</Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>
        </>
      )}

      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>More</h2>
        </div>
        <div className={styles.linkGrid}>
          <Link to="/achievements" className={styles.linkCard}><Card>Achievements</Card></Link>
          <Link to="/certificates" className={styles.linkCard}><Card>Certificates</Card></Link>
          <Link to="/reports" className={styles.linkCard}><Card>Reports</Card></Link>
        </div>
      </section>
    </div>
  );
}
