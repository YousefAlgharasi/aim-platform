import { ChatSkeleton } from '../../components/common/Skeleton';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { Markdown } from '../../components/common/Markdown';
import { buttonClasses } from '../../components/common/buttonStyles';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { ErrorState } from '../../components/common/ErrorState';
import { aiTeacherApi, GENERAL_CONTEXT_REF, lessonContextRef, type FeedbackRating } from '../ai-teacher/aiTeacherApi';
import { useVoiceRecorder, type RecordingResult } from './useVoiceRecorder';
import {
  MAX_AUDIO_SIZE_BYTES,
  MAX_RECORDING_MS,
  MIN_RECORDING_MS,
  voiceTeacherApi,
  type VoiceMessage,
} from './voiceTeacherApi';
import { MicIcon } from '../../components/common/Icons';
import { ThumbButton, pillLinkClass } from '../ai-teacher/ui';
import { useI18n } from '../../i18n/I18nContext';
import { PracticeBanner } from '../practice-topics/PracticeBanner';
import type { PracticeSessionState } from '../practice-topics/practiceTopicsApi';

const WAVE_HEIGHTS = [4, 8, 14, 22, 16, 28, 18, 12, 24, 15, 8, 5];

interface VoiceLocationState {
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

function formatSeconds(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
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
          lessonTitle,
          lastSessionRecap: session.lastSessionRecap,
          focusRecap: session.focusRecap,
        };
        navigate(`/voice-teacher/${session.sessionId}`, { replace: true, state });
      })
      .catch((err) => setError(getErrorMessage(err, t('Could not start a Voice Teacher session.'))));
  }, [contextRef, lessonTitle, navigate, t]);

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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlCache = useRef(new Map<string, string>());
  const mountedRef = useRef(true);
  const greetingHandled = useRef(false);
  const playRequest = useRef(0);

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
      if (source) play(source);
    }
  }, [messages, play]);

  // ── Recording turn ────────────────────────────────────────────────────

  const submitRecording = useCallback(
    async (result: RecordingResult | null) => {
      if (!result) {
        setTurnError(t('No audio was recorded. Please try again.'));
        return;
      }
      if (result.durationMs < MIN_RECORDING_MS) {
        setTurnError(t('That was too short. Tap the microphone, speak, then tap again to send.'));
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
          play({ kind: 'ref', audioRef: reply.audioRef });
        } else if (reply.isFallback) {
          setFallbackText(reply.text);
        } else {
          const lastTeacher = latest ? [...latest].reverse().find((m) => m.role === 'teacher') : undefined;
          if (lastTeacher) play(sourceForMessage(lastTeacher) as AudioSource);
          else setFallbackText(reply.text);
        }
      } catch (err) {
        if (mountedRef.current) setTurnError(getErrorMessage(err, t('Your answer could not be sent. Please try again.')));
      } finally {
        if (mountedRef.current) setSubmitting(false);
      }
    },
    [sessionId, play, t],
  );

  const recorder = useVoiceRecorder((result) => {
    // Auto-stopped at the maximum duration.
    submitRecording(result);
  });

  async function handleMicClick() {
    if (submitting) return;
    if (recorder.status === 'recording') {
      const result = await recorder.stop();
      await submitRecording(result);
      return;
    }
    // Barge-in: stop the teacher's audio before recording (Flutter P21-018).
    stopPlayback();
    setTurnError('');
    setFallbackText(null);
    await recorder.start();
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

  const isRecording = recorder.status === 'recording';
  const isSpeaking = playingKey !== null || loadingKey !== null;
  const status = isRecording
    ? { label: t('Recording'), heading: t('Listening to you…') }
    : submitting
      ? { label: t('Processing'), heading: t('Processing your answer…') }
      : isSpeaking
        ? { label: t('Teacher speaking'), heading: t('Your teacher is speaking…') }
        : { label: t('Ready'), heading: t('Your turn — tap the microphone to speak') };

  const micBlocked = recorder.status === 'unsupported' || recorder.status === 'denied';
  const lastTeacher = [...messages].reverse().find((m) => m.role === 'teacher');

  const waveActive = isRecording || isSpeaking;

  return (
    <div className="flex flex-col gap-4 w-full">
      <PageTitleBar
        title={t('Voice Teacher')}
        subtitle={navState.lessonTitle || t('Practise speaking with your AI teacher')}
        fallback="/practice"
        action={<Link to={`/ai-teacher/${sessionId}`} className={pillLinkClass}>{t('Text chat')}</Link>}
      />

      {navState.practice && <PracticeBanner practice={navState.practice} />}
      {navState.focusRecap && <Banner variant="info">{navState.focusRecap}</Banner>}
      {navState.lastSessionRecap && (
        <Banner variant="success">
          <strong>{t('Welcome back.')}</strong> {navState.lastSessionRecap}
        </Banner>
      )}

      <section
        className="relative overflow-hidden rounded-2xl bg-surface px-5 py-8 ring-1 ring-line flex flex-col items-center text-center gap-3 sm:px-8"
        aria-label={t('Voice conversation')}
      >
        <span
          className="rounded-full px-3 py-1 text-sm font-medium text-ink-muted ring-1 ring-line-strong"
          role="status"
          aria-live="polite"
        >
          {t('Status: {status}', { status: status.label })}
        </span>
        <p className="lp-display m-0 text-[1.75rem] font-semibold leading-snug text-ink sm:text-[2.25rem]">
          {status.heading}
        </p>

        {lastTeacher && !showTranscript && (
          <p className="m-0 max-w-xl text-sm leading-relaxed text-ink-soft bg-surface dark:bg-surface-sunken/60 ring-1 ring-line/80 rounded-2xl rounded-es-none p-4 text-start">
            {lastTeacher.text}
          </p>
        )}

        <div className="w-full max-w-md flex flex-col gap-2 empty:hidden text-start">
          {recorder.status === 'unsupported' && (
            <Banner variant="warning">
              {t("Voice recording isn't available in this browser. Use a recent version of Chrome, Edge, Firefox or Safari over a secure (https) connection.")}{' '}
              <Link to={`/ai-teacher/${sessionId}`}>{t('Continue in text chat')}</Link>
            </Banner>
          )}
          {recorder.status === 'denied' && (
            <Banner variant="error">
              {t('Microphone permission was denied. Allow microphone access for this site in your browser settings, then try again.')}{' '}
              <button type="button" className="bg-transparent border-none p-0 underline font-semibold text-inherit cursor-pointer" onClick={recorder.reset}>
                {t('Try again')}
              </button>
            </Banner>
          )}
          {recorder.status === 'error' && recorder.errorMessage && (
            <Banner variant="error">{recorder.errorMessage}</Banner>
          )}
          {turnError && <Banner variant="error">{turnError}</Banner>}
          {fallbackText && <Banner variant="warning">{fallbackText}</Banner>}
          {playbackNotice && <Banner variant="info">{playbackNotice}</Banner>}
        </div>

        <div className="flex flex-col items-center justify-center py-4">
          <div className="flex items-end gap-1.5 h-10 mb-6" aria-hidden="true">
            {WAVE_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-200 ${
                  waveActive ? 'bg-brand dark:bg-brand-ink animate-pulse' : 'bg-surface-strong'
                }`}
                style={{ height: `${waveActive ? h * 1.5 : 8}px` }}
              />
            ))}
          </div>

          <div className="relative">
            {isRecording && (
              <>
                <div className="absolute -inset-6 rounded-full bg-brand/10 animate-ping" aria-hidden="true" />
                <div className="absolute -inset-3 rounded-full bg-brand/20" aria-hidden="true" />
              </>
            )}
            <button
              type="button"
              onClick={handleMicClick}
              disabled={submitting || micBlocked || recorder.status === 'requesting'}
              aria-pressed={isRecording}
              aria-label={isRecording ? t('Stop recording and send') : t('Start recording')}
              className={`size-28 rounded-full border-none cursor-pointer flex items-center justify-center relative transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording
                  ? 'bg-danger text-white'
                  : 'bg-brand text-white ring-8 ring-brand/15 hover:bg-brand-hover'
              }`}
            >
              {submitting ? (
                <span className="text-3xl font-black leading-none" aria-hidden="true">…</span>
              ) : isRecording ? (
                <span className="size-8 rounded-md bg-white" aria-hidden="true" />
              ) : (
                <MicIcon className="size-10 text-white" />
              )}
            </button>
          </div>

          <p className={`mb-0 mt-5 text-base font-semibold ${isRecording ? 'text-danger-ink' : 'text-ink-muted'}`}>
            {recorder.status === 'requesting'
              ? t('Waiting for microphone permission…')
              : isRecording
                ? t('Listening… tap to send')
                : submitting
                  ? t('Sending your answer…')
                  : t('Tap to speak')}
          </p>
          {isRecording && (
            <span className="lp-num mt-1 text-sm font-semibold tracking-widest text-ink">
              {formatSeconds(recorder.elapsedMs)} / {formatSeconds(MAX_RECORDING_MS)}
            </span>
          )}
        </div>

        {isSpeaking && (
          <Button variant="secondary" size="sm" onClick={stopPlayback}>
            {t('Stop audio')}
          </Button>
        )}
      </section>

      <div className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={() => setShowTranscript((v) => !v)} aria-expanded={showTranscript}>
          {showTranscript ? t('Hide messages') : t('Messages ({n})', { n: messages.length })}
        </Button>
      </div>

      {showTranscript && (
        <div className="flex flex-col gap-3.5" role="log" aria-label={t('Voice conversation messages')}>
          {messages.length === 0 && (
            <p className="m-0 text-center text-sm text-ink-muted">{t('No messages yet. Tap the microphone to start.')}</p>
          )}
          {messages.map((msg) => {
            const isTeacher = msg.role === 'teacher';
            const source = sourceForMessage(msg);
            const key = source ? sourceKey(source) : null;
            const entry = feedback[msg.id];
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[88%] sm:max-w-[78%] ${isTeacher ? 'self-start items-start' : 'self-end items-end'}`}
              >
                <div
                  className={`p-4 rounded-2xl text-base leading-relaxed whitespace-pre-wrap break-words ${
                    isTeacher
                      ? 'bg-surface ring-1 ring-line text-ink rounded-es-none'
                      : 'bg-brand text-white rounded-ee-none'
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
                      disabled={loadingKey === key || isRecording}
                      aria-label={playingKey === key ? t('Stop audio') : t('Play audio')}
                    >
                      {loadingKey === key ? t('Loading…') : playingKey === key ? `■ ${t('Stop')}` : `▶ ${t('Play')}`}
                    </button>
                  )}
                </div>
                {isTeacher && (
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-xs text-ink-muted">
                      {entry?.status === 'done' ? t('Thanks for your feedback') : t('Was this helpful?')}
                    </span>
                    <ThumbButton
                      kind="up"
                      active={entry?.rating === 'helpful'}
                      disabled={!!entry}
                      onClick={() => submitFeedback(msg.id, 'helpful')}
                      label={t('Mark reply as helpful')}
                    />
                    <ThumbButton
                      kind="down"
                      active={entry?.rating === 'not_helpful'}
                      disabled={!!entry}
                      onClick={() => submitFeedback(msg.id, 'not_helpful')}
                      label={t('Mark reply as not helpful')}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
