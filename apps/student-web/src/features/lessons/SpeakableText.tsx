import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { canSpeak, speakItem } from './speech';

function SpeakerGlyph({ className = 'size-[15px]' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6.5 8.8H3.5v6.4h3L11 19V5Z" fill="currentColor" fillOpacity=".18" />
      <path d="M15.2 9a4.2 4.2 0 0 1 0 6" />
      <path d="M18 6.4a8 8 0 0 1 0 11.2" />
    </svg>
  );
}

/** Tracks which single token is speaking so only one lights up at a time. */
function useSpeaker() {
  const [active, setActive] = useState<string | null>(null);
  const latest = useRef(0);
  useEffect(() => () => { if (canSpeak()) window.speechSynthesis.cancel(); }, []);
  const play = (key: string, text: string, isolated: boolean) => {
    const id = ++latest.current;
    setActive(key);
    speakItem(text, isolated).then(() => { if (latest.current === id) setActive(null); });
  };
  return { active, play };
}

const hasLetterOrDigit = (s: string) => /[\p{L}\p{N}]/u.test(s);

/**
 * Lesson text where each letter, number or word can be heard on its own:
 *  - short items (up to 3 tokens: "A a", "Seven", "twenty-one") get a speaker icon after each token;
 *  - sentences get tappable words (dotted underline) and no icons, so the line stays clean.
 * Only the tapped token is spoken, never the whole sentence.
 */
export function SpeakableText({ text, className = '' }: { text: string; className?: string }) {
  const { t } = useI18n();
  const { active, play } = useSpeaker();
  if (!canSpeak()) return <span dir="auto" className={className}>{text}</span>;

  const parts = text.split(/(\s+)/);
  const tokens = parts.filter(p => p.trim() && hasLetterOrDigit(p));
  const short = tokens.length <= 3;
  let n = -1;

  return (
    <span dir="auto" className={className}>
      {parts.map((part, i) => {
        if (!part.trim() || !hasLetterOrDigit(part)) return part;
        n += 1;
        const key = `${i}`;
        const on = active === key;
        const label = t('Hear “{word}”', { word: part.replace(/[.,!?;:]/g, '') });
        if (short) {
          return (
            <span key={i} className="inline-flex items-center gap-1.5 whitespace-nowrap align-middle">
              {part}
              <button
                type="button"
                onClick={() => play(key, part, tokens.length <= 2)}
                aria-label={label}
                aria-pressed={on}
                className={`grid size-7 cursor-pointer place-items-center rounded-full border-0 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${on ? 'bg-brand text-on-brand' : 'bg-brand-soft text-brand-ink hover:bg-brand-soft-hover'}`}
              >
                <SpeakerGlyph />
              </button>
            </span>
          );
        }
        return (
          <button
            key={i}
            type="button"
            onClick={() => play(key, part, false)}
            aria-label={label}
            className={`cursor-pointer rounded border-0 bg-transparent p-0 font-[inherit] text-[inherit] underline decoration-dotted decoration-from-font underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${on ? 'bg-brand-soft text-brand-ink decoration-transparent' : 'decoration-ink-faint hover:bg-brand-soft hover:text-brand-ink'}`}
          >
            {part}
          </button>
        );
      })}
    </span>
  );
}
