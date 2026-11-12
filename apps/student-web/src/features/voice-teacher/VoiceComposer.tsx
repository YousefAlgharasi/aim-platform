import { useEffect, useRef } from 'react';
import { MicIcon } from '../../components/common/Icons';
import { useI18n } from '../../i18n/I18nContext';

/** off: mic not running; starting: asking for permission; on: live and listening; hearing: the student is talking; muted: running but ignored; blocked: not possible here. */
export type MicState = 'off' | 'starting' | 'on' | 'hearing' | 'muted' | 'blocked';

interface VoiceComposerProps {
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  micState: MicState;
  /** Turns the live microphone on, or mutes / unmutes it. */
  onMicToggle: () => void;
  /** A turn is being processed: typing waits. */
  busy: boolean;
  /** The teacher's voice is muted: replies are shown as text only. */
  muted: boolean;
  onToggleMute: () => void;
}

const ROUND = 'grid size-12 shrink-0 cursor-pointer place-items-center rounded-full border-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

function SpeakerGlyph({ off }: { off: boolean }) {
  return (
    <svg aria-hidden="true" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor" stroke="none" />
      {off ? <path d="M16 9.5l5 5M21 9.5l-5 5" /> : <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />}
    </svg>
  );
}

/**
 * The bottom bar of the live lesson. On the left, a toggle that mutes the teacher's voice. In the middle, a text box.
 * On the right, one round button: the live microphone while the box is empty (tap to mute / unmute; the conversation
 * itself is hands-free), and "send" once something is typed.
 */
export function VoiceComposer({ draft, onDraftChange, onSend, micState, onMicToggle, busy, muted, onToggleMute }: VoiceComposerProps) {
  const { t } = useI18n();
  const area = useRef<HTMLTextAreaElement>(null);
  const hasText = draft.trim().length > 0;
  const live = micState === 'on' || micState === 'hearing';

  // Grow with the text (up to about four lines).
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  }, [draft]);

  const micLabel =
    micState === 'muted' ? t('Turn your microphone on')
      : micState === 'off' ? t('Start live conversation')
        : micState === 'blocked' ? t('Live voice isn’t available here. You can type instead.')
          : t('Mute your microphone');

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
            placeholder={live ? t('Just talk, or type here') : t('Type or talk to your teacher')}
            aria-label={t('Message your teacher')}
            className="max-h-28 min-h-12 w-full resize-none border-0 bg-transparent px-4 py-3 text-base leading-snug text-ink outline-none placeholder:text-ink-muted disabled:opacity-60"
          />
        </div>

        {hasText ? (
          <button type="button" onClick={onSend} disabled={busy} aria-label={t('Send message')} title={t('Send message')} className={`${ROUND} bg-brand text-on-brand hover:bg-brand-hover`}>
            <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={onMicToggle}
            disabled={micState === 'starting' || micState === 'blocked'}
            aria-pressed={live}
            aria-label={micLabel}
            title={micLabel}
            className={`${ROUND} relative ${
              live
                ? `bg-brand text-on-brand hover:bg-brand-hover ${micState === 'hearing' ? 'ring-4 ring-brand/30' : 'ring-4 ring-brand/15'}`
                : micState === 'muted'
                  ? 'bg-surface-strong text-ink hover:bg-surface-muted'
                  : 'bg-brand text-on-brand hover:bg-brand-hover'
            }`}
          >
            <MicIcon className="size-6" />
            {micState === 'muted' && (
              <svg aria-hidden="true" className="pointer-events-none absolute size-8 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 5l14 14" /></svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
