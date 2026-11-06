import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { getErrorMessage } from '../../api/client';
import { vocabularyApi, type WordSource } from './learnerApi';

/** A saved word is one to four words, no longer than the server accepts. */
export function cleanSelection(raw: string): string | null {
  const text = raw.replace(/\s+/g, ' ').trim().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
  if (!text || text.length > 60 || text.split(' ').length > 4) return null;
  return /\p{L}/u.test(text) ? text : null;
}

/**
 * Wrap text the student reads (AI replies, lesson text). Selecting a word or short phrase inside it
 * shows a small bar to save the word to "My words" or ask the AI Teacher what it means.
 * The bar is pinned to the bottom of the screen so it never fights the browser's own selection menu on phones.
 */
export function SelectToSave({ children, source, className }: { children: ReactNode; source: WordSource; className?: string }) {
  const { t } = useI18n();
  const box = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<{ word: string; context: string } | null>(null);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const read = useCallback(() => {
    const sel = window.getSelection();
    const root = box.current;
    if (!sel || sel.isCollapsed || !root || !sel.anchorNode || !root.contains(sel.anchorNode) || !sel.focusNode || !root.contains(sel.focusNode)) {
      setSelected(null);
      return;
    }
    const word = cleanSelection(sel.toString());
    if (!word) { setSelected(null); return; }
    const context = (sel.anchorNode.parentElement?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 300);
    setSelected({ word, context });
    setState('idle');
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', read);
    return () => document.removeEventListener('selectionchange', read);
  }, [read]);

  async function save() {
    if (!selected) return;
    setState('saving');
    try {
      await vocabularyApi.save({ word: selected.word, context: selected.context || undefined, source });
      setState('saved');
      setMessage(t('Saved to My words'));
    } catch (err) {
      setState('error');
      setMessage(getErrorMessage(err, t('Could not save the word')));
    }
  }

  return (
    <div ref={box} className={className}>
      {children}
      {selected && (
        <div
          role="region"
          aria-label={t('Save selected word')}
          className="fixed inset-x-3 bottom-20 z-50 mx-auto flex max-w-md items-center gap-2 rounded-2xl bg-elevated p-2 ps-4 ring-1 ring-line md:bottom-6"
        >
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink [unicode-bidi:plaintext]">“{selected.word}”</span>
          {state === 'saved' || state === 'error' ? (
            <span role="status" className={`text-xs font-bold ${state === 'saved' ? 'text-success-ink' : 'text-danger-ink'}`}>{message}</span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => void save()}
                disabled={state === 'saving'}
                className="h-10 shrink-0 rounded-xl border-0 bg-brand px-4 text-sm font-bold text-white cursor-pointer disabled:opacity-60"
              >
                {t('Save word')}
              </button>
              <Link
                to={`/ai-teacher?ask=${encodeURIComponent(selected.word)}`}
                className="inline-flex h-10 shrink-0 items-center rounded-xl bg-brand-soft px-3 text-sm font-bold text-brand-ink no-underline"
              >
                {t('Ask AI')}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
