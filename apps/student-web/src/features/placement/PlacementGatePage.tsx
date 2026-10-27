import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getErrorMessage } from '../../api/client';
import { fetchPlacementGate, setPlacementDecision, type PlacementDecision } from './placementApi';
import { useI18n } from '../../i18n/I18nContext';
import { ChoiceRow, PageHeader } from './ui';

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
      setError(getErrorMessage(err, t('Could not save your choice. Please try again.')));
      setSaving(false);
    }
  }

  if (checking) return <LoadingSpinner />;

  const choices: Array<{ value: PlacementDecision; title: string; body: string }> = [
    {
      value: 'take_placement',
      title: t('Take the placement test'),
      body: t('Answer a short test so we can find your level and start you in the right place.'),
    },
    {
      value: 'start_from_scratch',
      title: t('Start from scratch'),
      body: t('Skip the test and begin with the first level. You can take the placement test later.'),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-xl flex flex-col gap-5">
      <PageHeader
        eyebrow={t('Get started')}
        title={t('How would you like to start?')}
        subtitle={t('Choose how you want to begin learning. This choice is only asked once.')}
      />

      {error && <Banner variant="error">{error}</Banner>}

      <fieldset className="m-0 p-0 border-0 min-w-0 flex flex-col gap-3" disabled={saving}>
        <legend className="sr-only">{t('Choose how to start')}</legend>
        {choices.map((choice) => {
          const recommended = choice.value === 'take_placement';
          return (
            <div key={choice.value} className={`relative ${recommended ? 'mt-3' : ''}`}>
              {recommended && (
                <span className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 z-10 flex items-center gap-1 px-3 py-0.5 rounded-full bg-indigo-600 shadow-[0_2px_8px_rgba(79,70,229,0.45)] text-[11px] font-bold tracking-widest text-white uppercase">
                  {t('Recommended')}
                </span>
              )}
              <ChoiceRow
                large
                name="placement-decision"
                value={choice.value}
                selected={selected === choice.value}
                onChange={() => setSelected(choice.value)}
                icon={recommended ? <TargetIcon /> : <FlagIcon />}
                subtitle={choice.body}
              >
                {choice.title}
              </ChoiceRow>
            </div>
          );
        })}
      </fieldset>

      <Button size="lg" onClick={handleContinue} disabled={saving} fullWidth>
        {saving ? t('Saving…') : t('Continue')}
      </Button>
    </div>
  );
}
