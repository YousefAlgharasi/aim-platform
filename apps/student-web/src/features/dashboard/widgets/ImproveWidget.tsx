import { Link } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext';
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
    <section className={ui.panel}>
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
          <ul className="m-0 flex list-none flex-col divide-y divide-line border-t border-line p-0">
            {spots.slice(0, limit).map((s) => {
              const pct = s.skill ? toPercent(s.skill.masteryScore) : null;
              return (
                <li key={s.skillId}>
                  <Link
                    to={s.lessonId ? `/practice/lesson/${encodeURIComponent(s.lessonId)}` : '/improve'}
                    className="flex flex-col gap-2 py-3 no-underline transition-colors hover:bg-surface-muted"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-base font-medium text-ink [unicode-bidi:plaintext]">{prettifySkillId(s.skillId)}</span>
                      {pct !== null && <span className="lp-num text-sm text-ink-muted">{pct}%</span>}
                    </span>
                    {pct !== null && (
                      <span className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
                        <span className="block h-full rounded-full bg-brand" style={{ width: `${Math.max(pct, 3)}%` }} />
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Link to="/mistakes?quick=1" className={`${ui.primaryLink} self-start`}>{t("5-minute fix session")}</Link>
      </div>
    </section>
  );
}
