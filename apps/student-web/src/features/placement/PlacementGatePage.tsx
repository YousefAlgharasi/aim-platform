import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { DetailSkeleton } from '../../components/common/Skeleton';
import { getErrorMessage } from '../../api/client';
import { fetchPlacementGate, setPlacementDecision, type PlacementDecision } from './placementApi';
import { useI18n } from '../../i18n/I18nContext';
import { ED_BTN, ED_SHELL, EdHeader, edRow } from './ed';

/**
 * First-login placement gate (Flutter PlacementGatePage).
 * GET /placement/decision decides whether to show it; POST /placement/decision
 * records the one-time choice so the gate is never shown again.
 */
export function PlacementGatePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
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
      const result = await setPlacementDecision('take_placement');
      goAfterDecision(result?.decision ?? 'take_placement');
    } catch (err) {
      setError(getErrorMessage(err, t('Could not save your choice. Please try again.')));
      setSaving(false);
    }
  }

  if (checking) return <DetailSkeleton />;

  return (
    <div className={ED_SHELL}>
      <EdHeader
        title={t('Let’s find your level')}
        subtitle={t('A short test places you at the right level, so you never repeat what you already know.')}
      />

      {error && <Banner variant="error">{error}</Banner>}

      <dl className="m-0 border-y border-line">
        {[
          [t('Matched to you'), t('Your lessons, courses and practice all follow your level.')],
          [t('Skip what you know'), t('Levels you already passed are marked as passed, not repeated.')],
        ].map(([title, body], i) => (
          <div key={i} className={`py-4 ${edRow(i)}`}>
            <dt className="text-lg font-semibold text-ink">{title}</dt>
            <dd className="m-0 mt-0.5 text-[15px] leading-relaxed text-ink-muted">{body}</dd>
          </div>
        ))}
      </dl>

      <Button size="lg" className={ED_BTN} onClick={handleContinue} disabled={saving} fullWidth>
        {saving ? t('Saving…') : t('Take the placement test')}
      </Button>
    </div>
  );
}
