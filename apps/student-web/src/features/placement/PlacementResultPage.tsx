import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './Placement.module.css';

interface SkillSignal {
  skill_code: string;
  signal: string;
}

interface PlacementResult {
  id: string;
  placement_attempt_id: string;
  estimated_level: string;
  skill_mastery_map: Record<string, { signal: string }>;
  weakness_map: {
    weaknesses: Array<{ skill_code: string; signal: string }>;
  };
  initial_path_id: string | null;
  created_at: string;
}

export function PlacementResultPage() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchResult() {
    setLoading(true);
    setError('');
    apiClient.get<PlacementResult>(`/placement/attempts/${id}/result`)
      .then(setResult)
      .catch((err: ApiError) => setError(err.message || 'Failed to load result'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchResult(); }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchResult} />;
  if (!result) return null;

  const skillSignals: SkillSignal[] = Object.entries(result.skill_mastery_map).map(
    ([skill_code, value]) => ({ skill_code, signal: value.signal }),
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Placement Result</h1>

      <Card>
        <div className={styles.resultContent}>
          <div className={styles.resultLevel}>
            <span className={styles.resultLabel}>Your level</span>
            <span className={styles.resultValue}>{result.estimated_level}</span>
          </div>
        </div>
      </Card>

      {skillSignals.length > 0 && (
        <section>
          <h2 className={styles.subtitle}>Skill summary</h2>
          <div className={styles.recList}>
            {skillSignals.map(skill => (
              <Card key={skill.skill_code}>
                <span className={styles.recType}>{skill.skill_code}</span>
                <span className={styles.recTitle}>{skill.signal}</span>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Link to="/dashboard">
        <Button variant="primary" fullWidth>Go to Dashboard</Button>
      </Link>
    </div>
  );
}
