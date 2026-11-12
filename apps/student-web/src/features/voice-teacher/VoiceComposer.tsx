import { useEffect, useRef } from 'react';
import { MicIcon } from '../../components/common/Icons';
import { useI18n } from '../../i18n/I18nContext';

interface VoiceComposerProps {
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onMic: () => void;
  /** Throw away the current recording without sending it. */
  onCancelRecording: () => void;
  isRecording: boolean;
  elapsedLabel: string;
  /** A turn is being processed: typing and talking wait. */
  busy: boolean;
  micBlocked: boolean;
  micRequesting: boolean;
  /** The teacher's voice is muted: replies are shown as text only. */
  muted: boolean;
  onToggleMute: () => void;
}

const ROUND = 'grid size-12 shrink-0 cursor-pointer place-items-center rounded-full border-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
const BAR_DELAYS = [0, 120, 240, 60, 300, 180, 90];

function SpeakerGlyph({ off }: { off: boolean }) {
  return (
    <svg aria-hidden="true" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor" stroke="none" />
      {off ? <path d="M16 9.5l5 5M21 9.5l-5 5" /> : <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />}
    </svg>
  );
}

/**
 * The bottom bar of the live lesson, like a chat app's: a text box and a round button that is the microphone while the
 * box is empty and "send" once something is typed. While recording the box turns into a live meter with stop/cancel.
 * On the left, a toggle mutes the teacher's voice.
 */
export function VoiceComposer({
  draft, onDraftChange, onSend, onMic, onCancelRecording, isRecording, elapsedLabel, busy, micBlocked, micRequesting, muted, onToggleMute,
}: VoiceComposerProps) {
  const { t } = useI18n();
  const area = useRef<HTMLTextAreaElement>(null);
  const hasText = draft.trim().length > 0;

  // Grow with the text (up to about four lines).
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  }, [draft, isRecording]);

  return (
    <div className="sticky bottom-0 z-10 -mx-4 border-t border-line bg-page/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl items-end gap-2.5">
        <button
          type="button"
          onClick={onToggleMute}
          aria-pressed={muted}
          aria-label={muted ? t('Turn the teacher’s voice on') : t('Mute the teacher’s voice')}
          title={muted ? t('Turn the teacher’s voice on') : t('Mute the teacher’s voice')}
          className={`${ROUND} ${muted ? 'bg-surface-strong text-ink' : 'bg-transparent text-ink-soft ring-1 ring-line-strong hover:bg-surface-strong'}`}
        >
          <SpeakerGlyph off={muted} />
        </button>

        {isRecording ? (
          <div className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-3xl bg-danger-soft px-4 ring-1 ring-danger-line" role="status" aria-live="polite">
            <span aria-hidden="true" className="flex h-6 items-center gap-1">
              {BAR_DELAYS.map((d, i) => <span key={i} className="vr-bar" style={{ animationDelay: `${d}ms` }} />)}
            </span>
            <span className="min-w-0 flex-1 truncate text-base font-semibold text-danger-ink max-[420px]:sr-only">{t('Listening…')}</span>
            <span className="lp-num shrink-0 text-sm font-semibold text-danger-ink max-[420px]:ms-auto">{elapsedLabel}</span>
            <button type="button" onClick={onCancelRecording} className="cursor-pointer border-0 bg-transparent p-1 text-sm font-semibold text-danger-ink underline">
              {t('Cancel')}
            </button>
          </div>
        ) : (
          <div className="flex min-h-12 min-w-0 flex-1 items-end rounded-3xl bg-surface ring-1 ring-line-strong transition-shadow focus-within:ring-2 focus-within:ring-brand">
            <textarea
              ref={area}
              rows={1}
              value={draft}
              disabled={busy}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  if (hasText && !busy) onSend();
                }
              }}
              placeholder={t('Type or talk to your teacher')}
              aria-label={t('Message your teacher')}
              className="max-h-28 min-h-12 w-full resize-none border-0 bg-transparent px-4 py-3 text-base leading-snug text-ink outline-none placeholder:text-ink-muted disabled:opacity-60"
            />
          </div>
        )}

        {isRecording ? (
          <button type="button" onClick={onMic} aria-label={t('Stop recording and send')} title={t('Stop recording and send')} className={`${ROUND} bg-danger text-white hover:opacity-90`}>
            <span aria-hidden="true" className="size-4 rounded-sm bg-white" />
          </button>
        ) : hasText ? (
          <button type="button" onClick={onSend} disabled={busy} aria-label={t('Send message')} title={t('Send message')} className={`${ROUND} bg-brand text-on-brand hover:bg-brand-hover`}>
            <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={onMic}
            disabled={busy || micBlocked || micRequesting}
            aria-label={t('Start recording')}
            title={micBlocked ? t('Voice recording isn’t available here. You can type instead.') : t('Start recording')}
            className={`${ROUND} bg-brand text-on-brand hover:bg-brand-hover`}
          >
            <MicIcon className="size-6 text-on-brand" />
          </button>
        )}
      </div>
    </div>
  );
}
