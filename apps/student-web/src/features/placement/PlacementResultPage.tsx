import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import {
  errorCode,
  fetchPlacementResult,
  formatPlacementLevel,
  humanize,
  type PlacementResult,
} from './placementApi';
import styles from './Placement.module.css';

// Same polling policy as Flutter PlacementResultNotifier.
const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 2000;

const SIGNAL_LABELS: Record<string, string> = {
  strong: 'Strong',
  developing: 'Developing',
  emerging: 'Emerging',
};

export function PlacementResultPage() {
  const { id = '' } = useParams<{ id: string }>();
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef<number | null>(null);

  const fetchResult = useCallback((attempt = 1) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    if (attempt === 1) {
      setLoading(true);
      setError('');
    }
    fetchPlacementResult(id)
      .then((r) => {
        setResult(r);
        setPending(false);
        setLoading(false);
      })
      .catch((err) => {
        const code = errorCode(err);
        const notReady = code === 'ATTEMPT_NOT_COMPLETED' || code === 'RESULT_NOT_FOUND' || code === 'ATTEMPT_NOT_SUBMITTED';
        if (notReady && attempt < MAX_POLL_ATTEMPTS) {
          setPending(true);
          setLoading(false);
          timer.current = window.setTimeout(() => fetchResult(attempt + 1), POLL_INTERVAL_MS);
          return;
        }
        setPending(false);
        setLoading(false);
        setError(
          notReady
            ? 'Your result is still being prepared. Please check again in a moment.'
            : getErrorMessage(err, 'Failed to load result'),
        );
      });
  }, [id]);

  useEffect(() => {
    fetchResult(1);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [fetchResult]);

  if (loading) return <LoadingSpinner />;
  if (pending) {
    return (
      <div className={styles.container}>
        <Card>
          <div className={styles.resultContent}>
            <LoadingSpinner />
            <h2 className={styles.subtitle}>Calculating your level…</h2>
            <p className={styles.resultSummary}>This usually takes a few seconds.</p>
          </div>
        </Card>
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={() => fetchResult(1)} />;
  if (!result) return null;

  const level = formatPlacementLevel(result.estimated_level);
  const skills = Object.entries(result.skill_mastery_map ?? {});
  const weaknesses = [...(result.weakness_map?.weaknesses ?? [])].sort((a, b) => a.priority - b.priority);
  const writing = result.additional_signals?.writing ?? null;
  const speaking = result.additional_signals?.speaking ?? null;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Placement Result</h1>

      <Card>
        <div className={styles.resultContent}>
          <div className={styles.resultLevel}>
            <span className={styles.resultLabel}>Your level</span>
            <span className={styles.resultValue}>{level.code ?? level.label}</span>
            {level.code && <span className={styles.resultSummary}>{level.label}</span>}
          </div>
          {result.note && <p className={styles.resultSummary}>{result.note}</p>}
          {result.unlocked_course_ids?.length > 0 && (
            <p className={styles.resultSummary}>
              {result.unlocked_course_ids.length} course{result.unlocked_course_ids.length === 1 ? '' : 's'} unlocked for your level.
            </p>
          )}
        </div>
      </Card>

      {skills.length > 0 && (
        <section>
          <h2 className={styles.subtitle}>Skill summary</h2>
          <div className={styles.recList}>
            {skills.map(([code, value]) => (
              <Card key={code}>
                <div className={styles.skillRow}>
                  <span className={styles.recTitle}>{humanize(code)}</span>
                  <span className={`${styles.signalBadge} ${styles[`signal_${value.signal}`] ?? ''}`}>
                    {SIGNAL_LABELS[value.signal] ?? humanize(value.signal)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {weaknesses.length > 0 && (
        <section>
          <h2 className={styles.subtitle}>Focus areas</h2>
          <div className={styles.recList}>
            {weaknesses.map((w) => (
              <Card key={w.skill_code}>
                <div className={styles.skillRow}>
                  <span className={styles.recTitle}>{humanize(w.skill_code)}</span>
                  <span className={styles.recType}>Priority {w.priority}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {(writing || speaking) && (
        <section>
          <h2 className={styles.subtitle}>Writing &amp; speaking feedback</h2>
          <div className={styles.recList}>
            {writing && (
              <Card>
                <span className={styles.recType}>Writing · {writing.score}/10</span>
                <p className={styles.resultSummary}>{writing.feedback}</p>
              </Card>
            )}
            {speaking && (
              <Card>
                <span className={styles.recType}>Speaking · {speaking.score}/10</span>
                <p className={styles.resultSummary}>{speaking.feedback}</p>
                {speaking.transcript && (
                  <p className={styles.description}>“{speaking.transcript}”</p>
                )}
              </Card>
            )}
          </div>
        </section>
      )}

      <div className={styles.buttonStack}>
        <Link to="/curriculum">
          <Button variant="primary" fullWidth>Browse courses</Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="secondary" fullWidth>Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
