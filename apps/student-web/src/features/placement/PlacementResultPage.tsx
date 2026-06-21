import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './Placement.module.css';

interface PlacementResult {
  level: string;
  score: number;
  summary: string;
  recommendations: Array<{
    id: string;
    title: string;
    type: string;
  }>;
}

export function PlacementResultPage() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchResult() {
    setLoading(true);
    setError('');
    apiClient.get<PlacementResult>(`/api/placement/${id}/result`)
      .then(setResult)
      .catch((err: ApiError) => setError(err.message || 'Failed to load result'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchResult(); }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchResult} />;
  if (!result) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Placement Result</h1>

      <Card>
        <div className={styles.resultContent}>
          <div className={styles.resultLevel}>
            <span className={styles.resultLabel}>Your level</span>
            <span className={styles.resultValue}>{result.level}</span>
          </div>
          <p className={styles.resultSummary}>{result.summary}</p>
        </div>
      </Card>

      {result.recommendations.length > 0 && (
        <section>
          <h2 className={styles.subtitle}>Recommended next steps</h2>
          <div className={styles.recList}>
            {result.recommendations.map(rec => (
              <Card key={rec.id}>
                <Link to={`/lessons/${rec.id}`} className={styles.recLink}>
                  <span className={styles.recType}>{rec.type}</span>
                  <span className={styles.recTitle}>{rec.title}</span>
                </Link>
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
