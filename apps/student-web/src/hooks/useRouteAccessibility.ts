import { RefObject, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const SUFFIX = 'AIM';

function titleFrom(root: HTMLElement | null, fallback?: string): string {
  // Loading, empty and error states often render without the page's <h1>; fall back to the section name.
  const heading = root?.querySelector('h1')?.textContent?.trim() || fallback;
  return heading ? `${heading} – ${SUFFIX}` : SUFFIX;
}

/**
 * A single-page app never reloads, so screen readers hear nothing when the route changes and the tab
 * title stays the same on every screen. This keeps `document.title` in step with the page's <h1>
 * (headings often render after data loads, hence the observer) and, on navigation, moves focus to the
 * main region so keyboard and screen-reader users start at the top of the new page.
 */
export function useRouteAccessibility(mainRef: RefObject<HTMLElement | null>, options: { moveFocus?: boolean; fallbackTitle?: string } = {}) {
  const { moveFocus = true, fallbackTitle } = options;
  const { pathname } = useLocation();
  const firstRender = useRef(true);

  useEffect(() => {
    const main = mainRef.current;
    document.title = titleFrom(main, fallbackTitle);
    if (moveFocus && !firstRender.current) main?.focus({ preventScroll: true });
    firstRender.current = false;

    if (!main || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(() => {
      const next = titleFrom(main, fallbackTitle);
      if (document.title !== next) document.title = next;
    });
    observer.observe(main, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [pathname, mainRef, moveFocus, fallbackTitle]);
}
