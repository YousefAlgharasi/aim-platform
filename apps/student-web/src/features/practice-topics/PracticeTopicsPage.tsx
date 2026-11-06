import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Banner } from '../../components/common/Banner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { CardGridSkeleton } from '../../components/common/Skeleton';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { useI18n } from '../../i18n/I18nContext';
import { MicIcon, PencilIcon } from '../../components/common/Icons';
import { RelationChip } from '../level/LevelBadge';
import { useLearnerLevel } from '../level/LevelContext';
import { bandIndex, bandOf, relationTo } from '../level/bands';
import {
  isPracticeLocked, practiceTopicsApi, type PracticeKind, type PracticeSessionState, type PracticeTopic,
} from './practiceTopicsApi';

const badge = 'rounded-full text-ink text-sm font-medium px-3 py-1 ring-1 ring-line-strong';

/** /practice/speaking and /practice/writing: pick a topic. Everything is gated by the backend. */
export function PracticeTopicsPage({ kind }: { kind: PracticeKind }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<PracticeTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [startError, setStartError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    setLocked(false);
    practiceTopicsApi
      .list(kind)
      .then(setTopics)
      .catch((err) => (isPracticeLocked(err) ? setLocked(true) : setError(getErrorMessage(err, t('Failed to load topics')))))
      .finally(() => setLoading(false));
  }, [kind, t]);

  useEffect(() => { load(); }, [load]);

  async function open(topic: PracticeTopic) {
    if (kind === 'writing') {
      navigate(`/practice/writing/${topic.id}`);
      return;
    }
    setStartingId(topic.id);
    setStartError('');
    try {
      const started = await practiceTopicsApi.startSpeaking(topic.id);
      const practice: PracticeSessionState = {
        attemptId: started.attemptId, title: topic.title, xpReward: topic.xpReward, timeLimitSeconds: topic.timeLimitSeconds,
      };
      navigate(`/voice-teacher/${started.sessionId}`, { state: { practice, lessonTitle: topic.title } });
    } catch (err) {
      if (isPracticeLocked(err)) setLocked(true);
      else setStartError(getErrorMessage(err, t('Could not start this topic. Please try again.')));
    } finally {
      setStartingId(null);
    }
  }

  const title = kind === 'speaking' ? t('Practice Speaking') : t('Write a Paragraph');


  const { band } = useLearnerLevel();
  // Topics at the student's level first, then the next levels up, then the ones they have outgrown.
  const ordered = [...topics].sort((x, y) => {
    const rank = (tp: PracticeTopic) => {
      const r = relationTo(bandOf(tp.levelCode), band);
      return r === 'current' ? 0 : r === 'ahead' ? 1 + Math.max(0, bandIndex(bandOf(tp.levelCode)) - bandIndex(band)) / 10 : r === 'unknown' ? 1.5 : 3;
    };
    return rank(x) - rank(y);
  });
  const ModeIcon = kind === 'speaking' ? MicIcon : PencilIcon;

  return (
    <div className="flex w-full flex-col gap-6">
      <PageTitleBar title={title} fallback="/practice" />

      {loading && <CardGridSkeleton cards={6} bare />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && locked && (
        <EmptyState
          title={t('Start a course to unlock this')}
          message={t('Practice Speaking and Write a Paragraph are part of your course. Start a course to use them.')}
          actionLabel={t('Choose a course')}
          onAction={() => navigate('/curriculum')}
        />
      )}
      {!loading && !error && !locked && topics.length === 0 && (
        <EmptyState title={t('No topics yet')} message={t('New topics will appear here soon.')} />
      )}
      {startError && <Banner variant="error">{startError}</Banner>}

      {!loading && !error && !locked && topics.length > 0 && (
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
          {ordered.map((topic) => {
            const rel = relationTo(bandOf(topic.levelCode), band);
            return (
              <li key={topic.id}>
                <button
                  type="button"
                  onClick={() => open(topic)}
                  disabled={startingId !== null}
                  className="group flex h-full w-full cursor-pointer flex-col gap-3 rounded-2xl border-0 bg-surface p-5 text-start ring-1 ring-line transition-colors duration-200 hover:bg-surface-muted hover:ring-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60 motion-reduce:transition-none"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="grid size-11 place-items-center rounded-full bg-surface-strong text-ink" aria-hidden="true"><ModeIcon className="size-5" /></span>
                    {rel !== 'unknown' && <RelationChip relation={rel} band={bandOf(topic.levelCode)} />}
                  </span>
                  <span className="text-xl font-semibold leading-snug tracking-tight text-ink [unicode-bidi:plaintext]">{topic.title}</span>
                  {topic.description && <span className="text-base leading-relaxed text-ink-muted [unicode-bidi:plaintext]">{topic.description}</span>}
                  <span className="mt-auto flex flex-wrap gap-2 pt-1">
                    {rel === 'unknown' && topic.levelCode && <span className={badge}>{topic.levelCode}</span>}
                    <span className={badge}>{t('+{xp} XP', { xp: topic.xpReward })}</span>
                    {topic.timeLimitSeconds && <span className={badge}>{t('{min} min', { min: Math.round(topic.timeLimitSeconds / 60) })}</span>}
                    {topic.minWords && <span className={badge}>{t('{n} words+', { n: topic.minWords })}</span>}
                    {startingId === topic.id && <span className={badge}>{t('Starting…')}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
