import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { aiTeacherApi, GENERAL_CONTEXT_REF, lessonContextRef, type FeedbackRating } from '../ai-teacher/aiTeacherApi';
import { useVoiceRecorder, type RecordingResult } from './useVoiceRecorder';
import {
  MAX_AUDIO_SIZE_BYTES,
  MAX_RECORDING_MS,
  MIN_RECORDING_MS,
  voiceTeacherApi,
  type VoiceMessage,
} from './voiceTeacherApi';
import styles from './VoiceTeacher.module.css';

interface VoiceLocationState {
  lessonTitle?: string | null;
  lastSessionRecap?: string | null;
  focusRecap?: string | null;
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
      .catch((err) => setError(getErrorMessage(err, 'Could not start a Voice Teacher session.')));
  }, [contextRef, lessonTitle, navigate]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    start();
  }, [start]);

  if (error) return <ErrorState message={error} onRetry={start} />;
  return (
    <div className={styles.centered}>
      <LoadingSpinner />
      <p className={styles.muted}>Starting Voice Teacher session…</p>
    </div>
  );
}

function VoiceConversation({ sessionId }: { sessionId: string }) {
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
          setPlaybackNotice('Audio is not available for this reply right now. You can read it in the messages.');
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
      setPlaybackNotice('This audio could not be played in your browser.');
    };
    audio.src = url;
    try {
      await audio.play();
      if (mountedRef.current && request === playRequest.current) setPlayingKey(key);
    } catch (err) {
      if (!mountedRef.current) return;
      setPlayingKey(null);
      if ((err as { name?: string } | null)?.name === 'NotAllowedError') {
        setPlaybackNotice('Your browser blocked autoplay. Press play on the reply to listen.');
      }
    }
  }, []);

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
      .catch((err) => setLoadError(getErrorMessage(err, 'Voice Teacher is temporarily unavailable. Please try again.')))
      .finally(() => setLoading(false));
  }, [sessionId]);

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
        setTurnError('No audio was recorded. Please try again.');
        return;
      }
      if (result.durationMs < MIN_RECORDING_MS) {
        setTurnError('That was too short. Tap the microphone, speak, then tap again to send.');
        return;
      }
      if (result.blob.size > MAX_AUDIO_SIZE_BYTES) {
        setTurnError('That recording is too large. Please keep your answer shorter.');
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
        if (mountedRef.current) setTurnError(getErrorMessage(err, 'Your answer could not be sent. Please try again.'));
      } finally {
        if (mountedRef.current) setSubmitting(false);
      }
    },
    [sessionId, play],
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
        setTurnError(getErrorMessage(err, 'Could not send feedback. Please try again.'));
      });
  }

  // ── Render ────────────────────────────────────────────────────────────

  if (loading && !messages) return <LoadingSpinner />;
  if (loadError && !messages) return <ErrorState message={loadError} onRetry={fetchHistory} />;
  if (!messages) return null;

  const isRecording = recorder.status === 'recording';
  const isSpeaking = playingKey !== null || loadingKey !== null;
  const status = isRecording
    ? { label: 'Recording', heading: 'Listening to you…' }
    : submitting
      ? { label: 'Processing', heading: 'Processing your answer…' }
      : isSpeaking
        ? { label: 'Speaking', heading: 'Your teacher is speaking…' }
        : { label: 'Ready', heading: 'Your turn — tap the microphone to speak' };

  const micBlocked = recorder.status === 'unsupported' || recorder.status === 'denied';
  const lastTeacher = [...messages].reverse().find((m) => m.role === 'teacher');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/ai-teacher" className={styles.iconLink} aria-label="Back to AI Teacher">
          <span className={styles.backArrow} aria-hidden="true">←</span>
        </Link>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Voice Teacher</h1>
          <span className={styles.subtitle}>
            {navState.lessonTitle || 'Practise speaking with your AI teacher'}
          </span>
        </div>
        <Link to={`/ai-teacher/${sessionId}`} className={styles.headerLink}>
          Text chat
        </Link>
      </div>

      {navState.focusRecap && <Banner variant="info">{navState.focusRecap}</Banner>}
      {navState.lastSessionRecap && (
        <Banner variant="success">
          <strong>Welcome back.</strong> {navState.lastSessionRecap}
        </Banner>
      )}

      <section className={styles.stage} aria-label="Voice conversation">
        <div className={`${styles.avatar} ${isSpeaking ? styles.avatarSpeaking : ''}`} aria-hidden="true">
          🎓
        </div>
        <span className={styles.statusPill} role="status" aria-live="polite">
          Status: {status.label}
        </span>
        <p className={styles.heading}>{status.heading}</p>

        {lastTeacher && !showTranscript && (
          <p className={styles.lastReply}>{lastTeacher.text}</p>
        )}

        {recorder.status === 'unsupported' && (
          <Banner variant="warning">
            Voice recording isn&apos;t available in this browser. Use a recent version of Chrome, Edge, Firefox or
            Safari over a secure (https) connection — or continue in{' '}
            <Link to={`/ai-teacher/${sessionId}`}>text chat</Link>.
          </Banner>
        )}
        {recorder.status === 'denied' && (
          <Banner variant="error">
            Microphone permission was denied. Allow microphone access for this site in your browser settings, then
            try again.{' '}
            <button type="button" className={styles.inlineButton} onClick={recorder.reset}>
              Try again
            </button>
          </Banner>
        )}
        {recorder.status === 'error' && recorder.errorMessage && (
          <Banner variant="error">{recorder.errorMessage}</Banner>
        )}
        {turnError && <Banner variant="error">{turnError}</Banner>}
        {fallbackText && <Banner variant="warning">{fallbackText}</Banner>}
        {playbackNotice && <Banner variant="info">{playbackNotice}</Banner>}

        <button
          type="button"
          className={`${styles.micButton} ${isRecording ? styles.micRecording : ''}`}
          onClick={handleMicClick}
          disabled={submitting || micBlocked || recorder.status === 'requesting'}
          aria-pressed={isRecording}
          aria-label={isRecording ? 'Stop recording and send' : 'Start recording'}
        >
          <span aria-hidden="true">{submitting ? '…' : isRecording ? '■' : '🎙'}</span>
        </button>
        <span className={styles.micHint}>
          {recorder.status === 'requesting'
            ? 'Waiting for microphone permission…'
            : isRecording
              ? `${formatSeconds(recorder.elapsedMs)} / ${formatSeconds(MAX_RECORDING_MS)} — tap to send`
              : submitting
                ? 'Sending your answer…'
                : 'Tap to speak'}
        </span>

        {isSpeaking && (
          <Button variant="secondary" size="sm" onClick={stopPlayback}>
            Stop audio
          </Button>
        )}
      </section>

      <div className={styles.transcriptToggle}>
        <Button variant="ghost" size="sm" onClick={() => setShowTranscript((v) => !v)} aria-expanded={showTranscript}>
          {showTranscript ? 'Hide messages' : `Messages (${messages.length})`}
        </Button>
      </div>

      {showTranscript && (
        <div className={styles.transcript} role="log" aria-label="Voice conversation messages">
          {messages.length === 0 && <p className={styles.muted}>No messages yet. Tap the microphone to start.</p>}
          {messages.map((msg) => {
            const isTeacher = msg.role === 'teacher';
            const source = sourceForMessage(msg);
            const key = source ? sourceKey(source) : null;
            const entry = feedback[msg.id];
            return (
              <div key={msg.id} className={`${styles.message} ${isTeacher ? styles.messageTeacher : styles.messageStudent}`}>
                <div className={styles.messageText}>{msg.text}</div>
                <div className={styles.messageMeta}>
                  <span>
                    {msg.channel === 'voice' ? '🎙 ' : ''}
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {source && key && (
                    <button
                      type="button"
                      className={styles.playButton}
                      onClick={() => (playingKey === key ? stopPlayback() : play(source))}
                      disabled={loadingKey === key || isRecording}
                      aria-label={playingKey === key ? 'Stop audio' : 'Play audio'}
                    >
                      {loadingKey === key ? 'Loading…' : playingKey === key ? '■ Stop' : '▶ Play'}
                    </button>
                  )}
                </div>
                {isTeacher && (
                  <div className={styles.feedbackRow}>
                    <span className={styles.feedbackLabel}>
                      {entry?.status === 'done' ? 'Thanks for your feedback' : 'Was this helpful?'}
                    </span>
                    <button
                      type="button"
                      className={`${styles.feedbackBtn} ${entry?.rating === 'helpful' ? styles.feedbackBtnActive : ''}`}
                      onClick={() => submitFeedback(msg.id, 'helpful')}
                      disabled={!!entry}
                      aria-pressed={entry?.rating === 'helpful'}
                      aria-label="Mark reply as helpful"
                    >
                      👍
                    </button>
                    <button
                      type="button"
                      className={`${styles.feedbackBtn} ${entry?.rating === 'not_helpful' ? styles.feedbackBtnActive : ''}`}
                      onClick={() => submitFeedback(msg.id, 'not_helpful')}
                      disabled={!!entry}
                      aria-pressed={entry?.rating === 'not_helpful'}
                      aria-label="Mark reply as not helpful"
                    >
                      👎
                    </button>
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
