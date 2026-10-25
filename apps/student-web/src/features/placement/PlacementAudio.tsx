import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/common/Button';
import { getErrorMessage } from '../../api/client';
import { SPEAKING_AUDIO_TYPES, SPEAKING_MAX_BYTES } from './placementApi';
import styles from './Placement.module.css';

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
    return <p className={styles.audioNote}>Audio for this question isn't available yet.</p>;
  }

  return (
    <div className={styles.audioBox}>
      {url ? (
        <audio controls autoPlay src={url} className={styles.audioPlayer} />
      ) : (
        <Button variant="secondary" size="sm" onClick={handleLoad} disabled={loading}>
          {loading ? 'Loading audio…' : '▶ Play audio'}
        </Button>
      )}
      {error && (
        <p className={styles.audioError} role="alert">
          {error}{' '}
          <button type="button" className={styles.linkButton} onClick={handleLoad}>Retry</button>
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
    return <p className={styles.audioNote}>Your browser does not support audio recording. You can skip this question.</p>;
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className={styles.audioBox}>
      <div className={styles.recorderRow}>
        {recording ? (
          <Button variant="secondary" onClick={stop}>■ Stop recording</Button>
        ) : (
          <Button variant="secondary" onClick={start} disabled={disabled}>
            {previewUrl ? '● Record again' : '● Start recording'}
          </Button>
        )}
        {recording && (
          <span className={styles.recordingIndicator} aria-live="polite">
            Recording {mm}:{ss} / 01:00
          </span>
        )}
      </div>
      {previewUrl && !recording && (
        <audio controls src={previewUrl} className={styles.audioPlayer} />
      )}
      {error && <p className={styles.audioError} role="alert">{error}</p>}
    </div>
  );
}
