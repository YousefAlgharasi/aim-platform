import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { buttonClasses } from '../../../components/common/buttonStyles';
import { useI18n } from '../../../i18n/I18nContext';
import { canSpeak, speakLine, stopSpeaking } from '../speech';
import type { Character } from './characters';
import { assignCharacters, uniqueSpeakers, type DialogueLine } from './dialogue';

interface DialogueSceneProps {
  lines: DialogueLine[];
  /** Any stable id of the lesson step; the same step always gets the same cast. */
  seed: string;
  /** Shown instead of the voice buttons when the browser has no speech voices. */
  fallbackAudio?: ReactNode;
}

const PAUSE_BETWEEN_LINES_MS = 280;
const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

function PlayGlyph({ stop = false }: { stop?: boolean }) {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="currentColor">
      {stop ? <rect x="6" y="6" width="12" height="12" rx="2" /> : <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10-6.5a1 1 0 0 0 0-1.72l-10-6.5A1 1 0 0 0 8 5.5z" />}
    </svg>
  );
}

/** Which way a character at stage slot `i` of `n` should look so the group faces its middle (left-to-right layout). */
function wantedFacing(i: number, n: number): 'left' | 'right' {
  return i <= (n - 1) / 2 ? 'right' : 'left';
}

/**
 * A conversation shown as a small scene: the speakers stand on a stage facing each other, the one who is talking
 * steps forward, and every line is a chat bubble. Tap a bubble to hear that line, or play the whole conversation.
 * Voices come from the browser; the line being spoken is highlighted.
 */
export function DialogueScene({ lines, seed, fallbackAudio }: DialogueSceneProps) {
  const { t } = useI18n();
  const speakers = useMemo(() => uniqueSpeakers(lines), [lines]);
  const cast = useMemo(() => assignCharacters(speakers, seed), [speakers, seed]);
  const slotOf = useMemo(() => new Map(speakers.map((s, i) => [s, i])), [speakers]);
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showText, setShowText] = useState(true);
  const run = useRef(0);
  const speech = canSpeak();

  useEffect(() => () => { run.current += 1; stopSpeaking(); }, []);

  const charOf = (i: number): Character => cast[slotOf.get(lines[i].speaker) ?? 0];
  const say = (i: number) => speakLine(lines[i].text, { pitch: charOf(i).gender === 'female' ? 1.15 : 0.95 });

  function stop() {
    run.current += 1;
    stopSpeaking();
    setPlaying(false);
    setActive(null);
  }

  async function playAll() {
    if (playing) { stop(); return; }
    const id = ++run.current;
    setPlaying(true);
    for (let i = 0; i < lines.length; i++) {
      if (run.current !== id) return;
      setActive(i);
      await say(i);
      if (run.current !== id) return;
      await wait(PAUSE_BETWEEN_LINES_MS);
    }
    if (run.current === id) { setActive(null); setPlaying(false); }
  }

  async function playOne(i: number) {
    const id = ++run.current;
    setPlaying(false);
    setActive(i);
    await say(i);
    if (run.current === id) setActive(null);
  }

  const activeSlot = active === null ? null : slotOf.get(lines[active].speaker) ?? null;
  const n = speakers.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Stage */}
      <div className="flex items-end justify-center gap-5 overflow-hidden rounded-2xl bg-brand-soft px-4 pt-5 sm:gap-12" aria-hidden="true">
        {cast.map((c, i) => {
          const flip = c.faces !== wantedFacing(i, n);
          const speaking = activeSlot === i;
          const dimmed = activeSlot !== null && !speaking;
          return (
            <div key={`${c.id}-${i}`} className="flex flex-col items-center">
              <img
                src={c.body}
                alt=""
                draggable={false}
                className={`block h-32 w-auto origin-bottom select-none transition-[transform,opacity] duration-300 motion-reduce:transition-none sm:h-44 ${
                  flip ? 'scale-x-[-1] rtl:scale-x-100' : 'rtl:scale-x-[-1]'
                } ${speaking ? '-translate-y-1.5 motion-reduce:translate-y-0' : ''} ${dimmed ? 'opacity-60' : ''}`}
              />
              <span className={`-mt-px mb-2 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${speaking ? 'bg-brand text-on-brand' : 'bg-surface text-ink-soft'}`}>
                {speakers[i]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {speech ? (
          <button type="button" onClick={() => void playAll()} className={buttonClasses('primary', 'sm')} aria-pressed={playing}>
            <PlayGlyph stop={playing} />
            {playing ? t('Stop') : t('Play conversation')}
          </button>
        ) : (
          fallbackAudio
        )}
        <button type="button" onClick={() => setShowText((v) => !v)} className={buttonClasses('secondary', 'sm')} aria-pressed={!showText}>
          {showText ? t('Hide text') : t('Show text')}
        </button>
      </div>

      {/* Chat */}
      {showText && (
        <ol className="m-0 flex list-none flex-col gap-3 p-0" aria-label={t('Conversation')}>
          {lines.map((line, i) => {
            const slot = slotOf.get(line.speaker) ?? 0;
            const c = cast[slot];
            const mine = slot % 2 === 1;
            const isActive = active === i;
            return (
              <li key={i} className={`flex items-end gap-2.5 ${mine ? 'flex-row-reverse' : ''}`}>
                <span className="size-10 shrink-0 overflow-hidden rounded-full bg-brand-soft ring-1 ring-line sm:size-11">
                  <img src={c.avatar} alt="" draggable={false} className="size-full object-cover" />
                </span>
                <div className={`flex min-w-0 max-w-[85%] flex-col gap-1 ${mine ? 'items-end' : 'items-start'}`}>
                  <span className="px-1 text-xs font-semibold text-ink-muted">{line.speaker}</span>
                  {speech ? (
                    <button
                      type="button"
                      onClick={() => void playOne(i)}
                      aria-label={t('Play this line: {line}', { line: `${line.speaker}: ${line.text}` })}
                      className={`cursor-pointer rounded-2xl border-0 px-4 py-2.5 text-start text-base leading-snug text-ink ring-1 transition-shadow [unicode-bidi:plaintext] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                        mine ? 'bg-brand-soft ring-brand-line' : 'bg-surface-strong ring-line'
                      } ${isActive ? 'ring-2 !ring-brand shadow-md' : 'hover:ring-line-strong'}`}
                    >
                      {line.text}
                    </button>
                  ) : (
                    <p className={`m-0 rounded-2xl px-4 py-2.5 text-base leading-snug text-ink ring-1 [unicode-bidi:plaintext] ${mine ? 'bg-brand-soft ring-brand-line' : 'bg-surface-strong ring-line'}`}>{line.text}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
