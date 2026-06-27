import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './Placement.module.css';

interface ActivePlacementTest {
  id: string;
  title: string;
  status: 'published';
  total_sections: number;
  estimated_minutes: number;
}

interface PlacementAttemptStartResponse {
  id: string;
  placement_test_id: string;
  status: 'active';
  started_at: string;
  submitted_at: null;
  completed_at: null;
}

export function PlacementEntryPage() {
  const [test, setTest] = useState<ActivePlacementTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function fetchActiveTest() {
    setLoading(true);
    setError('');
    apiClient.get<ActivePlacementTest>('/placement/active')
      .then(setTest)
      .catch((err: ApiError) => setError(err.message || 'Failed to load placement test'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchActiveTest(); }, []);

  async function handleStart() {
    setStarting(true);
    setError('');
    try {
      const attempt = await apiClient.post<PlacementAttemptStartResponse>('/placement/attempts', {});
      navigate(`/placement/${attempt.id}`);
    } catch (err) {
      setError((err as ApiError).message || 'Failed to start placement');
    } finally {
      setStarting(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchActiveTest} />;
  if (!test) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Placement Test</h1>

      <Card>
        <div className={styles.entryContent}>
          <h2 className={styles.subtitle}>Ready to begin?</h2>
          <p className={styles.description}>
            {test.title} — {test.total_sections} sections, approximately {test.estimated_minutes} minutes.
            Answer the questions to the best of your ability — the backend will evaluate your responses.
          </p>
          <Button onClick={handleStart} disabled={starting}>
            {starting ? 'Starting...' : 'Start placement test'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
