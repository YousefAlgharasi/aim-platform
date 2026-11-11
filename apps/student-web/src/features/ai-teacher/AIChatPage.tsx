import { SelectToSave } from '../learner/SelectToSave';
import { newIdempotencyKey } from '../../api/client';
import { Markdown } from '../../components/common/Markdown';
import { buttonClasses } from '../../components/common/buttonStyles';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Banner } from '../../components/common/Banner';
import { ChatSkeleton } from '../../components/common/Skeleton';
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
import { SendIcon, ThumbButton, pillLinkClass } from './ui';
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
  const [input, setInput] = useState(navState.prefill ?? '');
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
    // One key per user action: a double click or network retry of this send is de-duplicated server-side.
    const idempotencyKey = newIdempotencyKey();
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
          idempotencyKey,
        );
        replyText = streamed;
      } catch (err) {
        if (!(err instanceof StreamUnauthorizedError)) throw err;
        // 401 before processing: fall back to the non-streaming endpoint,
        // which goes through apiClient's token refresh.
        const reply = await aiTeacherApi.sendMessage(sessionId, studentMessage, idempotencyKey);
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

  if (loading && !messages) return <ChatSkeleton />;
  if (loadError && !messages) return <ErrorState message={loadError} onRetry={fetchHistory} />;
  if (!messages) return null;

  const isEmpty = messages.length === 0 && !sending;

  const iconBtn = 'inline-flex size-10 items-center justify-center rounded-full border-0 bg-transparent text-ink-soft no-underline transition-colors hover:bg-surface-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-3xl flex-col md:min-h-[calc(100dvh-5rem)]">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-page/90 py-3 backdrop-blur">
        <div className="relative shrink-0">
          <div className="flex size-10 items-center justify-center rounded-full bg-brand text-white">
            <SparkleIcon className="size-4 text-white" />
          </div>
          <span className="absolute -bottom-0.5 -end-0.5 size-3 rounded-full bg-success-ink ring-2 ring-page" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-base font-semibold leading-tight text-ink">{t('AI Teacher')}</h1>
          <span className="block truncate text-sm text-ink-muted">
            {navState.lessonTitle || t('Always here to help')}
          </span>
        </div>
        <Link to={`/voice-teacher/${sessionId}`} className={iconBtn} aria-label={t('Switch to Voice Teacher')} title={t('Voice')}>
          <MicIcon className="size-5" />
        </Link>
        <Link to="/ai-teacher/history" className={`${iconBtn} w-auto px-4 text-sm font-semibold`}>
          {t('History')}
        </Link>
      </header>

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

      <div className="flex flex-1 flex-col gap-6 py-6" role="log" aria-live="polite" aria-label={t('Chat messages')}>
        {isEmpty && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand">
              <SparkleIcon className="size-6 text-white" />
            </div>
            <div>
              <p className="lp-display m-0 text-[1.75rem] font-semibold text-ink sm:text-[2.25rem]">{t('Ask me anything')}</p>
              <p className="m-0 mx-auto mt-2 max-w-sm text-sm text-ink-muted">
                {t('Start the conversation with a question or pick a suggestion below.')}
              </p>
            </div>
            <div className="grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2" aria-label={t('Suggested prompts')}>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => send(t(prompt))}
                  className="cursor-pointer rounded-2xl border-0 bg-surface px-4 py-3.5 text-start text-sm font-semibold text-ink ring-1 ring-line transition hover:bg-surface-strong hover:ring-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  {t(prompt)}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isStudent = msg.role === 'student';
          const entry = feedback[msg.id];
          const canRate = !isStudent && !msg.id.startsWith('temp-');
          const time = formatMsgTime(msg.createdAt, formatTime);
          if (isStudent) {
            return (
              <div key={msg.id} className="flex max-w-[85%] flex-col items-end self-end sm:max-w-[75%]" aria-label={t('Your message')}>
                <div className="whitespace-pre-wrap break-words rounded-3xl rounded-ee-lg bg-brand px-5 py-3 text-base leading-relaxed text-white">
                  {msg.text}
                </div>
                <span className="mt-1 px-1 text-xs text-ink-muted">{time}</span>
              </div>
            );
          }
          return (
            <div key={msg.id} className="flex items-start gap-3 self-start" aria-label={t('AI Teacher')}>
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand">
                <SparkleIcon className="size-3.5 text-white" />
              </div>
              <div className="flex min-w-0 max-w-[92%] flex-col items-start">
                <div className="break-words text-base leading-relaxed text-ink">
                  <SelectToSave source="chat"><Markdown text={msg.text} /></SelectToSave>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1 text-xs text-ink-muted">
                  {msg.channel === 'voice' && (
                    <span className="inline-flex items-center gap-0.5 pe-1"><MicIcon className="size-3" /> {t('Voice')}</span>
                  )}
                  <span className="pe-1">{time}</span>
                  {canRate && (
                    <>
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
                      {entry?.status === 'done' && <span className="ps-1">{t('Thanks for your feedback')}</span>}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {sending && streamingText !== null && streamingText.length > 0 && (
          <div className="flex items-start gap-3 self-start" aria-busy="true">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand">
              <SparkleIcon className="size-3.5 text-white" />
            </div>
            <div className="min-w-0 max-w-[92%] break-words text-base leading-relaxed text-ink">
              <Markdown text={streamingText} />
            </div>
          </div>
        )}
        {sending && !streamingText && (
          <div className="flex items-center gap-3 self-start" role="status">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand">
              <SparkleIcon className="size-3.5 text-white" />
            </div>
            <span className="sr-only">{t('AI Teacher is thinking…')}</span>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <div className="size-2 animate-bounce rounded-full bg-brand" />
              <div className="size-2 animate-bounce rounded-full bg-brand [animation-delay:150ms]" />
              <div className="size-2 animate-bounce rounded-full bg-brand [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 z-10 flex flex-col gap-2 bg-page pb-4 pt-2">
        {(sendError || feedbackError) && (
          <div className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger-ink ring-1 ring-danger-line" role="alert">
            {sendError || feedbackError}
          </div>
        )}

        {!sending && !isEmpty && (
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label={t('Suggested prompts')}>
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => send(t(prompt))}
                className={`${buttonClasses('secondary', 'sm')} shrink-0`}
              >
                {t(prompt)}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 rounded-3xl bg-surface p-2 ps-5 shadow-lg ring-1 ring-line-strong transition focus-within:ring-2 focus-within:ring-brand">
          <textarea
            className="max-h-40 min-h-11 flex-1 resize-none border-none bg-transparent py-3 text-base text-ink outline-none placeholder-ink-muted"
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
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-brand text-white transition hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
