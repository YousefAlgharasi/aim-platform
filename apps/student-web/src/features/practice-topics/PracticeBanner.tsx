import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { useI18n } from '../../i18n/I18nContext';
import { reportLearningCompleted } from '../../interaction';
import { practiceTopicsApi, type PracticeSessionState } from './practiceTopicsApi';

function mmss(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Shown above the voice conversation when it was opened from Practice Speaking: timer + finish for XP. */
export function PracticeBanner({ practice }: { practice: PracticeSessionState }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');
  const [xp, setXp] = useState<number | null>(null);
  const finished = useRef(false);

  const limit = practice.timeLimitSeconds;
  const left = limit ? Math.max(0, limit - elapsed) : null;

  useEffect(() => {
    if (xp !== null) return undefined;
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [xp]);

  async function finish() {
    if (finishing || finished.current) return;
    setFinishing(true);
    setError('');
    try {
      const done = await practiceTopicsApi.completeSpeaking(practice.attemptId);
      finished.current = true;
      setXp(done.xpAwarded);
      void reportLearningCompleted();
    } catch (err) {
      setError(getErrorMessage(err, t('Could not finish. Please try again.')));
    } finally {
      setFinishing(false);
    }
  }

  if (xp !== null) {
    return (
      <Banner variant="success">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span><strong>{t('Well done!')}</strong> {t('+{xp} XP', { xp })}</span>
          <Button size="sm" onClick={() => navigate('/practice/speaking')}>{t('More topics')}</Button>
        </div>
      </Banner>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line">
      <div className="flex-1 min-w-0">
        <p className="m-0 truncate text-base font-semibold text-ink">{practice.title}</p>
        <p className="m-0 text-sm text-ink-muted">{t('Finish to earn +{xp} XP', { xp: practice.xpReward })}</p>
      </div>
      {left !== null && <span className="lp-num rounded-full px-3 py-1 text-sm font-semibold text-ink ring-1 ring-line-strong" aria-live="off">{left > 0 ? mmss(left) : t("Time's up")}</span>}
      <Button size="sm" onClick={finish} loading={finishing}>{finishing ? t('Finishing…') : t('Finish')}</Button>
      {error && <div className="w-full"><Banner variant="error">{error}</Banner></div>}
    </div>
  );
}
