import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../../api/client';
import { useI18n } from '../../i18n/I18nContext';
import { SPEAKING_AUDIO_TYPES, SPEAKING_MAX_BYTES } from './placementApi';


// ---------------------------------------------------------------------------
// Listening audio — fetched through the authenticated backend endpoint.
// ---------------------------------------------------------------------------

// The backend synthesizes listening audio on the first request, which can take several seconds.
// Keep what was already fetched (and any request still in flight) so revisiting a question, a
// StrictMode double-mount or a retry never pays that cost twice.
const MAX_CACHED_CLIPS = 20;
const blobCache = new Map<string, Blob>();
const inFlight = new Map<string, Promise<Blob | null>>();

function loadOnce(key: string | undefined, load: () => Promise<Blob | null>): Promise<Blob | null> {
  if (!key) return load();
  const cached = blobCache.get(key);
  if (cached) return Promise.resolve(cached);
  const pending = inFlight.get(key);
  if (pending) return pending;
  const request = load()
    .then((blob) => {
      if (blob) {
        blobCache.set(key, blob);
        if (blobCache.size > MAX_CACHED_CLIPS) blobCache.delete(blobCache.keys().next().value as string);
      }
      return blob;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, request);
  return request;
}

function formatClock(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? Math.floor(totalSeconds) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

/** Seconds of waiting after which "Preparing audio…" gets a reassuring second line. */
const SLOW_LOAD_HINT_MS = 4000;

interface QuestionAudioProps {
  /** Loads the audio; resolves null when the backend has no audio yet (204). */
  load: () => Promise<Blob | null>;
  /** When false, the backend reported no listening script — skip the request. */
  available?: boolean;
  /** Identifies the clip so it is fetched once per question, however often the question is shown. */
  cacheKey?: string;
  /** Start fetching as soon as the question is shown, so the clip is ready when the student taps play. */
  prefetch?: boolean;
}

export function QuestionAudio({ load, available = true, cacheKey, prefetch = false }: QuestionAudioProps) {
  const { t } = useI18n();
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState('');
  const [missing, setMissing] = useState(!available);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const urlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playWhenReady = useRef(false);
  const unmounted = useRef(false);

  useEffect(() => {
    unmounted.current = false;
    return () => {
      unmounted.current = true;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      setSlow(false);
      return;
    }
    const timer = window.setTimeout(() => setSlow(true), SLOW_LOAD_HINT_MS);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const fetchClip = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const blob = await loadOnce(cacheKey, load);
      if (unmounted.current) return;
      if (!blob) {
        setMissing(true);
        return;
      }
      const objectUrl = URL.createObjectURL(blob);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = objectUrl;
      setUrl(objectUrl);
    } catch (err) {
      if (!unmounted.current) setError(getErrorMessage(err, t('Could not load the audio.')));
    } finally {
      if (!unmounted.current) setLoading(false);
    }
    // `load` is a fresh closure every render; the clip is identified by cacheKey.
  }, [cacheKey, t]);

  useEffect(() => {
    if (prefetch && available) void fetchClip();
    // Only on first show of the question.
  }, []);

  useEffect(() => {
    if (url && playWhenReady.current) {
      playWhenReady.current = false;
      audioRef.current?.play().catch(() => undefined);
    }
  }, [url]);

  function requestPlay() {
    if (!url) {
      playWhenReady.current = true;
      void fetchClip();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.ended) audio.currentTime = 0;
    if (audio.paused) audio.play().catch(() => undefined);
    else audio.pause();
  }

  if (missing) {
    return <p className="m-0 text-sm text-slate-500 dark:text-slate-400">{t("Audio for this question isn't available yet.")}</p>;
  }

  const ended = !playing && duration > 0 && time >= duration - 0.05;
  const buttonLabel = loading
    ? t('Loading audio…')
    : playing
      ? t('Pause audio')
      : ended
        ? t('Replay audio')
        : t('Play audio');

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3" dir="ltr">
        <button
          type="button"
          onClick={requestPlay}
          disabled={loading}
          aria-label={buttonLabel}
          className="relative size-10 shrink-0 cursor-pointer rounded-full border-0 bg-[#0F172A] text-white transition-transform duration-150 hover:bg-slate-700 active:scale-95 disabled:cursor-progress disabled:bg-slate-400 dark:bg-white dark:text-[#0F172A] dark:hover:bg-slate-200 dark:disabled:bg-slate-500"
        >
          {loading ? (
            <svg className="absolute inset-0 m-auto size-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : playing ? (
            <svg className="absolute inset-0 m-auto size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : ended ? (
            <svg className="absolute inset-0 m-auto size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
          ) : (
            <svg className="absolute inset-0 m-auto size-4 translate-x-px" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {url ? (
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(time, duration || 0)}
            disabled={!duration}
            onChange={(e) => {
              const next = Number(e.target.value);
              setTime(next);
              if (audioRef.current) audioRef.current.currentTime = next;
            }}
            aria-label={t('Audio position')}
            aria-valuetext={t('{current} of {total}', { current: formatClock(time), total: formatClock(duration) })}
            className="h-1 min-w-0 flex-1 cursor-pointer accent-[#0F172A] dark:accent-white"
          />
        ) : (
          <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden="true">
            {loading && <div className="h-full w-1/3 animate-pulse rounded-full bg-slate-500 dark:bg-slate-300" />}
          </div>
        )}

        <span className="shrink-0 text-xs font-medium tabular-nums text-slate-600 dark:text-slate-300">
          {formatClock(time)} / {url && duration ? formatClock(duration) : '--:--'}
        </span>
      </div>

      {/* Visually hidden: keeps the wait from being silent for screen-reader users. */}
      <p className="sr-only" role="status" aria-live="polite">
        {loading ? (slow ? t('Still preparing the audio. This can take a few seconds.') : t('Preparing audio…')) : ''}
      </p>

      {url && (
        <audio
          ref={audioRef}
          src={url}
          preload="auto"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      )}

      {error && (
        <p className="m-0 text-xs text-red-700 dark:text-red-400" role="alert">
          {error}{' '}
          <button type="button" className="cursor-pointer border-0 bg-transparent p-0 py-2 font-semibold text-[#4F46E5] underline dark:text-indigo-400" onClick={() => void fetchClip()}>{t('Retry')}</button>
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Speaking recorder — browser MediaRecorder.
// ---------------------------------------------------------------------------

const MAX_RECORDING_SECONDS = 60;

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return undefined;
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/mp4'];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}

interface SpeakingRecorderProps {
  disabled?: boolean;
  onRecorded: (audio: Blob | null) => void;
}

export function SpeakingRecorder({ disabled, onRecorded }: SpeakingRecorderProps) {
  const { t } = useI18n();
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const previewRef = useRef<string | null>(null);

  const supported =
    typeof window !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia;

  function stopTracks() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
    stopTracks();
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  function setPreview(blob: Blob | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = blob ? URL.createObjectURL(blob) : null;
    setPreviewUrl(previewRef.current);
  }

  async function start() {
    setError('');
    setPreview(null);
    onRecorded(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stopTracks();
        setRecording(false);
        const rawType = (recorder.mimeType || mimeType || 'audio/webm').split(';')[0].trim();
        const blob = new Blob(chunksRef.current, { type: rawType });
        if (!SPEAKING_AUDIO_TYPES.includes(rawType)) {
          setError(t('Your browser recorded an unsupported audio format ({type}).', { type: rawType }));
          return;
        }
        if (blob.size === 0) {
          setError(t('No audio was captured. Please try again.'));
          return;
        }
        if (blob.size > SPEAKING_MAX_BYTES) {
          setError(t('The recording is too large. Please record a shorter answer.'));
          return;
        }
        setPreview(blob);
        onRecorded(blob);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_RECORDING_SECONDS && recorder.state === 'recording') recorder.stop();
          return s + 1;
        });
      }, 1000);
    } catch {
      stopTracks();
      setRecording(false);
      setError(t('Microphone access is needed to record your answer. Check your browser permissions.'));
    }
  }

  function stop() {
    if (recorderRef.current && recorderRef.current.state === 'recording') recorderRef.current.stop();
  }

  if (!supported) {
    return <p className="m-0 text-sm text-slate-500 dark:text-slate-400">{t('Your browser does not support audio recording. You can skip this question.')}</p>;
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="relative">
        {recording && <span className="absolute -inset-4 rounded-full bg-[#4F46E5]/10 animate-ping" />}
        <button
          type="button"
          onClick={recording ? stop : start}
          disabled={!recording && disabled}
          aria-label={recording ? t('Stop recording') : previewUrl ? t('Record again') : t('Start recording')}
          className={`relative size-24 rounded-full border-0 cursor-pointer flex items-center justify-center shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
            recording ? 'bg-red-500 hover:bg-red-600 shadow-red-200 dark:shadow-red-950' : 'bg-[#4F46E5] hover:bg-[#4338CA] shadow-indigo-200 dark:shadow-indigo-950'
          }`}
        >
          {recording ? (
            <svg className="size-9 text-white" viewBox="0 0 24 24" fill="white" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
          ) : (
            <svg className="size-9 text-white" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
              <path d="M19 11a7 7 0 0 1-14 0M12 18v4M8 22h8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>
      <div className="text-center">
        <p className={`m-0 text-sm font-medium ${recording ? 'text-red-500 dark:text-red-400' : 'text-[#64748B] dark:text-slate-400'}`}>
          {recording ? t('Recording… tap to stop') : previewUrl ? t('Tap to record again') : t('Tap to start recording')}
        </p>
        {recording && (
          <p className="m-0 mt-1.5 font-mono text-xs font-semibold tracking-widest text-[#4F46E5] dark:text-indigo-400" aria-live="polite">
            {t('Recording {time} / 01:00', { time: `${mm}:${ss}` })}
          </p>
        )}
      </div>
      {previewUrl && !recording && <audio controls src={previewUrl} className="w-full" />}
      {error && <p className="m-0 text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>}
    </div>
  );
}
