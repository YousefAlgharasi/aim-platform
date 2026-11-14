import { useEffect, useState } from 'react';

/** Milliseconds per character: about 36 characters a second, like a reply streaming in. */
const MS_PER_CHAR = 28;
const MIN_MS = 900;
const MAX_MS = 8000;

/** Make half-typed markdown safe to render: close a bold or code span that has not been closed yet. */
export function balanceMarkdown(text: string): string {
  let out = text;
  if ((out.match(/\*\*/g) ?? []).length % 2 === 1) out += '**';
  if ((out.match(/`/g) ?? []).length % 2 === 1) out += '`';
  return out;
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Reveals one message letter by letter, like a reply being written live. Only the message passed in animates; give it
 * `null` (or a message that was already there when the page opened) and nothing is delayed. With "reduce motion" on, the
 * message appears at once.
 */
export function useTypewriter(target: { id: string; text: string } | null) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const id = target?.id ?? null;
  const length = target?.text.length ?? 0;

  useEffect(() => {
    if (id === null) { setActiveId(null); return undefined; }
    setActiveId(id);
    if (prefersReducedMotion()) { setCount(length); return undefined; }
    setCount(0);
    const duration = Math.min(MAX_MS, Math.max(MIN_MS, length * MS_PER_CHAR));
    let start: number | null = null;
    let raf = 0;
    const tick = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min(1, (now - start) / duration);
      setCount(Math.floor(progress * length));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [id, length]);

  const ready = target !== null && activeId === id;
  const shownText = target === null ? '' : ready ? target.text.slice(0, count) : '';
  const typing = ready && count < length;
  return { id, shownText, typing };
}
