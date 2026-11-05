import { Link } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext';
import { Card } from '../../../components/common/Card';
import { prettifySkillId, toPercent } from '../../progress/aimApi';
import type { WeakSpot } from '../../improve/ImprovePage';
import * as ui from './ui';

interface ImproveWidgetProps {
  /** Null when the request failed. */
  spots: WeakSpot[] | null;
  limit?: number;
}

/** Dashboard teaser for the Improve page: the few skills that need the most work, one tap from practice. */
export function ImproveWidget({ spots, limit = 3 }: ImproveWidgetProps) {
  const { t } = useI18n();
  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className={ui.cardTitle}>{t('Improve your weak spots')}</h3>
          <Link to="/improve" className={ui.link}>{t('View all')}</Link>
        </div>
        {spots === null ? (
          <p className="m-0 text-sm text-ink-muted">{t('Could not load {what}.', { what: t('weak spots') })}</p>
        ) : spots.length === 0 ? (
          <p className="m-0 text-sm leading-relaxed text-ink-muted">{t('No weak spots right now. Keep learning to stay sharp.')}</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {spots.slice(0, limit).map((s) => {
              const pct = s.skill ? toPercent(s.skill.masteryScore) : null;
              return (
                <li key={s.skillId}>
                  <Link
                    to={s.lessonId ? `/practice/lesson/${encodeURIComponent(s.lessonId)}` : '/improve'}
                    className="flex flex-col gap-1.5 rounded-xl bg-surface-sunken p-3 no-underline transition-colors hover:bg-brand-soft"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-bold text-ink [unicode-bidi:plaintext]">{prettifySkillId(s.skillId)}</span>
                      {pct !== null && <span className="text-xs font-bold tabular-nums text-ink-muted">{pct}%</span>}
                    </span>
                    {pct !== null && (
                      <span className="h-1.5 w-full overflow-hidden rounded-full bg-surface-strong" aria-hidden="true">
                        <span className="block h-full rounded-full bg-gradient-to-r from-warning to-danger" style={{ width: `${Math.max(pct, 3)}%` }} />
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Link to="/mistakes?quick=1" className={ui.primaryLink}>{t('5-minute fix session')}</Link>
      </div>
    </Card>
  );
}
