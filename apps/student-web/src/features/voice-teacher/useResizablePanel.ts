import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';

export const PANEL_MIN = 320;
export const PANEL_MAX = 760;
export const PANEL_DEFAULT = 432;
const STEP = 24;

/** Keep a panel width inside the allowed range and never wider than [maxShare] of the window. */
export function clampPanelWidth(width: number, viewport: number, maxShare = 0.6): number {
  const max = Math.max(PANEL_MIN, Math.min(PANEL_MAX, Math.round(viewport * maxShare)));
  return Math.round(Math.min(max, Math.max(PANEL_MIN, width)));
}

function read(key: string): number | null {
  try {
    const n = Number.parseInt(localStorage.getItem(key) ?? '', 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function write(key: string, value: number) {
  try { localStorage.setItem(key, String(value)); } catch { /* a convenience only */ }
}

/**
 * A side panel the user can drag to resize (like the chat panel of a code editor). The width is remembered.
 * The handle also works from the keyboard: arrow keys move it, Home/End go to the smallest/widest, Enter resets.
 * `panelAtEnd` is true when the panel sits at the end side of the layout (right in left-to-right, left in right-to-left).
 */
export function useResizablePanel(storageKey: string) {
  const viewport = () => (typeof window === 'undefined' ? 1440 : window.innerWidth);
  const [width, setWidth] = useState(() => clampPanelWidth(read(storageKey) ?? PANEL_DEFAULT, viewport()));
  const [dragging, setDragging] = useState(false);
  const widthRef = useRef(width);
  widthRef.current = width;

  // A smaller window must never leave the panel wider than its share.
  useEffect(() => {
    const onResize = () => setWidth((w) => clampPanelWidth(w, viewport()));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const set = useCallback((next: number, persist: boolean) => {
    const clamped = clampPanelWidth(next, viewport());
    setWidth(clamped);
    if (persist) write(storageKey, clamped);
  }, [storageKey]);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    setDragging(true);
    const rtl = document.documentElement.dir === 'rtl';
    const move = (ev: PointerEvent) => {
      // The panel is at the end side: its width is the distance from the pointer to that edge of the window.
      set(rtl ? ev.clientX : window.innerWidth - ev.clientX, false);
    };
    const up = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
      setDragging(false);
      write(storageKey, widthRef.current);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  }, [set, storageKey]);

  const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLElement>) => {
    const rtl = document.documentElement.dir === 'rtl';
    // Moving the handle toward the start side makes the panel wider.
    const wider = rtl ? 'ArrowRight' : 'ArrowLeft';
    const narrower = rtl ? 'ArrowLeft' : 'ArrowRight';
    if (e.key === wider) set(widthRef.current + STEP, true);
    else if (e.key === narrower) set(widthRef.current - STEP, true);
    else if (e.key === 'Home') set(PANEL_MIN, true);
    else if (e.key === 'End') set(PANEL_MAX, true);
    else if (e.key === 'Enter') set(PANEL_DEFAULT, true);
    else return;
    e.preventDefault();
  }, [set]);

  const reset = useCallback(() => set(PANEL_DEFAULT, true), [set]);

  return { width, dragging, onPointerDown, onKeyDown, reset };
}
