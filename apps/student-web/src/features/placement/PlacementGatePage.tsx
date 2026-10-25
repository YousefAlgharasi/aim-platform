import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getErrorMessage } from '../../api/client';
import { fetchPlacementGate, setPlacementDecision, type PlacementDecision } from './placementApi';
import styles from './Placement.module.css';

/**
 * First-login placement gate (Flutter PlacementGatePage).
 * GET /placement/decision decides whether to show it; POST /placement/decision
 * records the one-time choice so the gate is never shown again.
 */
export function PlacementGatePage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [selected, setSelected] = useState<PlacementDecision>('take_placement');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const goAfterDecision = useCallback(
    (decision: PlacementDecision) => {
      navigate(decision === 'take_placement' ? '/placement' : '/dashboard', { replace: true });
    },
    [navigate],
  );

  useEffect(() => {
    let cancelled = false;
    fetchPlacementGate()
      .then((gate) => {
        if (cancelled) return;
        if (!gate?.should_show_gate) {
          navigate('/dashboard', { replace: true });
          return;
        }
        setChecking(false);
      })
      .catch(() => {
        // Same as Flutter: if the check fails, show the gate rather than block the student.
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleContinue() {
    setSaving(true);
    setError('');
    try {
      const result = await setPlacementDecision(selected);
      goAfterDecision(result?.decision ?? selected);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save your choice. Please try again.'));
      setSaving(false);
    }
  }

  if (checking) return <LoadingSpinner />;

  const choices: Array<{ value: PlacementDecision; title: string; body: string }> = [
    {
      value: 'take_placement',
      title: 'Take the placement test',
      body: 'Answer a short test so we can find your level and start you in the right place.',
    },
    {
      value: 'start_from_scratch',
      title: 'Start from scratch',
      body: 'Skip the test and begin with the first level. You can take the placement test later.',
    },
  ];

  return (
    <div className={styles.container}>
      <div>
        <h1 className={styles.heading}>How would you like to start?</h1>
        <p className={styles.description}>Choose how you want to begin learning. This choice is only asked once.</p>
      </div>

      {error && <Banner variant="error">{error}</Banner>}

      <Card>
        <fieldset className={styles.options} disabled={saving}>
          <legend className={styles.srOnly}>Choose how to start</legend>
          {choices.map((choice) => (
            <label
              key={choice.value}
              className={`${styles.option} ${selected === choice.value ? styles.optionSelected : ''}`}
            >
              <input
                type="radio"
                name="placement-decision"
                value={choice.value}
                checked={selected === choice.value}
                onChange={() => setSelected(choice.value)}
                className={styles.srOnly}
              />
              <span className={styles.optionRadio} />
              <span className={styles.choiceText}>
                <span className={styles.choiceTitle}>{choice.title}</span>
                <span className={styles.choiceBody}>{choice.body}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </Card>

      <Button onClick={handleContinue} disabled={saving} fullWidth>
        {saving ? 'Saving…' : 'Continue'}
      </Button>
    </div>
  );
}
