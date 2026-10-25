import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/common/Button';
import { getErrorMessage } from '../../api/client';
import { SPEAKING_AUDIO_TYPES, SPEAKING_MAX_BYTES } from './placementApi';


// ---------------------------------------------------------------------------
// Listening audio — fetched through the authenticated backend endpoint.
// ---------------------------------------------------------------------------

interface QuestionAudioProps {
  /** Loads the audio; resolves null when the backend has no audio yet (204). */
  load: () => Promise<Blob | null>;
  /** When false, the backend reported no listening script — skip the request. */
  available?: boolean;
}

export function QuestionAudio({ load, available = true }: QuestionAudioProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [missing, setMissing] = useState(!available);
  const urlRef = useRef<string | null>(null);

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  async function handleLoad() {
    setLoading(true);
    setError('');
    try {
      const blob = await load();
      if (!blob) {
        setMissing(true);
        return;
      }
      const objectUrl = URL.createObjectURL(blob);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = objectUrl;
      setUrl(objectUrl);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load the audio.'));
    } finally {
      setLoading(false);
    }
  }

  if (missing) {
    return <p className="m-0 text-sm text-slate-500 dark:text-slate-400">Audio for this question isn't available yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2 bg-[#EEF2FF] dark:bg-indigo-950/60 rounded-2xl px-4 py-3">
      {url ? (
        <audio controls autoPlay src={url} className="w-full" />
      ) : (
        <button
          type="button"
          onClick={handleLoad}
          disabled={loading}
          className="self-start inline-flex items-center gap-3 border-0 bg-transparent p-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="size-10 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] flex items-center justify-center shadow-sm">
            <svg className="size-5 text-white" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          </span>
          <span className="text-sm font-semibold text-[#4F46E5] dark:text-indigo-400">
            {loading ? 'Loading audio…' : 'Play audio'}
          </span>
        </button>
      )}
      {error && (
        <p className="m-0 text-xs text-red-600 dark:text-red-400" role="alert">
          {error}{' '}
          <button type="button" className="border-0 bg-transparent p-0 font-semibold text-[#4F46E5] dark:text-indigo-400 underline cursor-pointer" onClick={handleLoad}>Retry</button>
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
          setError(`Your browser recorded an unsupported audio format (${rawType}).`);
          return;
        }
        if (blob.size === 0) {
          setError('No audio was captured. Please try again.');
          return;
        }
        if (blob.size > SPEAKING_MAX_BYTES) {
          setError('The recording is too large. Please record a shorter answer.');
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
      setError('Microphone access is needed to record your answer. Check your browser permissions.');
    }
  }

  function stop() {
    if (recorderRef.current && recorderRef.current.state === 'recording') recorderRef.current.stop();
  }

  if (!supported) {
    return <p className="m-0 text-sm text-slate-500 dark:text-slate-400">Your browser does not support audio recording. You can skip this question.</p>;
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
          aria-label={recording ? 'Stop recording' : previewUrl ? 'Record again' : 'Start recording'}
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
          {recording ? 'Recording… tap to stop' : previewUrl ? 'Tap to record again' : 'Tap to start recording'}
        </p>
        {recording && (
          <p className="m-0 mt-1.5 font-mono text-xs font-semibold tracking-widest text-[#4F46E5] dark:text-indigo-400" aria-live="polite">
            Recording {mm}:{ss} / 01:00
          </p>
        )}
      </div>
      {previewUrl && !recording && <audio controls src={previewUrl} className="w-full" />}
      {error && <p className="m-0 text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>}
    </div>
  );
}
