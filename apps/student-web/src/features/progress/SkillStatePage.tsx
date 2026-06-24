import { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import type { ApiError } from '../../types';
import styles from './SkillStatePage.module.css';

interface Skill {
  id: string;
  name: string;
  mastery: number;
  isWeakness: boolean;
  recommendation: string | null;
}

interface SkillData {
  skills: Skill[];
}

export function SkillStatePage() {
  const [data, setData] = useState<SkillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchSkills() {
    setLoading(true);
    setError('');
    apiClient.get<SkillData>('/students/me/skills')
      .then(setData)
      .catch((err: ApiError) => setError(err.message || 'Failed to load skills'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchSkills(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchSkills} />;
  if (!data || data.skills.length === 0) {
    return <EmptyState title="No skills yet" message="Complete lessons to build your skill profile." />;
  }

  const weaknesses = data.skills.filter(s => s.isWeakness);
  const strengths = data.skills.filter(s => !s.isWeakness);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Skills</h1>

      {weaknesses.length > 0 && (
        <section>
          <h2 className={styles.sectionTitle}>Areas to improve</h2>
          <div className={styles.skillList}>
            {weaknesses.map(skill => (
              <Card key={skill.id}>
                <div className={styles.skillItem}>
                  <div className={styles.skillHeader}>
                    <span className={styles.skillName}>{skill.name}</span>
                    <span className={styles.weaknessBadge}>Needs work</span>
                  </div>
                  <div className={styles.masteryBar}>
                    <div
                      className={styles.masteryFillWeak}
                      style={{ width: `${skill.mastery}%` }}
                      role="progressbar"
                      aria-valuenow={skill.mastery}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${skill.name} mastery`}
                    />
                  </div>
                  <span className={styles.masteryLabel}>{skill.mastery}% mastery</span>
                  {skill.recommendation && (
                    <p className={styles.recommendation}>{skill.recommendation}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className={styles.sectionTitle}>All skills</h2>
        <div className={styles.skillList}>
          {strengths.map(skill => (
            <Card key={skill.id}>
              <div className={styles.skillItem}>
                <div className={styles.skillHeader}>
                  <span className={styles.skillName}>{skill.name}</span>
                </div>
                <div className={styles.masteryBar}>
                  <div
                    className={styles.masteryFill}
                    style={{ width: `${skill.mastery}%` }}
                    role="progressbar"
                    aria-valuenow={skill.mastery}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${skill.name} mastery`}
                  />
                </div>
                <span className={styles.masteryLabel}>{skill.mastery}% mastery</span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
