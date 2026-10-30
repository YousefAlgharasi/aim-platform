import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../../api/client';
import { useI18n } from '../../i18n/I18nContext';
import { AudioPlayer } from '../../components/common/AudioPlayer';
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
  const urlRef = useRef<string | null>(null);
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

  if (missing) {
    return <p className="m-0 text-sm text-slate-500 dark:text-slate-400">{t("Audio for this question isn't available yet.")}</p>;
  }

  return (
    <AudioPlayer
      src={url}
      onRequestSource={() => void fetchClip()}
      loading={loading}
      slow={slow}
      label={t('Listen')}
      preload="auto"
      footer={
        error ? (
          <p className="m-0 text-xs text-red-700 dark:text-red-400" role="alert">
            {error}{' '}
            <button type="button" className="cursor-pointer border-0 bg-transparent p-0 py-2 font-semibold text-[#4F46E5] underline dark:text-indigo-400" onClick={() => void fetchClip()}>{t('Retry')}</button>
          </p>
        ) : null
      }
    />
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
      {previewUrl && !recording && <AudioPlayer src={previewUrl} label={t('Your recording')} />}
      {error && <p className="m-0 text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>}
    </div>
  );
}
