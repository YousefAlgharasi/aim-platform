import { useCallback, useEffect, useRef, useState } from 'react';
import { ALLOWED_AUDIO_MIME_TYPES, MAX_RECORDING_MS } from './voiceTeacherApi';
import { t } from '../../i18n';

export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'denied' | 'unsupported' | 'error';

export interface RecordingResult {
  blob: Blob;
  mimeType: string;
  durationMs: number;
}

// Preferred order: containers the backend accepts, best browser support first.
const CANDIDATE_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/ogg',
  'audio/mp4',
];

function baseMime(mime: string): string {
  return mime.split(';')[0].trim().toLowerCase();
}

export function isRecordingSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  );
}

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder.isTypeSupported !== 'function') return undefined;
  return CANDIDATE_MIME_TYPES.find((type) => {
    try {
      return MediaRecorder.isTypeSupported(type);
    } catch {
      return false;
    }
  });
}

/**
 * Microphone recording via MediaRecorder, producing a Blob in a container the
 * backend accepts. Auto-stops at the backend's max duration.
 */
export function useVoiceRecorder(onAutoStop?: (result: RecordingResult | null) => void) {
  const [status, setStatus] = useState<RecorderStatus>(() => (isRecordingSupported() ? 'idle' : 'unsupported'));
  const [errorMessage, setErrorMessage] = useState('');
  const [elapsedMs, setElapsedMs] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const tickRef = useRef<number | null>(null);
  const autoStopRef = useRef<number | null>(null);
  const stopResolverRef = useRef<((r: RecordingResult | null) => void) | null>(null);
  const onAutoStopRef = useRef(onAutoStop);
  onAutoStopRef.current = onAutoStop;

  const clearTimers = () => {
    if (tickRef.current !== null) window.clearInterval(tickRef.current);
    if (autoStopRef.current !== null) window.clearTimeout(autoStopRef.current);
    tickRef.current = null;
    autoStopRef.current = null;
  };

  const releaseStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const stop = useCallback((): Promise<RecordingResult | null> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return Promise.resolve(null);
    return new Promise((resolve) => {
      stopResolverRef.current = resolve;
      recorder.stop();
    });
  }, []);

  const start = useCallback(async (): Promise<boolean> => {
    if (!isRecordingSupported()) {
      setStatus('unsupported');
      return false;
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') return true;

    setErrorMessage('');
    setStatus('requesting');
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const name = (err as { name?: string } | null)?.name;
      if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') {
        setStatus('denied');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setStatus('error');
        setErrorMessage(t('No microphone was found. Connect a microphone and try again.'));
      } else {
        setStatus('error');
        setErrorMessage(t('Could not access the microphone. Please try again.'));
      }
      return false;
    }

    const preferred = pickMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = preferred ? new MediaRecorder(stream, { mimeType: preferred }) : new MediaRecorder(stream);
    } catch {
      stream.getTracks().forEach((t) => t.stop());
      setStatus('error');
      setErrorMessage(t('Recording is not supported in this browser.'));
      return false;
    }

    const mimeType = baseMime(recorder.mimeType || preferred || '');
    if (!ALLOWED_AUDIO_MIME_TYPES.includes(mimeType)) {
      stream.getTracks().forEach((t) => t.stop());
      setStatus('unsupported');
      return false;
    }

    streamRef.current = stream;
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      clearTimers();
      releaseStream();
      const durationMs = Date.now() - startedAtRef.current;
      const blob = new Blob(chunksRef.current, { type: mimeType });
      chunksRef.current = [];
      recorderRef.current = null;
      setStatus('idle');
      const result = blob.size > 0 ? { blob, mimeType, durationMs } : null;
      const resolver = stopResolverRef.current;
      stopResolverRef.current = null;
      if (resolver) resolver(result);
      else onAutoStopRef.current?.(result);
    };
    recorder.onerror = () => {
      clearTimers();
      releaseStream();
      recorderRef.current = null;
      setStatus('error');
      setErrorMessage(t('Recording failed. Please try again.'));
      stopResolverRef.current?.(null);
      stopResolverRef.current = null;
    };

    startedAtRef.current = Date.now();
    setElapsedMs(0);
    recorder.start(250);
    setStatus('recording');
    tickRef.current = window.setInterval(() => setElapsedMs(Date.now() - startedAtRef.current), 250);
    autoStopRef.current = window.setTimeout(() => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
    }, MAX_RECORDING_MS);
    return true;
  }, []);

  const reset = useCallback(() => {
    setErrorMessage('');
    setStatus(isRecordingSupported() ? 'idle' : 'unsupported');
  }, []);

  useEffect(
    () => () => {
      clearTimers();
      const recorder = recorderRef.current;
      if (recorder) {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        if (recorder.state !== 'inactive') recorder.stop();
      }
      releaseStream();
    },
    [],
  );

  return { status, errorMessage, elapsedMs, start, stop, reset };
}
