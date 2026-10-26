import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { aiTeacherApi, relativeTime, sessionLabel, type ChatSessionListItem } from './aiTeacherApi';
import type { AIChatLocationState } from './AITeacherEntryPage';
import { MicIcon, SparkleIcon } from '../../components/common/Icons';
import { BackLink, pillLinkClass } from './ui';
import { useI18n } from '../../i18n/I18nContext';

/**
 * /ai-teacher/history — the student's active AI Teacher conversations
 * (GET /ai-teacher/sessions). Text and voice turns share one session, so each
 * conversation can be reopened in chat or in Voice Teacher.
 */
export function AIHistoryPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(() => {
    setLoading(true);
    setError('');
    aiTeacherApi
      .listSessions()
      .then((res) => setSessions(res.sessions ?? []))
      .catch((err) => setError(getErrorMessage(err, t('Failed to load history'))))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchHistory} />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackLink to="/ai-teacher" label={t('Back to AI Teacher')} />
        <div className="flex-1 min-w-0">
          <span className="text-indigo-600 dark:text-indigo-400 text-xs font-extrabold uppercase tracking-wider">{t('AI Teacher')}</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">{t('Conversation History')}</h1>
        </div>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          title={t('No conversations yet')}
          message={t('Start a conversation with your AI Teacher to see it here.')}
          actionLabel={t('Go to AI Teacher')}
          onAction={() => navigate('/ai-teacher')}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {sessions.map((session) => {
            const state: AIChatLocationState = { lessonTitle: session.contextTitle };
            return (
              <Card key={session.sessionId} className="!p-3 sm:!p-3">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/ai-teacher/${session.sessionId}`}
                    state={state}
                    className="flex-1 min-w-0 flex items-center gap-3 p-1 no-underline rounded-xl"
                  >
                    <span className="size-10 shrink-0 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-300 flex items-center justify-center">
                      <SparkleIcon className="size-4.5" />
                    </span>
                    <span className="min-w-0 flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-white truncate">{sessionLabel(session)}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {session.status === 'active' ? t('Active') : t('Closed')} · {relativeTime(session.updatedAt)}
                      </span>
                    </span>
                  </Link>
                  <Link
                    to={`/voice-teacher/${session.sessionId}`}
                    className={pillLinkClass}
                    aria-label={t('Continue {title} in Voice Teacher', { title: sessionLabel(session) })}
                  >
                    <MicIcon className="size-4" />
                    {t('Voice')}
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
