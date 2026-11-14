import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { Cast } from './StoryScene';
import { nextPartToRead, storyPartPath, type CourseStory } from './storiesApi';

/** The course's story on the course page: how many parts are read, and the next one to open. */
export function CourseStoryCard({ story }: { story: CourseStory }) {
  const { t, locale } = useI18n();
  const title = (locale === 'ar' && story.titleAr) || story.title;
  const total = story.parts.length;
  const next = nextPartToRead(story.parts);
  const allDone = total > 0 && story.partsRead >= total;
  const cta = next
    ? story.partsRead === 0 && next.index === 0 ? t('Start the story') : t('Read part {n}', { n: next.index + 1 })
    : allDone ? t('Read again') : null;
  const target = next ?? (allDone ? story.parts[0] : null);
  return (
    <section aria-label={t('Course story')} className="flex max-w-md flex-col gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line">
      <div className="flex items-center gap-3">
        <Cast />
        <div className="min-w-0 flex-1">
          <p className="m-0 text-xs font-bold text-brand-ink">{t('Course story')}</p>
          <p className="m-0 truncate text-base font-semibold text-ink [unicode-bidi:plaintext]">{title}</p>
        </div>
      </div>
      <p className="m-0 text-sm text-ink-muted">
        {t('{done} of {total} parts read', { done: story.partsRead, total })}
        {!next && !allDone ? ` · ${t('Finish a chapter to unlock the next part')}` : ''}
      </p>
      {target && cta && (
        <Link to={storyPartPath(story.storyId, target.index)} className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-bold text-white no-underline transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          {cta}
        </Link>
      )}
    </section>
  );
}
