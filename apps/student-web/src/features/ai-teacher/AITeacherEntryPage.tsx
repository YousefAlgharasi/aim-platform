import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { MicIcon, SparkleIcon } from '../../components/common/Icons';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import {
  aiTeacherApi,
  GENERAL_CONTEXT_REF,
  lessonContextRef,
  relativeTime,
  sessionLabel,
  type ChatSessionListItem,
} from './aiTeacherApi';
import { pillLinkClass } from './ui';
import chatIllustration from './assets/undraw_chat_ai.svg';
import { useI18n } from '../../i18n/I18nContext';

/** Router state handed to AIChatPage after a session start. */
export interface AIChatLocationState {
  lessonTitle?: string | null;
  lastSessionRecap?: string | null;
  focusRecap?: string | null;
}

function chatState(lessonTitle: string | null): AIChatLocationState {
  return { lessonTitle };
}

/**
 * /ai-teacher
 *
 * Deep links (from other features):
 *   /ai-teacher?lessonId=<uuid>[&lessonTitle=<title>] → starts/resumes the lesson-scoped session
 *   /ai-teacher?contextRef=<ref>                        → starts/resumes a session for that contextRef
 * The backend get-or-creates one session per (student, contextRef), so the
 * lesson's chat and voice turns share one conversation.
 */
export function AITeacherEntryPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get('lessonId');
  const explicitContextRef = searchParams.get('contextRef');
  const lessonTitle = searchParams.get('lessonTitle');
  const deepLinkContextRef = explicitContextRef?.trim() || (lessonId ? lessonContextRef(lessonId) : null);

  const [sessions, setSessions] = useState<ChatSessionListItem[]>([]);
  const [loading, setLoading] = useState(!deepLinkContextRef);
  const [loadError, setLoadError] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');
  const autoStarted = useRef(false);

  const startSession = useCallback(
    (contextRef: string, title?: string | null) => {
      setStarting(true);
      setStartError('');
      aiTeacherApi
        .startSession(contextRef)
        .then((session) => {
          const state: AIChatLocationState = {
            lessonTitle: title ?? null,
            lastSessionRecap: session.lastSessionRecap,
            focusRecap: session.focusRecap,
          };
          navigate(`/ai-teacher/${session.sessionId}`, { replace: !!deepLinkContextRef, state });
        })
        .catch((err) => {
          setStartError(getErrorMessage(err, t('Failed to start AI Teacher chat')));
          setStarting(false);
        });
    },
    [navigate, deepLinkContextRef, t],
  );

  const fetchSessions = useCallback(() => {
    setLoading(true);
    setLoadError('');
    aiTeacherApi
      .listSessions()
      .then((res) => setSessions(res.sessions ?? []))
      .catch((err) => setLoadError(getErrorMessage(err, t('Failed to load AI Teacher'))))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    if (deepLinkContextRef) {
      if (autoStarted.current) return;
      autoStarted.current = true;
      startSession(deepLinkContextRef, lessonTitle);
      return;
    }
    fetchSessions();
  }, [deepLinkContextRef, lessonTitle, startSession, fetchSessions]);

  if (deepLinkContextRef) {
    if (startError) {
      return (
        <ErrorState
          message={startError}
          onRetry={() => startSession(deepLinkContextRef, lessonTitle)}
        />
      );
    }
    return <LoadingSpinner />;
  }

  if (loading) return <LoadingSpinner />;
  if (loadError) return <ErrorState message={loadError} onRetry={fetchSessions} />;

  const recent = sessions.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-indigo-600 dark:text-indigo-400 text-xs font-extrabold uppercase tracking-wider">{t('Your tutor')}</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0 mt-1">{t('AI Teacher')}</h1>
        </div>
        <Link to="/ai-teacher/history" className={pillLinkClass}>
          {t('History')}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 sm:p-8 text-white shadow-lg shadow-indigo-500/20 flex flex-col items-center text-center gap-4">
          <img src={chatIllustration} alt="" aria-hidden="true" className="h-36 sm:h-44 w-auto" />
          <div className="size-11 rounded-xl bg-white/20 flex items-center justify-center">
            <SparkleIcon className="size-5 text-white" />
          </div>
          <p className="text-base sm:text-lg font-semibold leading-relaxed m-0 max-w-md">
            {t('Ask questions, get explanations, and receive personalized help from your AI teacher.')}
          </p>
          {startError && (
            <p className="m-0 rounded-xl bg-red-50 text-red-700 ring-1 ring-red-200 px-3 py-2 text-sm" role="alert">
              {startError}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <button
              type="button"
              onClick={() => startSession(GENERAL_CONTEXT_REF)}
              disabled={starting}
              className="flex-1 h-[54px] rounded-[14px] bg-white text-[#4F46E5] font-semibold border-none cursor-pointer hover:bg-indigo-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {starting ? t('Starting…') : t('Chat with AI Teacher')}
            </button>
            <Link
              to="/voice-teacher"
              className="flex-1 h-[54px] rounded-[14px] bg-white/15 ring-1 ring-white/30 text-white font-semibold no-underline flex items-center justify-center gap-2 hover:bg-white/25 transition-colors"
            >
              <MicIcon className="size-4.5 text-white" />
              {t('Talk with Voice Teacher')}
            </Link>
          </div>
        </div>

        {recent.length > 0 && (
          <section>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white mt-0 mb-3">{t('Recent Conversations')}</h2>
            <div className="flex flex-col gap-3">
              {recent.map((session) => (
                <Card key={session.sessionId} className="!p-0">
                  <Link
                    to={`/ai-teacher/${session.sessionId}`}
                    state={chatState(session.contextTitle)}
                    className="flex items-center justify-between gap-3 p-4 no-underline rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span className="size-10 shrink-0 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-300 flex items-center justify-center">
                        <SparkleIcon className="size-4.5" />
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white truncate">{sessionLabel(session)}</span>
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{relativeTime(session.updatedAt)}</span>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
