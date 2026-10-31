import { Link } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext';
import { Card } from '../../../components/common/Card';
import type { DailyChallengeSummary } from '../dashboardApi';
import * as ui from './ui';

interface ChallengeWidgetProps {
  challenge: DailyChallengeSummary;
}

/** Today's backend-assigned challenge (GET /student/engagement/summary → challenge). */
export function ChallengeWidget({ challenge }: ChallengeWidgetProps) {
  const { t } = useI18n();
  const target = Math.max(challenge.targetCount, 1);
  const pct = Math.min(100, Math.round((challenge.progressCount / target) * 100));
  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className={ui.eyebrow}>{t('Daily challenge')}</span>
          <span
            className={
              challenge.completed
                ? 'rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-extrabold text-[#4F46E5] dark:bg-indigo-950/60 dark:text-indigo-400'
            }
          >
            {challenge.completed ? t('Completed') : `${challenge.progressCount}/${challenge.targetCount}`}
          </span>
        </div>
        <span className="text-lg font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white [unicode-bidi:plaintext]">{t(challenge.title)}</span>
        <span className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 [unicode-bidi:plaintext]">{t(challenge.description)}</span>
        <div
          className={ui.barTrack}
          role="progressbar"
          aria-label={t('Challenge progress')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div className={challenge.completed ? 'h-full rounded-full bg-emerald-500' : ui.barFill} style={{ width: `${pct}%` }} />
        </div>
        {!challenge.completed && (
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/curriculum" className={ui.primaryLink}>{t('Go to lessons')}</Link>
          </div>
        )}
      </div>
    </Card>
  );
}
