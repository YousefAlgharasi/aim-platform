import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { DetailSkeleton } from '../../components/common/Skeleton';
import { getErrorMessage } from '../../api/client';
import { fetchPlacementGate, setPlacementDecision, type PlacementDecision } from './placementApi';
import { useI18n } from '../../i18n/I18nContext';
import { PageHeader } from './ui';

function FlagIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 3h12l-3 4.5L16 12H4" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="4" y1="3" x2="4" y2="21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="5.5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity="0.65" stroke="currentColor" strokeWidth="1.3" />
      <path d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

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
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
      <PageHeader
        title={t('Let’s find your level')}
        subtitle={t('A short test places you at the right level, so you never repeat what you already know.')}
      />

      {error && <Banner variant="error">{error}</Banner>}

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {[
          { icon: <TargetIcon />, title: t('Matched to you'), body: t('Your lessons, courses and practice all follow your level.') },
          { icon: <FlagIcon />, title: t('Skip what you know'), body: t('Levels you already passed are marked as passed, not repeated.') },
        ].map((r) => (
          <li key={r.title} className="flex items-center gap-4 rounded-[20px] bg-surface p-4 shadow-card ring-1 ring-line">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-ink">{r.icon}</span>
            <span className="min-w-0">
              <span className="block text-[15px] font-bold text-ink">{r.title}</span>
              <span className="block text-xs leading-relaxed text-ink-muted">{r.body}</span>
            </span>
          </li>
        ))}
      </ul>

      <Button size="lg" onClick={handleContinue} disabled={saving} fullWidth>
        {saving ? t('Saving…') : t('Take the placement test')}
      </Button>
    </div>
  );
}
