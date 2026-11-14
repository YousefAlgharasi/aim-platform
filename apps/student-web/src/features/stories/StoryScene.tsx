import { useEffect, useRef, useState } from 'react';
import { CHARACTERS, type CharacterId } from '../lessons/dialogue/characters';
import { useI18n } from '../../i18n/I18nContext';
import { HeadphonesIcon } from '../../components/common/Icons';
import type { StoryLine } from './storiesApi';

const isCharacter = (s: string): s is CharacterId => s in CHARACTERS;

/** Read the scene aloud with the browser's own voices (no server cost). Male and female friends get different voices when available. */
function useReadAloud(lines: StoryLine[]) {
  const [playing, setPlaying] = useState(false);
  const token = useRef(0);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stop = () => { token.current++; if (supported) window.speechSynthesis.cancel(); setPlaying(false); };
  useEffect(() => stop, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { stop(); }, [lines]); // eslint-disable-line react-hooks/exhaustive-deps

  const play = () => {
    if (!supported) return;
    stop();
    const my = ++token.current;
    const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'));
    const pick = (speaker: StoryLine['speaker']) => {
      if (voices.length === 0) return undefined;
      if (speaker === 'narrator') return voices[0];
      const male = CHARACTERS[speaker as CharacterId]?.gender === 'male';
      const named = voices.filter((v) => (male ? /male|david|daniel|alex|james|george/i : /female|zira|samantha|susan|karen|serena/i).test(v.name) && (male ? !/female/i.test(v.name) : true));
      return named[0] ?? voices[(male ? 1 : 0) % voices.length];
    };
    setPlaying(true);
    lines.forEach((line, i) => {
      const u = new SpeechSynthesisUtterance(line.text);
      u.lang = 'en-US';
      u.rate = line.speaker === 'narrator' ? 0.9 : 0.95;
      const v = pick(line.speaker);
      if (v) u.voice = v;
      u.onend = () => { if (i === lines.length - 1 && token.current === my) setPlaying(false); };
      u.onerror = () => { if (token.current === my) setPlaying(false); };
      window.speechSynthesis.speak(u);
    });
  };
  return { supported, playing, play, stop };
}

/** One scene: the place, then each line as narration or as a speech bubble from one of the four friends. */
export function StoryScene({ setting, lines }: { setting: string; lines: StoryLine[] }) {
  const { t } = useI18n();
  const { supported, playing, play, stop } = useReadAloud(lines);
  return (
    <section className="flex flex-col gap-4" aria-label={setting}>
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 rounded-full bg-surface-strong px-3 py-1 text-sm font-semibold text-ink [unicode-bidi:plaintext]">{setting}</p>
        {supported && (
          <button type="button" onClick={playing ? stop : play}
            className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border-0 bg-transparent px-4 text-sm font-semibold text-ink ring-1 ring-line-strong transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            <HeadphonesIcon className="size-4" />{playing ? t('Stop') : t('Listen')}
          </button>
        )}
      </div>
      <div className="flex flex-col gap-3" dir="ltr">
        {lines.map((line, i) => {
          if (!isCharacter(line.speaker)) {
            return <p key={i} className="m-0 px-1 text-base italic leading-relaxed text-ink-muted">{line.text}</p>;
          }
          const c = CHARACTERS[line.speaker];
          return (
            <div key={i} className="flex items-end gap-3">
              <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-surface-strong ring-1 ring-line">
                <img src={c.avatar} alt="" className="size-full object-cover" draggable={false} />
              </span>
              <div className="min-w-0 max-w-[85%] rounded-2xl rounded-bl-md bg-surface p-3 ring-1 ring-line">
                <p className="m-0 text-xs font-bold text-brand-ink">{c.name}</p>
                <p className="m-0 mt-0.5 text-base leading-relaxed text-ink">{line.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** The four friends, for the story cards and the intro screen. */
export function Cast({ size = 'size-9' }: { size?: string }) {
  return (
    <span className="flex -space-x-2 rtl:space-x-reverse" aria-hidden="true">
      {(['sarah', 'adam', 'yasmin', 'tariq'] as CharacterId[]).map((id) => (
        <span key={id} className={`${size} overflow-hidden rounded-full bg-surface-strong ring-2 ring-surface`}>
          <img src={CHARACTERS[id].avatar} alt="" className="size-full object-cover" draggable={false} />
        </span>
      ))}
    </span>
  );
}
