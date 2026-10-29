import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Banner } from '../../components/common/Banner';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import {
  aiTeacherApi,
  streamMessage,
  StreamUnauthorizedError,
  type ChatHistoryMessage,
  type FeedbackRating,
} from './aiTeacherApi';
import type { AIChatLocationState } from './AITeacherEntryPage';
import { SparkleIcon, MicIcon } from '../../components/common/Icons';
import { BackLink, SendIcon, ThumbButton, pillLinkClass } from './ui';
import { useI18n } from '../../i18n/I18nContext';

// Same quick-action prompts as Flutter's AiSuggestedPromptsRow.
const SUGGESTED_PROMPTS = [
  'Explain grammar',
  'Quick quiz',
  'Check my writing',
  'Give an example',
  'Practice speaking',
];

type FeedbackEntry = { rating: FeedbackRating | null; status: 'submitting' | 'done' };

function formatMsgTime(iso: string, formatTime: (v: string | number | Date, o?: Intl.DateTimeFormatOptions) => string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : formatTime(date, { hour: '2-digit', minute: '2-digit' });
}

export function AIChatPage() {
  const { t, formatTime } = useI18n();
  const { conversationId: sessionId = '' } = useParams<{ conversationId: string }>();
  const location = useLocation();
  const navState = (location.state ?? {}) as AIChatLocationState;

  const [messages, setMessages] = useState<ChatHistoryMessage[] | null>(null);
  const [focusRecap, setFocusRecap] = useState<string | null>(navState.focusRecap ?? null);
  const [safetyLimited, setSafetyLimited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [sendError, setSendError] = useState('');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, FeedbackEntry>>({});
  const [feedbackError, setFeedbackError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  /** Advisory only; failures never replace the conversation (Flutter loadSafetyStatus). */
  const loadSafetyStatus = useCallback(() => {
    aiTeacherApi
      .getSafetyStatus(sessionId)
      .then((res) => mountedRef.current && setSafetyLimited(res.status === 'limited'))
      .catch(() => {});
  }, [sessionId]);

  /** Best-effort refresh after a send; returns whether it succeeded. */
  const refreshHistory = useCallback(async (): Promise<boolean> => {
    try {
      const res = await aiTeacherApi.getHistory(sessionId);
      if (!mountedRef.current) return true;
      setMessages(res.messages ?? []);
      setFocusRecap(res.focusRecap ?? null);
      return true;
    } catch {
      return false;
    }
  }, [sessionId]);

  const fetchHistory = useCallback(() => {
    setLoading(true);
    setLoadError('');
    aiTeacherApi
      .getHistory(sessionId)
      .then((res) => {
        setMessages(res.messages ?? []);
        setFocusRecap(res.focusRecap ?? null);
        loadSafetyStatus();
      })
      .catch((err) => setLoadError(getErrorMessage(err, t('AI Teacher is temporarily unavailable. Your progress is safe, and you can try again.'))))
      .finally(() => setLoading(false));
  }, [sessionId, loadSafetyStatus, t]);

  useEffect(() => {
    setMessages(null);
    setFeedback({});
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages?.length, streamingText, sending]);

  function submitFeedback(messageId: string, rating: FeedbackRating) {
    if (feedback[messageId]) return;
    setFeedbackError('');
    setFeedback((prev) => ({ ...prev, [messageId]: { rating, status: 'submitting' } }));
    aiTeacherApi
      .submitFeedback(messageId, rating)
      .then(() => setFeedback((prev) => ({ ...prev, [messageId]: { rating, status: 'done' } })))
      .catch((err) => {
        if ((err as { statusCode?: number })?.statusCode === 409) {
          // Already rated earlier (the history response doesn't carry ratings).
          setFeedback((prev) => ({ ...prev, [messageId]: { rating: null, status: 'done' } }));
          return;
        }
        setFeedback((prev) => {
          const next = { ...prev };
          delete next[messageId];
          return next;
        });
        setFeedbackError(getErrorMessage(err, t('Could not send feedback. Please try again.')));
      });
  }

  async function send(text: string) {
    const studentMessage = text.trim();
    if (!studentMessage || sending || !messages) return;

    setInput('');
    setSendError('');
    setSending(true);
    setStreamingText(null);

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...(prev ?? []),
      {
        id: tempId,
        role: 'student',
        text: studentMessage,
        createdAt: new Date().toISOString(),
        channel: 'text',
        audioRef: null,
        audioDurationMs: null,
        isGreeting: false,
      },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;
    let streamed = '';
    let replyText: string | null = null;

    try {
      try {
        await streamMessage(
          sessionId,
          studentMessage,
          (chunk) => {
            streamed += chunk;
            if (mountedRef.current) setStreamingText(streamed);
          },
          controller.signal,
        );
        replyText = streamed;
      } catch (err) {
        if (!(err instanceof StreamUnauthorizedError)) throw err;
        // 401 before processing: fall back to the non-streaming endpoint,
        // which goes through apiClient's token refresh.
        const reply = await aiTeacherApi.sendMessage(sessionId, studentMessage);
        replyText = reply.text;
      }
      if (!mountedRef.current) return;

      const refreshed = await refreshHistory();
      if (!mountedRef.current) return;
      if (!refreshed && replyText) {
        // Keep the reply on screen until the next successful refresh.
        setMessages((prev) => [
          ...(prev ?? []),
          {
            id: `temp-reply-${Date.now()}`,
            role: 'ai_teacher',
            text: replyText as string,
            createdAt: new Date().toISOString(),
            channel: 'text',
            audioRef: null,
            audioDurationMs: null,
            isGreeting: false,
          },
        ]);
      }
    } catch (err) {
      if ((err as { name?: string } | null)?.name === 'AbortError' || !mountedRef.current) return;
      setSendError(getErrorMessage(err, t('Failed to send your message. Please try again.')));
      // The student message may have been persisted before the failure.
      const refreshed = await refreshHistory();
      if (!refreshed && mountedRef.current) {
        setMessages((prev) => (prev ?? []).filter((m) => m.id !== tempId));
        setInput(studentMessage);
      }
    } finally {
      abortRef.current = null;
      if (mountedRef.current) {
        setStreamingText(null);
        setSending(false);
        loadSafetyStatus();
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  if (loading && !messages) return <LoadingSpinner />;
  if (loadError && !messages) return <ErrorState message={loadError} onRetry={fetchHistory} />;
  if (!messages) return null;

  const isEmpty = messages.length === 0 && !sending;

  return (
    <div className="flex flex-col min-h-[calc(100dvh-8rem)] md:min-h-[calc(100dvh-5rem)] max-w-3xl w-full mx-auto">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <BackLink to="/ai-teacher" label={t('Back to AI Teacher')} />
        <div className="size-9 shrink-0 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
          <SparkleIcon className="size-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight m-0">{t('AI Teacher')}</h1>
          <span className="block text-xs text-emerald-500 font-semibold truncate">
            {navState.lessonTitle || t('Always here to help')}
          </span>
        </div>
        <Link to={`/voice-teacher/${sessionId}`} className={pillLinkClass} aria-label={t('Switch to Voice Teacher')}>
          <MicIcon className="size-4" />
          <span className="hidden sm:inline">{t('Voice')}</span>
        </Link>
        <Link to="/ai-teacher/history" className={pillLinkClass}>
          {t('History')}
        </Link>
      </div>

      {(safetyLimited || focusRecap || navState.lastSessionRecap) && (
        <div className="flex flex-col gap-2 pt-3">
          {safetyLimited && (
            <Banner variant="warning">
              <strong>{t('AI Teacher is limited right now.')}</strong>{' '}
              {t('Some responses in this conversation were held back to keep things safe. You can keep chatting, or start a new conversation.')}
            </Banner>
          )}
          {focusRecap && <Banner variant="info">{focusRecap}</Banner>}
          {navState.lastSessionRecap && (
            <Banner variant="success">
              <strong>{t('Welcome back.')}</strong> {navState.lastSessionRecap}
            </Banner>
          )}
        </div>
      )}

      <div className="flex-1 py-4 flex flex-col gap-3.5" role="log" aria-live="polite" aria-label={t('Chat messages')}>
        {isEmpty && (
          <div className="flex flex-col items-center text-center gap-2 py-8">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <SparkleIcon className="size-6 text-white" />
            </div>
            <p className="m-0 mt-2 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">{t('Ask me anything')}</p>
            <p className="m-0 text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              {t('Start the conversation with a question or pick a suggestion below.')}
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isStudent = msg.role === 'student';
          const entry = feedback[msg.id];
          const canRate = !isStudent && !msg.id.startsWith('temp-');
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[88%] sm:max-w-[78%] ${isStudent ? 'self-end items-end' : 'self-start items-start'}`}
              aria-label={isStudent ? t('Your message') : t('AI Teacher')}
            >
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  isStudent
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-ee-none shadow-md shadow-indigo-500/15'
                    : 'bg-white dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700 text-slate-800 dark:text-slate-100 rounded-es-none shadow-sm'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 px-1 flex items-center gap-1">
                {msg.channel === 'voice' && (
                  <span className="inline-flex items-center gap-0.5"><MicIcon className="size-3" /> {t('Voice')} ·</span>
                )}
                {formatMsgTime(msg.createdAt, formatTime)}
              </span>
              {canRate && (
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {entry?.status === 'done' ? t('Thanks for your feedback') : t('Was this helpful?')}
                  </span>
                  <ThumbButton
                    kind="up"
                    active={entry?.rating === 'helpful'}
                    disabled={!!entry}
                    onClick={() => submitFeedback(msg.id, 'helpful')}
                    label={t('Mark AI Teacher reply as helpful')}
                  />
                  <ThumbButton
                    kind="down"
                    active={entry?.rating === 'not_helpful'}
                    disabled={!!entry}
                    onClick={() => submitFeedback(msg.id, 'not_helpful')}
                    label={t('Mark AI Teacher reply as not helpful')}
                  />
                </div>
              )}
            </div>
          );
        })}

        {sending && streamingText !== null && streamingText.length > 0 && (
          <div className="flex flex-col max-w-[88%] sm:max-w-[78%] self-start items-start" aria-busy="true">
            <div className="p-4 rounded-2xl rounded-es-none text-sm leading-relaxed whitespace-pre-wrap break-words bg-white dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700 text-slate-800 dark:text-slate-100 shadow-sm">
              {streamingText}
            </div>
          </div>
        )}
        {sending && !streamingText && (
          <div
            className="self-start bg-white dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700 rounded-2xl rounded-es-none p-3.5 flex items-center gap-1.5 shadow-sm"
            role="status"
          >
            <span className="sr-only">{t('AI Teacher is thinking…')}</span>
            <div className="size-2 rounded-full bg-indigo-500 animate-bounce" aria-hidden="true" />
            <div className="size-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:150ms]" aria-hidden="true" />
            <div className="size-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:300ms]" aria-hidden="true" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-4 z-10 flex flex-col gap-2 pt-2 bg-[#F8FAFC]/90 dark:bg-slate-900/90 backdrop-blur-md">
        {(sendError || feedbackError) && (
          <div
            className="rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-900 px-3 py-2 text-sm"
            role="alert"
          >
            {sendError || feedbackError}
          </div>
        )}

        {!sending && (
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label={t('Suggested prompts')}>
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => send(t(prompt))}
                className="shrink-0 min-h-10 px-4 rounded-full bg-white dark:bg-slate-800 ring-1 ring-indigo-200 dark:ring-slate-700 text-[#4F46E5] dark:text-indigo-300 text-sm font-semibold cursor-pointer border-none hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
              >
                {t(prompt)}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 bg-slate-100 dark:bg-slate-800 rounded-2xl p-2 ps-4 border border-slate-200/60 dark:border-slate-700">
          <textarea
            className="flex-1 min-h-10 max-h-32 resize-none bg-transparent border-none outline-none py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('Ask AI Teacher…')}
            rows={1}
            disabled={sending}
            aria-label={t('Message input')}
          />
          <button
            type="button"
            onClick={() => send(input)}
            disabled={sending || !input.trim()}
            aria-label={sending ? t('Sending…') : t('Send message')}
            className="size-10 shrink-0 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white flex items-center justify-center border-none cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
