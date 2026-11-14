import { useEffect, useRef, type ReactNode } from 'react';
import { MicIcon } from '../../components/common/Icons';
import { useI18n } from '../../i18n/I18nContext';
import { AimRobot, type RobotState } from './AimRobot';
import { RobotThoughts, type Thought } from './RobotThoughts';

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
  /** The robot that sits on the box, and what it is saying. */
  robotState: RobotState;
  /** How loud the student is right now (0..1). */
  level: number;
  thought: Thought | null;
  /** Shown under the box (the phone's button for the conversation). */
  footer?: ReactNode;
}

const ROUND = 'grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl border-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

function SpeakerGlyph({ off }: { off: boolean }) {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor" stroke="none" />
      {off ? <path d="M16 9.5l5 5M21 9.5l-5 5" /> : <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />}
    </svg>
  );
}

/**
 * The student's side of the live lesson, at the bottom of the left side of the page: the AIM robot sits on the top-left
 * corner of the text box, and what it is saying rises from its head as a thought bubble. Inside the box: the student's
 * microphone (tap to mute / unmute; the conversation itself is hands-free), the teacher's voice (mute), the text, and send.
 */
export function VoiceComposer({
  draft, onDraftChange, onSend, micState, onMicToggle, busy, muted, onToggleMute, robotState, level, thought, footer,
}: VoiceComposerProps) {
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
    <div className="sticky bottom-0 z-10 -mx-4 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1 sm:-mx-6 sm:px-6 lg:static lg:col-start-1 lg:row-start-2 lg:mx-0 lg:ps-8 lg:pe-6 lg:pb-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-page via-page/90 to-transparent lg:hidden" aria-hidden="true" />
      {/* --rh is the robot's height; the box starts just under it, so the robot sits on the box's top-left corner. */}
      <div className="vr-seat relative mx-auto w-full max-w-2xl [--rh:clamp(8.4rem,min(45.6vw,28.8dvh),14.4rem)] lg:[--rh:clamp(10.8rem,38.4dvh,20.4rem)]">
        <div className="absolute start-1 top-0 z-0">
          <AimRobot state={robotState} level={live ? level : 0} />
        </div>
        <RobotThoughts thought={thought} />

        <div className="relative z-10 flex items-end gap-1.5 rounded-2xl bg-surface p-1.5 shadow-sm ring-1 ring-line-strong transition-shadow focus-within:ring-2 focus-within:ring-brand">
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
            <MicIcon className="size-5" />
            {micState === 'muted' && (
              <svg aria-hidden="true" className="pointer-events-none absolute size-7 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 5l14 14" /></svg>
            )}
          </button>
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
            className="max-h-28 min-h-10 min-w-0 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-base leading-snug text-ink outline-none placeholder:text-ink-muted disabled:opacity-60"
          />

          <button
            type="button"
            onClick={onSend}
            disabled={busy || !hasText}
            aria-label={t('Send message')}
            title={t('Send message')}
            className={`${ROUND} ${hasText ? 'bg-brand text-on-brand hover:bg-brand-hover' : 'bg-surface-strong text-ink-muted'}`}
          >
            <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          </button>
        </div>
        {footer}
      </div>
    </div>
  );
}
