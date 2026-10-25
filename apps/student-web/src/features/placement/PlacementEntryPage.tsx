import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  completePlacementAttempt,
  errorCode,
  fetchActivePlacementTest,
  fetchLatestPlacementStatus,
  fetchPlacementSections,
  formatPlacementLevel,
  loadPlacementProgress,
  savePlacementProgress,
  startPlacementAttempt,
  type PlacementLatestStatus,
  type PlacementSection,
  type PlacementTest,
} from './placementApi';
import styles from './Placement.module.css';

/**
 * Placement menu + intro (Flutter PlacementMenuPage / PlacementIntroPage / PlacementStartPage).
 * GET /placement/attempts/latest decides between: not taken, in progress, scoring, completed.
 */
export function PlacementEntryPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<PlacementLatestStatus | null>(null);
  const [test, setTest] = useState<PlacementTest | null>(null);
  const [sections, setSections] = useState<PlacementSection[]>([]);
  const [noActiveTest, setNoActiveTest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setActionError('');
    try {
      const latest = await fetchLatestPlacementStatus();
      setStatus(latest);
      const [testRes, sectionsRes] = await Promise.allSettled([
        fetchActivePlacementTest(),
        fetchPlacementSections(),
      ]);
      if (testRes.status === 'fulfilled') {
        setTest(testRes.value);
        setNoActiveTest(false);
      } else if (errorCode(testRes.reason) === 'NO_ACTIVE_TEST' || (testRes.reason as { statusCode?: number })?.statusCode === 404) {
        setTest(null);
        setNoActiveTest(true);
      } else {
        throw testRes.reason;
      }
      setSections(sectionsRes.status === 'fulfilled' ? sectionsRes.value : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load placement test'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleStart() {
    setConfirmRestart(false);
    setBusy(true);
    setActionError('');
    try {
      const attempt = await startPlacementAttempt();
      savePlacementProgress(attempt.id, {
        expiresAt: attempt.expires_at ?? null,
        sectionIndex: 0,
        questionIndex: 0,
        answered: 0,
        skipped: 0,
      });
      navigate(`/placement/${attempt.id}`, { state: { expiresAt: attempt.expires_at } });
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to start the placement test'));
      setBusy(false);
    }
  }

  async function handleFinishSubmitted(attemptId: string) {
    setBusy(true);
    setActionError('');
    try {
      await completePlacementAttempt(attemptId);
    } catch (err) {
      const code = errorCode(err);
      if (code !== 'ATTEMPT_ALREADY_SUBMITTED' && code !== 'ATTEMPT_NOT_ACTIVE') {
        setActionError(getErrorMessage(err, 'Failed to finish the placement test'));
        setBusy(false);
        return;
      }
    }
    navigate(`/placement/${attemptId}/result`);
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!status) return null;

  const totalQuestions = sections.reduce((sum, s) => sum + (s.total_questions ?? 0), 0);

  const testInfo = test && (
    <div className={styles.entryContent}>
      <p className={styles.description}>
        {test.title} — {test.total_sections} section{test.total_sections === 1 ? '' : 's'}
        {totalQuestions > 0 ? `, ${totalQuestions} questions` : ''}, about {test.estimated_minutes} minutes.
      </p>
      {sections.length > 0 && (
        <ol className={styles.sectionList}>
          {sections.map((s) => (
            <li key={s.id} className={styles.sectionItem}>
              <span>{s.title}</span>
              <span className={styles.sectionMeta}>{s.total_questions} questions</span>
            </li>
          ))}
        </ol>
      )}
      <p className={styles.description}>
        The test is timed once you start. You can skip questions you don't know — your level is
        calculated by AIM after you finish.
      </p>
    </div>
  );

  // ---- Completed: compact result + retake -----------------------------------
  if (status.status === 'completed' && status.result && status.attemptId) {
    const level = formatPlacementLevel(status.result.estimated_level);
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>Placement Test</h1>
        {actionError && <Banner variant="error">{actionError}</Banner>}
        <Card>
          <div className={styles.resultContent}>
            <div className={styles.resultLevel}>
              <span className={styles.resultLabel}>Your placement level</span>
              <span className={styles.resultValue}>{level.code ?? level.label}</span>
              {level.code && <span className={styles.resultSummary}>{level.label}</span>}
            </div>
            <Link to={`/placement/${status.attemptId}/result`}>
              <Button variant="secondary" fullWidth>View full result</Button>
            </Link>
          </div>
        </Card>
        {test && (
          <Button variant="ghost" onClick={() => setConfirmRestart(true)} disabled={busy} fullWidth>
            {busy ? 'Starting…' : 'Retake placement test'}
          </Button>
        )}
        <Modal open={confirmRestart} onClose={() => setConfirmRestart(false)} title="Retake placement test?">
          <div className={styles.entryContent}>
            <p className={styles.description}>
              A new attempt will start now. Your new result will replace your current placement level.
            </p>
            <Button onClick={handleStart} disabled={busy} fullWidth>Retake test</Button>
            <Button variant="secondary" onClick={() => setConfirmRestart(false)} fullWidth>Cancel</Button>
          </div>
        </Modal>
      </div>
    );
  }

  // ---- Submitted: scoring pending -------------------------------------------
  if (status.status === 'submitted' && status.attemptId) {
    const attemptId = status.attemptId;
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>Placement Test</h1>
        {actionError && <Banner variant="error">{actionError}</Banner>}
        <Card>
          <div className={styles.entryContent}>
            <h2 className={styles.subtitle}>Your test has been submitted</h2>
            <p className={styles.description}>
              Your answers are in. Finish scoring to see your placement level.
            </p>
            <Button onClick={() => handleFinishSubmitted(attemptId)} disabled={busy}>
              {busy ? 'Finishing…' : 'See my result'}
            </Button>
            <Button variant="secondary" onClick={load} disabled={busy}>Check again</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (noActiveTest) {
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>Placement Test</h1>
        <EmptyState
          title="No placement test available"
          message="There is no placement test published right now. Please check back later."
          actionLabel="Go to dashboard"
          onAction={() => navigate('/dashboard')}
        />
      </div>
    );
  }

  // ---- Active: resume or start over -----------------------------------------
  if (status.status === 'active' && status.attemptId) {
    const attemptId = status.attemptId;
    const progress = loadPlacementProgress(attemptId);
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>Placement Test</h1>
        {actionError && <Banner variant="error">{actionError}</Banner>}
        <Card>
          <div className={styles.entryContent}>
            <h2 className={styles.subtitle}>You have a test in progress</h2>
            <p className={styles.description}>
              Continue where you left off, or start a new attempt. Starting over discards the current attempt.
            </p>
            <Button
              onClick={() => navigate(`/placement/${attemptId}`, { state: { expiresAt: progress?.expiresAt ?? null } })}
              disabled={busy}
            >
              Continue test
            </Button>
            <Button variant="secondary" onClick={() => setConfirmRestart(true)} disabled={busy}>
              {busy ? 'Starting…' : 'Start over'}
            </Button>
          </div>
        </Card>
        <Modal open={confirmRestart} onClose={() => setConfirmRestart(false)} title="Start over?">
          <div className={styles.entryContent}>
            <p className={styles.description}>Your current attempt will be discarded and a new timed attempt will begin.</p>
            <Button onClick={handleStart} disabled={busy} fullWidth>Start new attempt</Button>
            <Button variant="secondary" onClick={() => setConfirmRestart(false)} fullWidth>Cancel</Button>
          </div>
        </Modal>
      </div>
    );
  }

  // ---- Not taken -------------------------------------------------------------
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Placement Test</h1>
      {actionError && <Banner variant="error">{actionError}</Banner>}
      <Card>
        <div className={styles.entryContent}>
          <h2 className={styles.subtitle}>Ready to begin?</h2>
          {testInfo}
          <Button onClick={handleStart} disabled={busy || !test}>
            {busy ? 'Starting…' : 'Start placement test'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
