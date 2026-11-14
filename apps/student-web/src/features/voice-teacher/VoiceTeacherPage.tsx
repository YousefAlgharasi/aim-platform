import { ChatSkeleton } from '../../components/common/Skeleton';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { Markdown } from '../../components/common/Markdown';
import { buttonClasses } from '../../components/common/buttonStyles';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getErrorMessage, newIdempotencyKey } from '../../api/client';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { ErrorState } from '../../components/common/ErrorState';
import { aiTeacherApi, GENERAL_CONTEXT_REF, lessonContextRef, type FeedbackRating } from '../ai-teacher/aiTeacherApi';
import { useLiveVoice, type LiveUtterance } from './useLiveVoice';
import {
  MAX_AUDIO_SIZE_BYTES,
  MIN_RECORDING_MS,
  voiceTeacherApi,
  type VoiceMessage,
} from './voiceTeacherApi';
import { MicIcon } from '../../components/common/Icons';
import { ThumbButton } from '../ai-teacher/ui';
import { VoiceComposer, type MicState } from './VoiceComposer';
import type { RobotState } from './AimRobot';
import { PANEL_MAX, PANEL_MIN, useResizablePanel } from './useResizablePanel';
import { balanceMarkdown, useTypewriter } from './useTypewriter';
import './voice-room.css';
import { useI18n } from '../../i18n/I18nContext';
import { PracticeBanner } from '../practice-topics/PracticeBanner';
import type { PracticeSessionState } from '../practice-topics/practiceTopicsApi';

const WAVE_HEIGHTS = [4, 8, 14, 22, 16, 28, 18, 12, 24, 15, 8, 5];

interface VoiceLocationState {
  lessonId?: string | null;
  lessonTitle?: string | null;
  lastSessionRecap?: string | null;
  focusRecap?: string | null;
  /** Set when opened from Practice Speaking: shows the timer + finish-for-XP bar. */
  practice?: PracticeSessionState;
}

type FeedbackEntry = { rating: FeedbackRating | null; status: 'submitting' | 'done' };

/** Playback source: a stored audioRef, or lazy TTS for a message without one. */
type AudioSource = { kind: 'ref'; audioRef: string } | { kind: 'message'; messageId: string };

function sourceKey(source: AudioSource): string {
  return source.kind === 'ref' ? `ref:${source.audioRef}` : `msg:${source.messageId}`;
}

/** Is this reply already in the conversation? Then there is nothing extra to show (the yellow "fallback" box only repeated it). */
function replyIsShown(messages: VoiceMessage[] | null, text: string): boolean {
  const wanted = text.trim();
  return !!messages?.some((m) => m.role === 'teacher' && m.text.trim() === wanted);
}

function sourceForMessage(message: VoiceMessage): AudioSource | null {
  if (message.audioRef) return { kind: 'ref', audioRef: message.audioRef };
  if (message.role === 'teacher') return { kind: 'message', messageId: message.id };
  return null;
}

/**
 * /voice-teacher                → starts (or resumes) a session, then redirects to /voice-teacher/:sessionId
 *   ?lessonId=<uuid>[&lessonTitle=…] or ?contextRef=<ref> scope the session (default "general").
 * /voice-teacher/:sessionId     → the voice conversation for an existing session.
 */
export function VoiceTeacherPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  if (!sessionId) return <VoiceSessionStarter />;
  return <VoiceConversation key={sessionId} sessionId={sessionId} />;
}

function VoiceSessionStarter() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get('lessonId');
  const lessonTitle = searchParams.get('lessonTitle');
  const contextRef =
    searchParams.get('contextRef')?.trim() || (lessonId ? lessonContextRef(lessonId) : GENERAL_CONTEXT_REF);
  const [error, setError] = useState('');
  const started = useRef(false);

  const start = useCallback(() => {
    setError('');
    voiceTeacherApi
      .startSession(contextRef)
      .then((session) => {
        const state: VoiceLocationState = {
          lessonId,
          lessonTitle,
          lastSessionRecap: session.lastSessionRecap,
          focusRecap: session.focusRecap,
        };
        navigate(`/voice-teacher/${session.sessionId}`, { replace: true, state });
      })
      .catch((err) => setError(getErrorMessage(err, t('Could not start a Voice Teacher session.'))));
  }, [contextRef, lessonId, lessonTitle, navigate, t]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    start();
  }, [start]);

  if (error) return <ErrorState message={error} onRetry={start} />;
  return (
    <div className="flex flex-col gap-2">
      <ChatSkeleton />
      <p className="m-0 text-center text-sm text-ink-muted">{t('Starting Voice Teacher session…')}</p>
    </div>
  );
}

function VoiceConversation({ sessionId }: { sessionId: string }) {
  const { t, formatTime } = useI18n();
  const location = useLocation();
  const navState = (location.state ?? {}) as VoiceLocationState;

  const [messages, setMessages] = useState<VoiceMessage[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [turnError, setTurnError] = useState('');
  const [fallbackText, setFallbackText] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [playbackNotice, setPlaybackNotice] = useState('');
  const [feedback, setFeedback] = useState<Record<string, FeedbackEntry>>({});
  // Live-lesson controls: the teacher's voice can be muted (replies stay on screen), and the student can type instead of talking.
  const [muted, setMuted] = useState(false);
  const [draft, setDraft] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlCache = useRef(new Map<string, string>());
  const mountedRef = useRef(true);
  const greetingHandled = useRef(false);
  const playRequest = useRef(0);
  const mutedRef = useRef(false);

  // ── Playback ──────────────────────────────────────────────────────────

  const stopPlayback = useCallback(() => {
    playRequest.current += 1;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPlayingKey(null);
    setLoadingKey(null);
  }, []);

  const play = useCallback(async (source: AudioSource) => {
    const key = sourceKey(source);
    const request = ++playRequest.current;
    setPlaybackNotice('');
    audioRef.current?.pause();
    setPlayingKey(null);

    let url = urlCache.current.get(key);
    if (!url) {
      setLoadingKey(key);
      try {
        const blob =
          source.kind === 'ref'
            ? await voiceTeacherApi.getAudio(source.audioRef)
            : await voiceTeacherApi.getMessageAudio(source.messageId);
        if (!mountedRef.current) return;
        url = URL.createObjectURL(blob);
        urlCache.current.set(key, url);
      } catch {
        if (mountedRef.current && request === playRequest.current) {
          setLoadingKey(null);
          setPlaybackNotice(t('Audio is not available for this reply right now. You can read it in the messages.'));
        }
        return;
      }
    }
    if (!mountedRef.current || request !== playRequest.current) return;
    setLoadingKey(null);

    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.onended = () => mountedRef.current && setPlayingKey(null);
    audio.onerror = () => {
      if (!mountedRef.current) return;
      setPlayingKey(null);
      setPlaybackNotice(t('This audio could not be played in your browser.'));
    };
    audio.src = url;
    try {
      await audio.play();
      if (mountedRef.current && request === playRequest.current) setPlayingKey(key);
    } catch (err) {
      if (!mountedRef.current) return;
      setPlayingKey(null);
      if ((err as { name?: string } | null)?.name === 'NotAllowedError') {
        setPlaybackNotice(t('Your browser blocked autoplay. Press play on the reply to listen.'));
      }
    }
  }, [t]);

  /** Plays a teacher reply on its own, unless the student muted the teacher's voice. */
  const playReply = useCallback((source: AudioSource) => {
    if (!mutedRef.current) void play(source);
  }, [play]);

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    if (next) stopPlayback();
  }, [stopPlayback]);

  useEffect(() => {
    mountedRef.current = true;
    const cache = urlCache.current;
    return () => {
      mountedRef.current = false;
      audioRef.current?.pause();
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

  // ── History ───────────────────────────────────────────────────────────

  const fetchHistory = useCallback(() => {
    setLoading(true);
    setLoadError('');
    voiceTeacherApi
      .getHistory(sessionId)
      .then((res) => setMessages(res.messages ?? []))
      .catch((err) => setLoadError(getErrorMessage(err, t('Voice Teacher is temporarily unavailable. Please try again.'))))
      .finally(() => setLoading(false));
  }, [sessionId, t]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Auto-play the opening greeting once (as Flutter does); browsers may block it.
  useEffect(() => {
    if (!messages || greetingHandled.current) return;
    greetingHandled.current = true;
    if (messages.length === 1 && messages[0].isGreeting) {
      const source = sourceForMessage(messages[0]);
      if (source) playReply(source);
    }
  }, [messages, playReply]);

  // ── Recording turn ────────────────────────────────────────────────────

  const submitRecording = useCallback(
    async (result: LiveUtterance | null) => {
      if (!result) {
        setTurnError(t('No audio was recorded. Please try again.'));
        return;
      }
      if (result.durationMs < MIN_RECORDING_MS) {
        setTurnError(t('That was too short. Please say it again.'));
        return;
      }
      if (result.blob.size > MAX_AUDIO_SIZE_BYTES) {
        setTurnError(t('That recording is too large. Please keep your answer shorter.'));
        return;
      }

      setSubmitting(true);
      setTurnError('');
      setFallbackText(null);
      try {
        const reply = await voiceTeacherApi.submitAudio(sessionId, result.blob, result.mimeType);
        if (!mountedRef.current) return;

        let latest: VoiceMessage[] | null = null;
        try {
          latest = (await voiceTeacherApi.getHistory(sessionId)).messages ?? [];
          if (mountedRef.current) setMessages(latest);
        } catch {
          // Best effort: the turn already succeeded.
        }
        if (!mountedRef.current) return;

        if (reply.audioRef) {
          playReply({ kind: 'ref', audioRef: reply.audioRef });
        } else if (reply.isFallback) {
          if (!replyIsShown(latest, reply.text)) setFallbackText(reply.text);
        } else {
          const lastTeacher = latest ? [...latest].reverse().find((m) => m.role === 'teacher') : undefined;
          if (lastTeacher) playReply(sourceForMessage(lastTeacher) as AudioSource);
          else if (!replyIsShown(latest, reply.text)) setFallbackText(reply.text);
        }
      } catch (err) {
        if (mountedRef.current) setTurnError(getErrorMessage(err, t('Your answer could not be sent. Please try again.')));
      } finally {
        if (mountedRef.current) setSubmitting(false);
      }
    },
    [sessionId, playReply, t],
  );

  /** A typed turn: same conversation as the voice turns, so the teacher answers (and speaks) the same way. */
  const submitText = useCallback(
    async (raw: string) => {
      const message = raw.trim();
      if (!message || submitting) return;
      stopPlayback();
      setSubmitting(true);
      setTurnError('');
      setFallbackText(null);
      setDraft('');
      const localId = `local-${Date.now()}`;
      setMessages((prev) => [
        ...(prev ?? []),
        { id: localId, role: 'student', text: message, audioRef: null, createdAt: new Date().toISOString(), channel: 'text', audioDurationMs: null, isGreeting: false },
      ]);
      try {
        const reply = await aiTeacherApi.sendMessage(sessionId, message, newIdempotencyKey());
        if (!mountedRef.current) return;
        let latest: VoiceMessage[] | null = null;
        try {
          latest = (await voiceTeacherApi.getHistory(sessionId)).messages ?? [];
          if (mountedRef.current) setMessages(latest);
        } catch {
          // Best effort: the turn already succeeded; keep the local copy of the student's message.
        }
        if (!mountedRef.current) return;
        if (reply.isFallback) {
          if (!replyIsShown(latest, reply.text)) setFallbackText(reply.text);
        } else {
          const lastTeacher = latest ? [...latest].reverse().find((m) => m.role === 'teacher') : undefined;
          if (lastTeacher) playReply(sourceForMessage(lastTeacher) as AudioSource);
        }
      } catch (err) {
        if (mountedRef.current) {
          setMessages((prev) => (prev ?? []).filter((m) => m.id !== localId));
          setDraft(message);
          setTurnError(getErrorMessage(err, t('Your message could not be sent. Please try again.')));
        }
      } finally {
        if (mountedRef.current) setSubmitting(false);
      }
    },
    [sessionId, submitting, stopPlayback, playReply, t],
  );

  // ── Live microphone ───────────────────────────────────────────────────
  // The mic stays open: it hears when the student starts and stops talking, sends each finished sentence on its own,
  // and the student can talk over the teacher to interrupt. Muting only ignores the mic; it does not close it.
  const speakingRef = useRef(false);
  const busyRef = useRef(false);
  const [micMuted, setMicMuted] = useState(false);

  const live = useLiveVoice({
    onUtterance: (utterance) => {
      // One turn at a time: speech that arrives while the teacher is still thinking is dropped.
      if (busyRef.current) return;
      void submitRecording(utterance);
    },
    onBargeIn: stopPlayback,
    isAiSpeaking: () => speakingRef.current,
  });

  // Start listening as soon as the conversation is open (the student chose "start live lesson", so this is expected).
  const liveStarted = useRef(false);
  useEffect(() => {
    if (!messages || liveStarted.current) return;
    liveStarted.current = true;
    void live.start();
  }, [messages, live]);

  function handleMicToggle() {
    if (live.status === 'off' || live.status === 'denied' || live.status === 'error') {
      // Turning the mic on (or trying again after a refusal).
      setMicMuted(false);
      live.setMuted(false);
      setTurnError('');
      void live.start();
      return;
    }
    const next = !micMuted;
    setMicMuted(next);
    live.setMuted(next);
  }

  function submitFeedback(messageId: string, rating: FeedbackRating) {
    if (feedback[messageId]) return;
    setFeedback((prev) => ({ ...prev, [messageId]: { rating, status: 'submitting' } }));
    aiTeacherApi
      .submitFeedback(messageId, rating)
      .then(() => setFeedback((prev) => ({ ...prev, [messageId]: { rating, status: 'done' } })))
      .catch((err) => {
        if ((err as { statusCode?: number })?.statusCode === 409) {
          setFeedback((prev) => ({ ...prev, [messageId]: { rating: null, status: 'done' } }));
          return;
        }
        setFeedback((prev) => {
          const next = { ...prev };
          delete next[messageId];
          return next;
        });
        setTurnError(getErrorMessage(err, t('Could not send feedback. Please try again.')));
      });
  }

  // The conversation panel on wide screens can be dragged wider or narrower; the width is remembered.
  const panel = useResizablePanel('aim-voice-chat-width');

  // The newest teacher message is "written live" (letter by letter). Messages that were already there when the page
  // opened are shown at once; the greeting of a brand-new session counts as new.
  const seenIds = useRef<Set<string> | null>(null);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  useEffect(() => {
    if (!messages) return;
    if (seenIds.current === null) {
      seenIds.current = new Set(messages.map((m) => m.id));
      if (messages.length === 1 && messages[0].isGreeting) setAnimatingId(messages[0].id);
      return;
    }
    const seen = seenIds.current;
    const fresh = [...messages].reverse().find((m) => m.role === 'teacher' && !seen.has(m.id));
    messages.forEach((m) => seen.add(m.id));
    if (fresh) setAnimatingId(fresh.id);
  }, [messages]);
  const animating = messages?.find((m) => m.id === animatingId) ?? null;
  const typed = useTypewriter(animating ? { id: animating.id, text: animating.text } : null);
  const textOf = (m: VoiceMessage) => (m.id === animatingId && typed.id === m.id ? typed.shownText : m.text);
  const isTyping = (m: VoiceMessage) => m.id === animatingId && typed.typing;

  // Keep the newest message in view in the conversation panel.
  const listRef = useRef<HTMLDivElement>(null);
  const messageCount = messages?.length ?? 0;
  useEffect(() => {
    const el = listRef.current;
    if (el && typeof el.scrollTo === 'function') el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messageCount, submitting, showTranscript, typed.shownText.length]);

  // ── Render ────────────────────────────────────────────────────────────

  if (loading && !messages) return <ChatSkeleton />;
  if (loadError && !messages) return <ErrorState message={loadError} onRetry={fetchHistory} />;
  if (!messages) return null;

  const isHearing = live.status === 'hearing';
  const isSpeaking = playingKey !== null || loadingKey !== null;
  speakingRef.current = isSpeaking;
  busyRef.current = submitting;
  const micOn = (live.status === 'listening' || live.status === 'hearing') && !micMuted;
  const robotState: RobotState = isHearing ? 'listening' : submitting ? 'thinking' : isSpeaking ? 'speaking' : 'idle';
  const status = isHearing
    ? { label: t('Hearing you'), heading: t('Listening to you…') }
    : submitting
      ? { label: t('Processing'), heading: t('Your teacher is thinking…') }
      : isSpeaking
        ? { label: t('Teacher speaking'), heading: t('Your teacher is speaking…') }
        : micOn
          ? { label: t('Live'), heading: t('I’m listening. Just talk.') }
          : live.status === 'starting'
            ? { label: t('Starting'), heading: t('Starting the microphone…') }
            : micMuted && (live.status === 'listening' || live.status === 'hearing')
              ? { label: t('Muted'), heading: t('Your mic is muted. Type, or turn it on.') }
              : { label: t('Mic off'), heading: t('Your turn: type your answer') };

  const micState: MicState =
    live.status === 'unsupported' ? 'blocked'
      : live.status === 'starting' ? 'starting'
        : micOn ? (isHearing ? 'hearing' : 'on')
          : (live.status === 'listening' || live.status === 'hearing') ? 'muted'
            : 'off';
  const lastTeacher = [...messages].reverse().find((m) => m.role === 'teacher');
  const onlyGreeting = messages.length === 1 && messages[0].isGreeting;
  const isLesson = !!navState.lessonTitle;

  const stageBanners = (
    <div className="flex w-full max-w-xl flex-col gap-2 empty:hidden text-start">
      {live.status === 'unsupported' && (
        <Banner variant="warning">
          {t("Live voice isn't available in this browser. Use a recent version of Chrome, Edge, Firefox or Safari over a secure (https) connection. You can still type to your teacher below.")}
        </Banner>
      )}
      {live.status === 'denied' && (
        <Banner variant="error">
          {t('Microphone permission was denied. Allow microphone access for this site in your browser settings, then try again.')}{' '}
          <button type="button" className="bg-transparent border-none p-0 underline font-semibold text-inherit cursor-pointer" onClick={handleMicToggle}>
            {t('Try again')}
          </button>
        </Banner>
      )}
      {live.status === 'error' && live.errorMessage && <Banner variant="error">{live.errorMessage}</Banner>}
      {turnError && <Banner variant="error">{turnError}</Banner>}
      {fallbackText && <Banner variant="warning">{fallbackText}</Banner>}
      {playbackNotice && <Banner variant="info">{playbackNotice}</Banner>}
    </div>
  );

  const renderMessage = (msg: VoiceMessage) => {
    const isTeacher = msg.role === 'teacher';
    const source = sourceForMessage(msg);
    const key = source ? sourceKey(source) : null;
    const entry = feedback[msg.id];
    return (
      <div key={msg.id} className={`flex max-w-[92%] flex-col ${isTeacher ? 'self-start items-start' : 'self-end items-end'}`}>
        <div
          className={`whitespace-pre-wrap break-words rounded-2xl p-3.5 text-base leading-relaxed ${
            isTeacher ? 'rounded-es-none bg-surface-sunken text-ink ring-1 ring-line' : 'rounded-ee-none bg-brand text-on-brand'
          }`}
        >
          {isTeacher ? <><Markdown text={balanceMarkdown(textOf(msg))} />{isTyping(msg) && <span className="vr-caret" aria-hidden="true" />}</> : msg.text}
        </div>
        <div className="mt-1 flex items-center gap-2 px-1 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1">
            {msg.channel === 'voice' && <MicIcon className="size-3" />}
            {formatTime(new Date(msg.createdAt), { hour: '2-digit', minute: '2-digit' })}
          </span>
          {source && key && (
            <button
              type="button"
              className={buttonClasses('secondary', 'sm')}
              onClick={() => (playingKey === key ? stopPlayback() : play(source))}
              disabled={loadingKey === key}
              aria-label={playingKey === key ? t('Stop audio') : t('Play audio')}
            >
              {loadingKey === key ? t('Loading…') : playingKey === key ? `■ ${t('Stop')}` : `▶ ${t('Play')}`}
            </button>
          )}
        </div>
        {isTeacher && !msg.id.startsWith('local-') && (
          <div className="mt-1 flex items-center gap-2 px-1">
            <span className="text-xs text-ink-muted">{entry?.status === 'done' ? t('Thanks for your feedback') : t('Was this helpful?')}</span>
            <ThumbButton kind="up" active={entry?.rating === 'helpful'} disabled={!!entry} onClick={() => submitFeedback(msg.id, 'helpful')} label={t('Mark reply as helpful')} />
            <ThumbButton kind="down" active={entry?.rating === 'not_helpful'} disabled={!!entry} onClick={() => submitFeedback(msg.id, 'not_helpful')} label={t('Mark reply as not helpful')} />
          </div>
        )}
      </div>
    );
  };

  // Phones: one column (the conversation list above the text box). Wide screens: the lesson on the left, with the AIM robot
  // and the text box at the bottom of it, and the conversation as a full-height read-only panel on the right edge whose
  // width can be dragged.
  const col = 'mx-auto w-full max-w-3xl lg:max-w-none'
  const latestTeacher = [...messages].reverse().find((m) => m.role === 'teacher') ?? null;
  const thought = latestTeacher ? { id: latestTeacher.id, text: textOf(latestTeacher), typing: isTyping(latestTeacher) } : null;

  return (
    <div
      data-sheet={showTranscript ? 'open' : 'closed'}
      className="-mb-24 flex min-h-[calc(100dvh-1.5rem)] w-full flex-col md:-mb-8 md:min-h-[calc(100dvh-5rem)] lg:-mx-8 lg:-mt-6 lg:grid lg:h-[calc(100dvh-3.5rem)] lg:w-auto lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_var(--chat-w)] lg:grid-rows-[minmax(0,1fr)_auto] lg:overflow-hidden max-lg:pt-[max(1.5rem,env(safe-area-inset-top))] max-lg:pb-[var(--sheet-pad)] max-lg:transition-[padding] max-lg:duration-300 max-lg:ease-out"
      style={{ ['--chat-w' as string]: `${panel.width}px`, ['--sheet-h' as string]: 'min(52dvh, 30rem)', ['--sheet-pad' as string]: showTranscript ? 'var(--sheet-h)' : '0px' }}
    >
      {/* Left: title, notices and the quick answer */}
      <div className="flex min-w-0 flex-1 flex-col gap-4 lg:flex-none lg:col-start-1 lg:row-start-1 lg:overflow-y-auto lg:ps-8 lg:pe-6 lg:pt-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 lg:max-w-none">
          <div className="[&_h1]:!text-[1.3rem] sm:[&_h1]:!text-2xl">
            <PageTitleBar
              title={isLesson ? navState.lessonTitle! : t('Voice Teacher')}
              fallback={navState.lessonId ? `/lessons/${navState.lessonId}` : '/practice'}
            />
          </div>

          {navState.practice && <PracticeBanner practice={navState.practice} />}
          {navState.focusRecap && <Banner variant="info">{navState.focusRecap}</Banner>}
          {navState.lastSessionRecap && (
            <Banner variant="success">
              <strong>{t('Welcome back.')}</strong> {navState.lastSessionRecap}
            </Banner>
          )}
        </div>

        <section className={`${col} flex flex-1 flex-col items-center justify-end gap-4 py-2 text-center`} aria-label={t('Voice conversation')}>
          {/* The robot and the heading say it on screen; this is for screen readers. */}
          <span className="sr-only" role="status" aria-live="polite">
            {t('Status: {status}', { status: status.label })} {status.heading}
          </span>

          {stageBanners}

          {/* One tap to answer the teacher's "ready to start?" */}
          {onlyGreeting && !submitting && !isHearing && !isTyping(messages[0]) && (
            <Button variant="primary" size="md" onClick={() => void submitText(t('Yes, let’s start.'))}>
              {t('Yes, let’s start')}
            </Button>
          )}

        </section>
      </div>

      {/* Right: the conversation, a full-height read-only side panel (on phones it flows into the page above the text box) */}
      <div className="contents lg:relative lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:flex lg:flex-col lg:border-s lg:border-line lg:bg-surface">
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={t('Resize the conversation panel')}
          aria-valuenow={panel.width}
          aria-valuemin={PANEL_MIN}
          aria-valuemax={PANEL_MAX}
          tabIndex={0}
          title={t('Drag to resize. Double-click to reset.')}
          onPointerDown={panel.onPointerDown}
          onKeyDown={panel.onKeyDown}
          onDoubleClick={panel.reset}
          className="group absolute inset-y-0 -start-1.5 z-20 hidden w-3 cursor-col-resize touch-none outline-none lg:block"
        >
          <span className={`mx-auto block h-full w-0.5 transition-colors group-hover:bg-brand group-focus-visible:bg-brand ${panel.dragging ? 'bg-brand' : 'bg-transparent'}`} />
        </div>

        <aside
          aria-label={t('Conversation')}
          aria-hidden={showTranscript ? undefined : true}
          className={`fixed inset-x-0 bottom-0 z-30 flex h-[var(--sheet-h)] flex-col rounded-t-3xl bg-surface shadow-[0_-8px_32px_rgb(0_0_0/0.14)] ring-1 ring-line transition-[transform,visibility] duration-300 ease-out ${showTranscript ? 'visible translate-y-0' : 'invisible translate-y-full'} lg:visible lg:static lg:h-auto lg:min-h-0 lg:flex-1 lg:translate-y-0 lg:rounded-none lg:shadow-none lg:ring-0`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <h2 className="m-0 text-base font-semibold text-ink">{t('Conversation')}</h2>
            <span className="text-xs text-ink-muted max-lg:hidden">{t('Messages ({n})', { n: messages.length })}</span>
            <button type="button" onClick={() => setShowTranscript(false)} aria-label={t('Hide messages')} title={t('Hide messages')} className="grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-surface-strong text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus lg:hidden">
              <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </button>
          </div>
          <div ref={listRef} role="log" aria-label={t('Voice conversation messages')} className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-4 text-start">
            {messages.length === 0 && (
              <p className="m-0 text-center text-sm text-ink-muted">{t('No messages yet. Tap the microphone or type to start.')}</p>
            )}
            {messages.map(renderMessage)}
            {submitting && (
              <div className="self-start rounded-2xl rounded-es-none bg-surface-sunken px-4 py-3 text-sm text-ink-muted ring-1 ring-line" role="status">
                {t('Your teacher is thinking…')}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* The text box with the AIM robot on its top-left corner (bottom of the left side on wide screens) */}
      <VoiceComposer
        draft={draft}
        onDraftChange={setDraft}
        onSend={() => void submitText(draft)}
        micState={micState}
        onMicToggle={handleMicToggle}
        busy={submitting}
        muted={muted}
        onToggleMute={toggleMute}
        robotState={robotState}
        level={live.level}
        thought={thought}
        footer={
          <button
            type="button"
            onClick={() => setShowTranscript((v) => !v)}
            aria-expanded={showTranscript}
            className="mx-auto mt-2 flex cursor-pointer items-center gap-2 rounded-full border-0 bg-surface-strong px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus lg:hidden"
          >
            <svg aria-hidden="true" className={`size-4 transition-transform ${showTranscript ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15l6-6 6 6" /></svg>
            {showTranscript ? t('Hide messages') : t('Messages ({n})', { n: messages.length })}
          </button>
        }
      />
    </div>
  );
}
