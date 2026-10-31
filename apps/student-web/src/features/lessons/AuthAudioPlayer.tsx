import { useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../../api/client';
import { useI18n } from '../../i18n/I18nContext';
import { AudioPlayer } from '../../components/common/AudioPlayer';

interface AuthAudioPlayerProps {
  /** Fetches the audio through the authenticated backend client. An empty blob means "no audio yet" (204). */
  load: () => Promise<Blob>;
  label?: string;
}

/**
 * Loads backend-synthesized audio on demand (the backend synthesizes lazily,
 * so we only request it when the student presses play) and plays it from an object URL.
 */
export function AuthAudioPlayer({ load, label }: AuthAudioPlayerProps) {
  const { t } = useI18n();
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const urlRef = useRef<string | null>(null);

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  function handleLoad() {
    if (loading) return;
    setLoading(true);
    setMessage('');
    load()
      .then((blob) => {
        if (!blob || blob.size === 0) {
          setMessage(t('Audio for this item isn’t available yet.'));
          return;
        }
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setSrc(url);
      })
      .catch((err) => setMessage(getErrorMessage(err, t('Failed to load audio'))))
      .finally(() => setLoading(false));
  }

  return (
    <AudioPlayer
      src={src}
      onRequestSource={handleLoad}
      loading={loading}
      label={label ?? t('Play audio')}
      footer={message ? <span className="text-xs text-slate-500 dark:text-slate-400" role="status">{message}</span> : null}
    />
  );
}
