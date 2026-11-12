import { ChatSkeleton } from '../../components/common/Skeleton';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { Markdown } from '../../components/common/Markdown';
import { buttonClasses } from '../../components/common/buttonStyles';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
import { ThumbButton, pillLinkClass } from '../ai-teacher/ui';
import { VoiceComposer, type MicState } from './VoiceComposer';
import { VoiceOrb, type OrbState } from './VoiceOrb';
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
          setFallbackText(reply.text);
        } else {
          const lastTeacher = latest ? [...latest].reverse().find((m) => m.role === 'teacher') : undefined;
          if (lastTeacher) playReply(sourceForMessage(lastTeacher) as AudioSource);
          else setFallbackText(reply.text);
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
          setFallbackText(reply.text);
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

  // ── Render ────────────────────────────────────────────────────────────

  if (loading && !messages) return <ChatSkeleton />;
  if (loadError && !messages) return <ErrorState message={loadError} onRetry={fetchHistory} />;
  if (!messages) return null;

  const isHearing = live.status === 'hearing';
  const isSpeaking = playingKey !== null || loadingKey !== null;
  speakingRef.current = isSpeaking;
  busyRef.current = submitting;
  const micOn = (live.status === 'listening' || live.status === 'hearing') && !micMuted;
  const orbState: OrbState = isHearing ? 'listening' : submitting ? 'thinking' : isSpeaking ? 'speaking' : 'idle';
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
  const lastTeacherSource = lastTeacher ? sourceForMessage(lastTeacher) : null;
  const onlyGreeting = messages.length === 1 && messages[0].isGreeting;
  const isLesson = !!navState.lessonTitle;

  return (
    <div className="-mb-24 flex min-h-[calc(100dvh-1.5rem)] w-full flex-col md:-mb-8 md:min-h-[calc(100dvh-5rem)]">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4">
        <PageTitleBar
          title={isLesson ? navState.lessonTitle! : t('Voice Teacher')}
          subtitle={isLesson ? t('Live lesson with your AI teacher') : t('Practise speaking with your AI teacher')}
          fallback={navState.lessonId ? `/lessons/${navState.lessonId}` : '/practice'}
          action={<Link to={`/ai-teacher/${sessionId}`} className={pillLinkClass}>{t('Text chat')}</Link>}
        />

        {navState.practice && <PracticeBanner practice={navState.practice} />}
        {navState.focusRecap && <Banner variant="info">{navState.focusRecap}</Banner>}
        {navState.lastSessionRecap && (
          <Banner variant="success">
            <strong>{t('Welcome back.')}</strong> {navState.lastSessionRecap}
          </Banner>
        )}

        <section className="flex flex-1 flex-col items-center gap-4 py-2 text-center" aria-label={t('Voice conversation')}>
          <VoiceOrb state={orbState} level={micOn && orbState === 'idle' ? live.level : 0} className="[--vr-size:8.5rem] sm:[--vr-size:11rem]" />
          <span className="rounded-full px-3 py-1 text-sm font-medium text-ink-muted ring-1 ring-line-strong" role="status" aria-live="polite">
            {t('Status: {status}', { status: status.label })}
          </span>
          <p className="lp-display m-0 text-[1.5rem] font-semibold leading-snug text-ink sm:text-[2rem]">{status.heading}</p>

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

          {/* What the teacher is saying, as text, so the student can read along. */}
          {lastTeacher && !showTranscript && (
            <div className="w-full max-w-xl rounded-3xl bg-surface p-5 text-start ring-1 ring-line">
              <div className="max-h-[32vh] overflow-y-auto text-base leading-relaxed text-ink [unicode-bidi:plaintext]">
                <Markdown text={lastTeacher.text} />
              </div>
              {lastTeacherSource && (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    className={buttonClasses('secondary', 'sm')}
                    onClick={() => (isSpeaking ? stopPlayback() : play(lastTeacherSource))}
                  >
                    {isSpeaking ? `■ ${t('Stop audio')}` : `▶ ${t('Play again')}`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* One tap to answer the teacher's "ready to start?" */}
          {onlyGreeting && !submitting && !isHearing && (
            <Button variant="primary" size="md" onClick={() => void submitText(t('Yes, let’s start.'))}>
              {t('Yes, let’s start')}
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={() => setShowTranscript((v) => !v)} aria-expanded={showTranscript}>
            {showTranscript ? t('Hide messages') : t('Messages ({n})', { n: messages.length })}
          </Button>

          {showTranscript && (
            <div className="flex w-full max-w-2xl flex-col gap-3.5 text-start" role="log" aria-label={t('Voice conversation messages')}>
              {messages.length === 0 && (
                <p className="m-0 text-center text-sm text-ink-muted">{t('No messages yet. Tap the microphone or type to start.')}</p>
              )}
              {messages.map((msg) => {
                const isTeacher = msg.role === 'teacher';
                const source = sourceForMessage(msg);
                const key = source ? sourceKey(source) : null;
                const entry = feedback[msg.id];
                return (
                  <div key={msg.id} className={`flex max-w-[88%] flex-col sm:max-w-[78%] ${isTeacher ? 'self-start items-start' : 'self-end items-end'}`}>
                    <div
                      className={`whitespace-pre-wrap break-words rounded-2xl p-4 text-base leading-relaxed ${
                        isTeacher ? 'rounded-es-none bg-surface text-ink ring-1 ring-line' : 'rounded-ee-none bg-brand text-on-brand'
                      }`}
                    >
                      {isTeacher ? <Markdown text={msg.text} /> : msg.text}
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
              })}
            </div>
          )}
        </section>
      </div>

      <VoiceComposer
        draft={draft}
        onDraftChange={setDraft}
        onSend={() => void submitText(draft)}
        micState={micState}
        onMicToggle={handleMicToggle}
        busy={submitting}
        muted={muted}
        onToggleMute={toggleMute}
      />
    </div>
  );
}
