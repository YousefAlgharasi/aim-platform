import React from 'react';

/**
 * Injects a component's CSS once per document. Safe to call on every render.
 * Keeps components self-contained while still supporting :hover / :active /
 * :focus-visible states that inline styles can't express.
 */
export function useScopedStyles(id, css) {
  if (typeof document === 'undefined') return;
  if (document.getElementById(id)) return;
  const el = document.createElement('style');
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
