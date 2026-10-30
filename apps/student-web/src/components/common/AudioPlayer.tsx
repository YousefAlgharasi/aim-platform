import { ReactNode, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';

/** Speeds offered by the speed chip, in tap order (slower helps listening practice). */
const PLAYBACK_RATES = [1, 0.75] as const;

export function formatClock(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? Math.floor(totalSeconds) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

interface AudioPlayerProps {
  /** Audio URL; null until the caller has loaded it. */
  src: string | null;
  /** Called when the student presses play before `src` exists; playback starts once `src` arrives. */
  onRequestSource?: () => void;
  /** True while the caller is fetching the audio. */
  loading?: boolean;
  /** True when loading is taking long enough to deserve a reassuring hint. */
  slow?: boolean;
  /** Short visible title, e.g. "Listen". */
  label?: string;
  preload?: 'none' | 'metadata' | 'auto';
  /** Shown under the player (error message, retry link, …). */
  footer?: ReactNode;
}

/**
 * The single audio player used across the student app: one round play/pause/replay button,
 * a seekable progress bar, elapsed/total time and a playback-speed chip.
 * Media controls stay left-to-right in Arabic too, like every common media player.
 */
export function AudioPlayer({ src, onRequestSource, loading = false, slow = false, label, preload = 'metadata', footer }: AudioPlayerProps) {
  const { t } = useI18n();
  const audioRef = useRef<HTMLAudioElement>(null);
  const playWhenReady = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState<number>(PLAYBACK_RATES[0]);

  useEffect(() => {
    setTime(0);
    setDuration(0);
    setPlaying(false);
    if (src && playWhenReady.current) {
      playWhenReady.current = false;
      audioRef.current?.play().catch(() => undefined);
    }
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Loading a source resets playbackRate to defaultPlaybackRate, so set both.
    audio.defaultPlaybackRate = rate;
    audio.playbackRate = rate;
  }, [rate, src]);

  function togglePlay() {
    if (!src) {
      playWhenReady.current = true;
      onRequestSource?.();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.ended) audio.currentTime = 0;
    if (audio.paused) audio.play().catch(() => undefined);
    else audio.pause();
  }

  function cycleRate() {
    setRate((current) => {
      const index = PLAYBACK_RATES.indexOf(current as (typeof PLAYBACK_RATES)[number]);
      return PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length];
    });
  }

  const ended = !playing && duration > 0 && time >= duration - 0.05;
  const progress = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;
  const buttonLabel = loading
    ? t('Loading audio…')
    : playing
      ? t('Pause audio')
      : ended
        ? t('Replay audio')
        : t('Play audio');

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="flex items-center gap-3 rounded-2xl bg-slate-50 p-2.5 pe-3 ring-1 ring-[#E2E8F0] dark:bg-slate-900/60 dark:ring-slate-700"
        dir="ltr"
      >
        <button
          type="button"
          onClick={togglePlay}
          disabled={loading}
          aria-label={buttonLabel}
          className="relative size-11 shrink-0 cursor-pointer rounded-full border-0 bg-[#4F46E5] text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] transition duration-150 hover:bg-[#4338CA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 active:scale-95 disabled:cursor-progress disabled:bg-[#A5B4FC] disabled:shadow-none motion-reduce:transition-none motion-reduce:active:scale-100 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-slate-900 dark:disabled:bg-indigo-900"
        >
          {loading ? (
            <svg className="absolute inset-0 m-auto size-5 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : playing ? (
            <svg className="absolute inset-0 m-auto size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : ended ? (
            <svg className="absolute inset-0 m-auto size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
          ) : (
            <svg className="absolute inset-0 m-auto size-[18px] translate-x-px" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100" dir="auto">
              {label ?? t('Play audio')}
            </span>
            <button
              type="button"
              onClick={cycleRate}
              aria-label={`${t('Playback speed')}: ${rate}x`}
              className="h-7 min-w-[2.75rem] shrink-0 cursor-pointer rounded-full border-0 bg-white px-2 text-xs font-semibold tabular-nums text-slate-600 ring-1 ring-[#E2E8F0] transition-colors hover:text-[#4F46E5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:text-indigo-300 dark:focus-visible:ring-indigo-400"
            >
              {rate}x
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex h-5 min-w-0 flex-1 items-center">
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(time, duration || 0)}
                disabled={!src || !duration}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setTime(next);
                  if (audioRef.current) audioRef.current.currentTime = next;
                }}
                aria-label={t('Audio position')}
                aria-valuetext={t('{current} of {total}', { current: formatClock(time), total: formatClock(duration) })}
                className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-default"
              />
              <div
                className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200 peer-focus-visible:ring-2 peer-focus-visible:ring-[#4F46E5] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-50 dark:bg-slate-700 dark:peer-focus-visible:ring-indigo-400 dark:peer-focus-visible:ring-offset-slate-900"
                aria-hidden="true"
              >
                {loading ? (
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-[#A5B4FC] motion-reduce:animate-none dark:bg-indigo-700" />
                ) : (
                  <div className="h-full rounded-full bg-[#4F46E5] dark:bg-indigo-400" style={{ width: `${progress}%` }} />
                )}
              </div>
              {src && duration > 0 && (
                <div
                  className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4F46E5] shadow ring-2 ring-white dark:bg-indigo-400 dark:ring-slate-900"
                  style={{ left: `${progress}%` }}
                  aria-hidden="true"
                />
              )}
            </div>
            <span className="shrink-0 text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">
              {formatClock(time)} / {src && duration ? formatClock(duration) : '--:--'}
            </span>
          </div>
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {loading ? (slow ? t('Still preparing the audio. This can take a few seconds.') : t('Preparing audio…')) : ''}
      </p>
      {loading && slow && (
        <p className="m-0 text-xs text-slate-500 dark:text-slate-400" aria-hidden="true">
          {t('Still preparing the audio. This can take a few seconds.')}
        </p>
      )}
      {footer}

      {src && (
        <audio
          ref={audioRef}
          src={src}
          preload={preload}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      )}
    </div>
  );
}
