import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Banner } from '../../components/common/Banner';
import type { ApiError } from '../../types';
import styles from './Placement.module.css';

interface PlacementStatus {
  status: 'not_started' | 'in_progress' | 'completed';
  sessionId?: string;
}

export function PlacementEntryPage() {
  const [status, setStatus] = useState<PlacementStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function fetchStatus() {
    setLoading(true);
    setError('');
    apiClient.get<PlacementStatus>('/placement/status')
      .then(setStatus)
      .catch((err: ApiError) => setError(err.message || 'Failed to load placement status'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchStatus(); }, []);

  async function handleStart() {
    setStarting(true);
    setError('');
    try {
      const { sessionId } = await apiClient.post<{ sessionId: string }>('/placement/start', {});
      navigate(`/placement/${sessionId}`);
    } catch (err) {
      setError((err as ApiError).message || 'Failed to start placement');
    } finally {
      setStarting(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchStatus} />;
  if (!status) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Placement Test</h1>

      {status.status === 'completed' && (
        <Banner variant="success">
          You have already completed the placement test.
        </Banner>
      )}

      {status.status === 'in_progress' && status.sessionId && (
        <Card>
          <div className={styles.entryContent}>
            <h2 className={styles.subtitle}>Resume your test</h2>
            <p className={styles.description}>You have an in-progress placement test.</p>
            <Button onClick={() => navigate(`/placement/${status.sessionId}`)}>
              Resume
            </Button>
          </div>
        </Card>
      )}

      {status.status === 'not_started' && (
        <Card>
          <div className={styles.entryContent}>
            <h2 className={styles.subtitle}>Ready to begin?</h2>
            <p className={styles.description}>
              The placement test helps us understand your current level so we can personalize your learning path.
              Answer the questions to the best of your ability — the backend will evaluate your responses.
            </p>
            <Button onClick={handleStart} disabled={starting}>
              {starting ? 'Starting...' : 'Start placement test'}
            </Button>
          </div>
        </Card>
      )}

      {status.status === 'completed' && status.sessionId && (
        <Button variant="secondary" onClick={() => navigate(`/placement/${status.sessionId}/result`)}>
          View result
        </Button>
      )}
    </div>
  );
}
