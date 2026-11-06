import { Link } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext';
import type { DailyChallengeSummary } from '../dashboardApi';
import * as ui from './ui';

interface ChallengeWidgetProps {
  challenge: DailyChallengeSummary;
  /** Course the lessons belong to; "Go to lessons" opens it. Falls back to the course list when unknown. */
  courseId?: string | null;
}

/** Today's backend-assigned challenge (GET /student/engagement/summary → challenge). */
export function ChallengeWidget({ challenge, courseId }: ChallengeWidgetProps) {
  const { t } = useI18n();
  const target = Math.max(challenge.targetCount, 1);
  const pct = Math.min(100, Math.round((challenge.progressCount / target) * 100));
  return (
    <section className={ui.panel}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className={ui.cardTitle}>{t('Daily challenge')}</h3>
          <span
            className={challenge.completed ? 'lp-num text-sm font-semibold text-success-ink' : 'lp-num text-sm text-ink-muted'}
          >
            {challenge.completed ? t('Completed') : `${challenge.progressCount}/${challenge.targetCount}`}
          </span>
        </div>
        <span className="text-lg font-semibold leading-snug text-ink [unicode-bidi:plaintext]">{t(challenge.title)}</span>
        <span className="text-sm leading-relaxed text-ink-muted [unicode-bidi:plaintext]">{t(challenge.description)}</span>
        <div
          className={ui.barTrack}
          role="progressbar"
          aria-label={t('Challenge progress')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div className={challenge.completed ? 'h-full rounded-full bg-success' : ui.barFill} style={{ width: `${pct}%` }} />
        </div>
        {!challenge.completed && (
          <div className="flex flex-wrap items-center gap-3">
            <Link to={courseId ? `/curriculum/${courseId}` : '/curriculum'} className={ui.primaryLink}>{t('Go to lessons')}</Link>
          </div>
        )}
      </div>
    </section>
  );
}
