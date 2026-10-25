import { useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import styles from './ContentBlock.module.css';

interface AuthAudioPlayerProps {
  /** Fetches the audio through the authenticated backend client. An empty blob means "no audio yet" (204). */
  load: () => Promise<Blob>;
  label?: string;
}

/**
 * Loads backend-synthesized audio on demand (the backend synthesizes lazily,
 * so we only request it when the student asks) and plays it from an object URL.
 */
export function AuthAudioPlayer({ load, label = 'Play audio' }: AuthAudioPlayerProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const urlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  useEffect(() => {
    if (src) audioRef.current?.play().catch(() => undefined);
  }, [src]);

  function handleLoad() {
    setLoading(true);
    setMessage('');
    load()
      .then((blob) => {
        if (!blob || blob.size === 0) {
          setMessage('Audio for this item isn’t available yet.');
          return;
        }
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setSrc(url);
      })
      .catch((err) => setMessage(getErrorMessage(err, 'Failed to load audio')))
      .finally(() => setLoading(false));
  }

  return (
    <div className={styles.audioPlayer}>
      {src ? (
        <audio ref={audioRef} controls src={src} className={styles.audio} />
      ) : (
        <Button type="button" variant="secondary" size="sm" onClick={handleLoad} disabled={loading}>
          {loading ? 'Loading audio…' : `🔊 ${label}`}
        </Button>
      )}
      {message && <span className={styles.audioMessage}>{message}</span>}
    </div>
  );
}
