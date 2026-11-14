import { useEffect, useRef, useState } from 'react';
import { Markdown } from '../../components/common/Markdown';
import { balanceMarkdown } from './useTypewriter';

export interface Thought {
  id: string;
  text: string;
  /** Still being written (shows a caret). */
  typing: boolean;
}

/**
 * What the robot is saying, as a thought bubble rising from the top-right of its head. When the robot says something
 * new, the new bubble pops up over the old one while the old one shrinks and fades behind it.
 */
export function RobotThoughts({ thought }: { thought: Thought | null }) {
  const shown = useRef<Thought | null>(null);
  const [leaving, setLeaving] = useState<Thought | null>(null);
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const before = shown.current;
    shown.current = thought;
    if (before && thought && before.id !== thought.id) {
      setLeaving(before);
      const timer = window.setTimeout(() => setLeaving(null), 520);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [thought?.id, thought?.text]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the newest words in view while a long reply is written.
  useEffect(() => {
    const el = body.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thought?.text]);

  if (!thought) return null;
  return (
    <div className="vr-thoughts" aria-hidden="true">
      {leaving && (
        <div className="vr-bubble vr-bubble-out">
          <div className="max-h-[34vh] overflow-hidden text-base leading-relaxed text-ink [unicode-bidi:plaintext]">
            <Markdown text={balanceMarkdown(leaving.text)} />
          </div>
        </div>
      )}
      <div key={thought.id} className="vr-bubble vr-bubble-in">
        <div ref={body} className="max-h-[34vh] overflow-y-auto text-base leading-relaxed text-ink [unicode-bidi:plaintext]">
          <Markdown text={balanceMarkdown(thought.text)} />
          {thought.typing && <span className="vr-caret" />}
        </div>
        {/* Small circles trailing down toward the robot's head, like a thought. */}
        <span className="vr-dot vr-dot-1" />
        <span className="vr-dot vr-dot-2" />
        <span className="vr-dot vr-dot-3" />
      </div>
    </div>
  );
}
