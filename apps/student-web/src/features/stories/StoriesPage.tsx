import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { getErrorMessage } from '../../api/client';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { ListSkeleton } from '../../components/common/Skeleton';
import { storiesApi, resumeLabelKey, storyPercent, type StorySummary } from './storiesApi';
import { Cast } from './StoryScene';

/** One story per course, in course order: bigger and harder as you move up. */
export function StoriesPage() {
  const { t, locale } = useI18n();
  const [stories, setStories] = useState<StorySummary[] | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    setError(''); setStories(null);
    storiesApi.list().then((r) => setStories(r.stories)).catch((e) => setError(getErrorMessage(e, t('Could not load the stories'))));
  };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!stories) return <ListSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      <PageTitleBar title={t('Stories')} />
      <p className="m-0 text-base text-ink-muted">{t('Read a story with Sarah, Adam, Yasmin and Tariq, and answer questions as you go. Each course has its own story, and they get longer and harder as you move up.')}</p>
      {stories.length === 0 ? (
        <EmptyState title={t('No stories yet')} message={t('New stories are on the way. Check back soon.')} />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {stories.map((s) => {
            const pct = storyPercent(s);
            const title = (locale === 'ar' && s.titleAr) || s.title;
            const summary = (locale === 'ar' && s.summaryAr) || s.summary;
            const body = (
              <>
                <span className="flex items-start justify-between gap-3">
                  <Cast />
                  <span className="flex flex-wrap justify-end gap-1.5">
                    <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-ink">{s.cefrCode ?? s.courseTitle}</span>
                    {s.completed && <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-bold text-success-ink">✓ {t('Finished')}</span>}
                  </span>
                </span>
                <span className="block text-xl font-semibold tracking-tight text-ink [unicode-bidi:plaintext]">{title}</span>
                <span className="block text-sm leading-relaxed text-ink-muted [unicode-bidi:plaintext]">{summary}</span>
                <span className="text-xs font-semibold text-ink-muted">
                  {t('{n} scenes', { n: s.scenes })} · {t('{n} min', { n: s.minutes })} · {t('{n} questions', { n: s.questions })}
                </span>
                {!s.locked && s.answered > 0 && (
                  <span className="h-2 w-full overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={t('Story progress')}>
                    <span className="block h-full rounded-full bg-brand" style={{ width: `${Math.max(pct, 3)}%` }} />
                  </span>
                )}
                <span className="text-sm font-bold text-brand-ink">
                  {s.locked ? `🔒 ${t('Unlocks when you reach {course}', { course: s.courseTitle })}` : t(resumeLabelKey(s))}
                </span>
              </>
            );
            const cls = 'flex h-full flex-col gap-3 rounded-2xl bg-surface p-5 no-underline ring-1 ring-line';
            return s.locked ? (
              <div key={s.storyId} className={`${cls} opacity-70`} aria-disabled="true">{body}</div>
            ) : (
              <Link key={s.storyId} to={`/stories/${s.storyId}`} className={`${cls} transition-colors hover:bg-surface-muted hover:ring-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus`}>{body}</Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
