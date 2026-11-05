import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Banner } from '../../components/common/Banner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { CardGridSkeleton } from '../../components/common/Skeleton';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { useI18n } from '../../i18n/I18nContext';
import {
  isPracticeLocked, practiceTopicsApi, type PracticeKind, type PracticeSessionState, type PracticeTopic,
} from './practiceTopicsApi';

const badge = 'rounded-full bg-brand-soft text-brand-ink text-xs font-bold px-2.5 py-1';

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
  const subtitle = kind === 'speaking'
    ? t('Pick a topic and talk with your AI teacher. Earn XP when you finish.')
    : t('Pick a topic and write a paragraph. Your AI teacher marks it and shows how to improve.');

  return (
    <div className="flex flex-col gap-5 max-w-3xl w-full mx-auto">
      <PageTitleBar title={title} subtitle={subtitle} />

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
        <ul className="m-0 p-0 list-none grid gap-3 sm:grid-cols-2">
          {topics.map((topic) => (
            <li key={topic.id}>
              <button
                type="button"
                onClick={() => open(topic)}
                disabled={startingId !== null}
                className="w-full h-full text-start rounded-2xl bg-surface ring-1 ring-line hover:ring-brand p-4 flex flex-col gap-2 cursor-pointer disabled:opacity-60"
              >
                <span className="text-base font-extrabold text-ink">{topic.title}</span>
                {topic.description && <span className="text-sm text-ink-muted leading-relaxed">{topic.description}</span>}
                <span className="flex flex-wrap gap-2 mt-auto pt-1">
                  {topic.levelCode && <span className={badge}>{topic.levelCode}</span>}
                  <span className={badge}>{t('+{xp} XP', { xp: topic.xpReward })}</span>
                  {topic.timeLimitSeconds && <span className={badge}>{t('{min} min', { min: Math.round(topic.timeLimitSeconds / 60) })}</span>}
                  {topic.minWords && <span className={badge}>{t('{n} words+', { n: topic.minWords })}</span>}
                  {startingId === topic.id && <span className={badge}>{t('Starting…')}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
