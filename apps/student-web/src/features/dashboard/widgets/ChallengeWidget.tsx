import { Link } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext';
import { CheckIcon } from '../../../components/common/Icons';
import type { DailyChallengeSummary } from '../dashboardApi';
import * as ui from './ui';

interface ChallengeWidgetProps {
  /** Today's challenges (GET /student/engagement/summary → challenges): lessons/streak, speaking and writing practice. */
  challenges: DailyChallengeSummary[];
  /** Course the lessons belong to; "Go to lessons" opens it. Falls back to the course list when unknown. */
  courseId?: string | null;
}

/** Text for a challenge. "Complete N lessons today." follows the student's own goal, so it is translated with its number. */
function textOf(description: string, t: (s: string, p?: Record<string, string | number>) => string): string {
  const m = /^Complete (\d+) lessons today\.$/.exec(description);
  // 1 and 2 lessons have their own translations (singular / dual); the number form is for 3 and up.
  return m && Number(m[1]) >= 3 ? t('Complete {n} lessons today.', { n: Number(m[1]) }) : t(description);
}

/** Where each challenge is done. Anything that is not a practice challenge is done in the lessons. */
function actionFor(key: string, courseId: string | null | undefined, t: (s: string) => string): { to: string; label: string } {
  if (key === 'practice_speaking') return { to: '/practice/speaking', label: t('Start speaking') };
  if (key === 'practice_writing') return { to: '/practice/writing', label: t('Start writing') };
  return { to: courseId ? `/curriculum/${courseId}` : '/curriculum', label: t('Go to lessons') };
}

/** Today's challenges: a short list, each with its own status and the place to do it. */
export function ChallengeWidget({ challenges, courseId }: ChallengeWidgetProps) {
  const { t } = useI18n();
  if (challenges.length === 0) return null;
  const done = challenges.filter((c) => c.completed).length;
  return (
    <section aria-label={t(challenges.length > 1 ? 'Daily challenges' : 'Daily challenge')} className={ui.panel}>
      <div className="flex items-center justify-between gap-2">
        <h3 className={ui.cardTitle}>{t(challenges.length > 1 ? 'Daily challenges' : 'Daily challenge')}</h3>
        <span className={done === challenges.length ? 'lp-num text-sm font-semibold text-success-ink' : 'lp-num text-sm text-ink-muted'}>
          {done}/{challenges.length}
        </span>
      </div>
      <ul className="m-0 mt-3 flex list-none flex-col p-0">
        {challenges.map((c) => {
          const target = Math.max(c.targetCount, 1);
          const action = actionFor(c.key, courseId, t);
          return (
            <li key={c.key} className="flex items-start gap-3 border-t border-line py-4 first:border-t-0 first:pt-1 last:pb-0">
              <span
                aria-hidden="true"
                className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${c.completed ? 'bg-success text-white' : 'ring-2 ring-line-strong'}`}
              >
                {c.completed && <CheckIcon className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                  <span className="text-base font-semibold leading-snug text-ink [unicode-bidi:plaintext]">{t(c.title)}</span>
                  {c.completed ? (
                    <span className="lp-num text-sm font-semibold text-success-ink">{t('Completed')}</span>
                  ) : (
                    <Link to={action.to} className={ui.link}>{action.label}</Link>
                  )}
                </div>
                <span className="mt-0.5 block text-sm leading-relaxed text-ink-muted [unicode-bidi:plaintext]">
                  {textOf(c.description, t)}
                  {target > 1 && !c.completed && <span className="lp-num ms-2 font-semibold text-ink">{c.progressCount}/{c.targetCount}</span>}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
