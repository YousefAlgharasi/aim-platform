import { PageTitleBar } from '../../components/common/PageTitleBar';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { MicIcon, SparkleIcon } from '../../components/common/Icons';
import { DetailSkeleton } from '../../components/common/Skeleton';
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
import { useI18n } from '../../i18n/I18nContext';

/** Router state handed to AIChatPage after a session start. */
export interface AIChatLocationState {
  lessonTitle?: string | null;
  lastSessionRecap?: string | null;
  focusRecap?: string | null;
  /** Text to put in the message box when the chat opens (not sent automatically). */
  prefill?: string;
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
const STARTERS = [
  'Explain a tricky grammar rule to me.',
  'Let’s practice a short conversation.',
  'Check my sentence and fix my mistakes.',
  'Teach me 5 useful new words.',
];

export function AITeacherEntryPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get('lessonId');
  const explicitContextRef = searchParams.get('contextRef');
  const lessonTitle = searchParams.get('lessonTitle');
  // /ai-teacher?ask=<word> opens the general chat with “What does <word> mean?” ready to send (from “Ask AI” on a saved word).
  const askWord = searchParams.get('ask')?.trim().slice(0, 60) || null;
  const deepLinkContextRef =
    explicitContextRef?.trim() || (lessonId ? lessonContextRef(lessonId) : null) || (askWord ? GENERAL_CONTEXT_REF : null);

  const [sessions, setSessions] = useState<ChatSessionListItem[]>([]);
  const [loading, setLoading] = useState(!deepLinkContextRef);
  const [loadError, setLoadError] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');
  const autoStarted = useRef(false);

  const startSession = useCallback(
    (contextRef: string, title?: string | null, starter?: string) => {
      setStarting(true);
      setStartError('');
      aiTeacherApi
        .startSession(contextRef)
        .then((session) => {
          const state: AIChatLocationState = {
            lessonTitle: title ?? null,
            lastSessionRecap: session.lastSessionRecap,
            focusRecap: session.focusRecap,
            prefill: starter ?? (askWord ? t('What does “{word}” mean in Arabic, and how do I use it in a sentence?', { word: askWord }) : undefined),
          };
          navigate(`/ai-teacher/${session.sessionId}`, { replace: !!deepLinkContextRef, state });
        })
        .catch((err) => {
          setStartError(getErrorMessage(err, t('Failed to start AI Teacher chat')));
          setStarting(false);
        });
    },
    [navigate, deepLinkContextRef, askWord, t],
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
    return <DetailSkeleton />;
  }

  if (loading) return <DetailSkeleton />;
  if (loadError) return <ErrorState message={loadError} onRetry={fetchSessions} />;

  const recent = sessions.slice(0, 5);

  return (
    <div className="stagger mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageTitleBar
        title={t('AI Teacher')}
        subtitle={t('Ask questions, get explanations, and receive personalized help from your AI teacher.')}
        action={<Link to="/ai-teacher/history" className={pillLinkClass}>{t('History')}</Link>}
      />

      <div className="hero-panel">
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25"><SparkleIcon className="size-7 text-white" /></span>
            <div className="min-w-0">
              <p className="m-0 text-xl font-extrabold leading-snug sm:text-2xl">{t('Ask me anything')}</p>
              <p className="m-0 mt-0.5 text-sm text-on-brand">{t('Start the conversation with a question or pick a suggestion below.')}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => startSession(GENERAL_CONTEXT_REF)}
              disabled={starting}
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-2xl border-0 hero-cta px-6 text-[15px] font-bold shadow-lg shadow-black/20 transition-all hover:-translate-y-px active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {starting ? t('Starting…') : t('Chat with AI Teacher')}
            </button>
            <Link
              to="/voice-teacher"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 text-[15px] font-bold text-white no-underline ring-1 ring-white/30 transition-all hover:bg-white/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <MicIcon className="size-4 text-white" />
              {t('Talk with Voice Teacher')}
            </Link>
          </div>
        </div>
        {startError && (
          <p className="relative z-10 m-0 mt-4 rounded-xl bg-black/25 px-3 py-2 text-sm text-white" role="alert">{startError}</p>
        )}
      </div>

      <section className="flex flex-col gap-3" aria-label={t('Try asking')}>
        <h2 className="m-0 px-1 text-base font-extrabold tracking-tight text-ink">{t('Try asking')}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {STARTERS.map((q) => (
            <button
              key={q}
              type="button"
              disabled={starting}
              onClick={() => startSession(GENERAL_CONTEXT_REF, null, t(q))}
              className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-0 bg-surface p-4 text-start text-sm font-semibold text-ink shadow-card ring-1 ring-line transition-all hover:-translate-y-0.5 hover:ring-brand-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60 motion-reduce:transition-none"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-ink" aria-hidden="true"><SparkleIcon className="size-4" /></span>
              <span className="min-w-0">{t(q)}</span>
            </button>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="flex flex-col gap-3" aria-label={t('Recent Conversations')}>
          <div className="flex items-center justify-between px-1">
            <h2 className="m-0 text-base font-extrabold tracking-tight text-ink">{t('Recent Conversations')}</h2>
            <Link to="/ai-teacher/history" className="text-xs font-semibold text-brand-ink no-underline hover:underline">{t('View all')}</Link>
          </div>
          <div className="flex flex-col gap-2">
            {recent.map((session) => (
              <Card key={session.sessionId} className="!p-0">
                <Link
                  to={`/ai-teacher/${session.sessionId}`}
                  state={chatState(session.contextTitle)}
                  className="flex items-center justify-between gap-3 rounded-2xl p-4 no-underline transition-colors hover:bg-surface-sunken"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-ink"><SparkleIcon className="size-4" /></span>
                    <span className="truncate font-semibold text-ink">{sessionLabel(session)}</span>
                  </span>
                  <span className="shrink-0 text-xs text-ink-muted">{relativeTime(session.updatedAt)}</span>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
