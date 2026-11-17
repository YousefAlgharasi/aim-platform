import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { couponApi, type MyCourse } from './couponApi';

/** Under the user's name in the menu: the courses they are enrolled in, with progress. */
export function MyCoursesMenu({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [courses, setCourses] = useState<MyCourse[] | null>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    let alive = true;
    couponApi.myCourses().then((c) => alive && setCourses(c)).catch(() => alive && setCourses((cur) => cur ?? []));
    return () => { alive = false; };
  }, [pathname]);

  const link = (
    <Link to="/welcome#courses" onClick={onNavigate} className="mt-1 block px-1 py-1 text-xs font-semibold text-ink-muted no-underline hover:text-ink">
      {t('Courses & coupons')} →
    </Link>
  );
  if (!courses || courses.length === 0) return <div className="mb-4 -mt-2">{link}</div>;
  return (
    <div className="mb-4 -mt-2">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent px-1 py-1 text-xs font-medium text-ink-muted hover:text-ink">
        <span>{t('My courses')} ({courses.length})</span>
        <span aria-hidden>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <ul className="m-0 mt-1 flex list-none flex-col gap-1 p-0">
          {courses.map((c) => (
            <li key={c.courseId}>
              <Link to={`/curriculum/${c.courseId}`} onClick={onNavigate} className="flex flex-col gap-1 rounded-lg px-2 py-2 text-ink no-underline hover:bg-surface-muted">
                <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                  <span dir="auto" className="truncate">{c.title}</span>
                  <span className="lp-num shrink-0 text-xs text-ink-muted">{c.status === 'completed' ? t('Completed') : `${c.progressPercent}%`}</span>
                </span>
                <span className="h-1.5 overflow-hidden rounded-full bg-ink/10" aria-hidden>
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${c.status === 'completed' ? 100 : c.progressPercent}%` }} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {link}
    </div>
  );
}
