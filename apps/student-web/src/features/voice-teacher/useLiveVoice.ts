import { useCallback, useEffect, useRef, useState } from 'react';
import { Vad, concatFloat32, downsample, encodeWav, rmsOf, TARGET_SAMPLE_RATE } from './liveVoiceEngine';
import { t } from '../../i18n';

export type LiveStatus = 'off' | 'starting' | 'listening' | 'hearing' | 'denied' | 'unsupported' | 'error';

export interface LiveUtterance {
  blob: Blob;
  mimeType: 'audio/wav';
  durationMs: number;
}

interface Options {
  /** The student finished a sentence. */
  onUtterance: (utterance: LiveUtterance) => void;
  /** The student started talking over the teacher: stop the teacher's audio now. */
  onBargeIn: () => void;
  /** Is the teacher's audio playing right now? (read on every audio frame, so pass a function that reads a ref) */
  isAiSpeaking: () => boolean;
}

const PREROLL_MS = 450;
// ScriptProcessor is deprecated but works in every browser we support and needs no separate worklet file.
const BUFFER_SIZE = 4096;

export function isLiveVoiceSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof (window.AudioContext ?? (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext) !== 'undefined'
  );
}

/**
 * A live, hands-free microphone: while it is on, it hears when the student starts and stops talking, hands over each
 * finished sentence as a WAV file, and reports when the student talks over the teacher. Muting turns the mic off
 * without closing it, so turning it back on is instant.
 */
export function useLiveVoice({ onUtterance, onBargeIn, isAiSpeaking }: Options) {
  const [status, setStatus] = useState<LiveStatus>(() => (isLiveVoiceSupported() ? 'off' : 'unsupported'));
  const [level, setLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nodeRef = useRef<ScriptProcessorNode | null>(null);
  const vadRef = useRef(new Vad());
  const preroll = useRef<Float32Array[]>([]);
  const prerollMs = useRef(0);
  const sentence = useRef<Float32Array[]>([]);
  const mutedRef = useRef(false);
  const lastLevelAt = useRef(0);
  // Latest callbacks, so the audio node (created once) never calls stale ones.
  const handlers = useRef({ onUtterance, onBargeIn, isAiSpeaking });
  handlers.current = { onUtterance, onBargeIn, isAiSpeaking };

  const teardown = useCallback(() => {
    nodeRef.current?.disconnect();
    nodeRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void ctxRef.current?.close().catch(() => undefined);
    ctxRef.current = null;
    preroll.current = [];
    prerollMs.current = 0;
    sentence.current = [];
    vadRef.current.reset();
    setLevel(0);
  }, []);

  const stop = useCallback(() => {
    teardown();
    setStatus((s) => (s === 'denied' || s === 'unsupported' ? s : 'off'));
  }, [teardown]);

  const start = useCallback(async () => {
    if (ctxRef.current) return;
    if (!isLiveVoiceSupported()) { setStatus('unsupported'); return; }
    setStatus('starting');
    setErrorMessage('');
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
      });
    } catch (err) {
      const name = (err as { name?: string } | null)?.name;
      if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') setStatus('denied');
      else { setStatus('error'); setErrorMessage(t('Could not start the microphone. Check that it is connected and not used by another app.')); }
      return;
    }
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor();
      if (ctx.state === 'suspended') await ctx.resume().catch(() => undefined);
      const source = ctx.createMediaStreamSource(stream);
      const node = ctx.createScriptProcessor(BUFFER_SIZE, 1, 1);
      const silent = ctx.createGain();
      silent.gain.value = 0; // the processor must be connected to run; this keeps the student from hearing themselves
      const vad = vadRef.current;
      vad.reset();
      vad.startCalibration();

      node.onaudioprocess = (e) => {
        const frame = new Float32Array(e.inputBuffer.getChannelData(0)); // copy: the browser reuses the buffer
        const frameMs = (frame.length / ctx.sampleRate) * 1000;
        const muted = mutedRef.current;
        const rms = muted ? 0 : rmsOf(frame);

        const now = performance.now();
        if (now - lastLevelAt.current > 90) { lastLevelAt.current = now; setLevel(Math.min(1, rms * 8)); }

        if (muted) {
          if (vad.talking) { vad.reset(); sentence.current = []; setStatus('listening'); }
          preroll.current = []; prerollMs.current = 0;
          return;
        }

        const speakingAi = handlers.current.isAiSpeaking();
        const event = vad.process(rms, frameMs, speakingAi);

        if (event?.type === 'speech-start') {
          sentence.current = [...preroll.current, frame];
          preroll.current = []; prerollMs.current = 0;
          setStatus('hearing');
          if (event.bargeIn) handlers.current.onBargeIn();
          return;
        }
        if (vad.talking || event?.type === 'speech-end') {
          sentence.current.push(frame);
          if (event?.type === 'speech-end') {
            const samples = concatFloat32(sentence.current);
            sentence.current = [];
            setStatus('listening');
            if (!event.tooShort) {
              const small = downsample(samples, ctx.sampleRate);
              const rate = ctx.sampleRate > TARGET_SAMPLE_RATE ? TARGET_SAMPLE_RATE : ctx.sampleRate;
              handlers.current.onUtterance({ blob: encodeWav(small, rate), mimeType: 'audio/wav', durationMs: (small.length / rate) * 1000 });
            }
          }
          return;
        }

        // Nobody talking: keep the last moments so the first word of the next sentence is not cut off.
        preroll.current.push(frame);
        prerollMs.current += frameMs;
        while (prerollMs.current > PREROLL_MS && preroll.current.length > 1) {
          const dropped = preroll.current.shift()!;
          prerollMs.current -= (dropped.length / ctx.sampleRate) * 1000;
        }
      };

      source.connect(node);
      node.connect(silent);
      silent.connect(ctx.destination);
      ctxRef.current = ctx;
      streamRef.current = stream;
      nodeRef.current = node;
      setStatus('listening');
    } catch {
      stream.getTracks().forEach((track) => track.stop());
      setStatus('error');
      setErrorMessage(t('Could not start the microphone. Check that it is connected and not used by another app.'));
    }
  }, []);

  /** Turn the mic off or on without closing it. */
  const setMuted = useCallback((muted: boolean) => {
    mutedRef.current = muted;
  }, []);

  useEffect(() => teardown, [teardown]);

  return { status, level, errorMessage, start, stop, setMuted };
}
