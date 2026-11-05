import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { searchApi, type SearchResults } from './learnerApi';

interface Row { key: string; label: string; sub?: string; group: string; to: string }

export function flatten(r: SearchResults, t: (s: string) => string): Row[] {
  return [
    ...r.courses.map((c) => ({ key: `c${c.id}`, label: c.title, sub: c.levelCode ?? undefined, group: t('Courses'), to: `/curriculum/${c.id}` })),
    ...r.lessons.map((l) => ({ key: `l${l.id}`, label: l.title, sub: l.courseTitle, group: t('Lessons'), to: `/lessons/${l.id}` })),
    ...r.words.map((w) => ({ key: `w${w.id}`, label: w.word, sub: w.meaning ?? undefined, group: t('My words'), to: '/vocabulary' })),
  ];
}

/** Ctrl/⌘+K search over courses, lessons and your saved words. Open it with the button in the sidebar too. */
export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const rows = useMemo(() => (results ? flatten(results, t) : []), [results, t]);

  useEffect(() => { if (open) { setQuery(''); setResults(null); setActive(0); setFailed(false); setTimeout(() => input.current?.focus(), 0); } }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) { setResults(null); return; }
    let alive = true;
    const id = window.setTimeout(() => {
      searchApi.search(q, locale === 'ar' ? 'ar' : 'en')
        .then((r) => { if (alive) { setResults(r); setActive(0); setFailed(false); } })
        .catch(() => alive && setFailed(true));
    }, 250);
    return () => { alive = false; window.clearTimeout(id); };
  }, [query, open, locale]);

  const go = useCallback((to: string) => { onClose(); navigate(to); }, [navigate, onClose]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, rows.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && rows[active]) { e.preventDefault(); go(rows[active].to); }
  }

  if (!open) return null;
  let lastGroup = '';
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-overlay/50 p-4 pt-[12vh] backdrop-blur-sm" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={t('Search')} onMouseDown={(e) => e.stopPropagation()} onKeyDown={onKeyDown}
        className="w-full max-w-xl overflow-hidden rounded-3xl bg-elevated shadow-2xl ring-1 ring-line">
        <input ref={input} value={query} onChange={(e) => setQuery(e.target.value)} dir="auto"
          placeholder={t('Search courses, lessons and your words')} aria-label={t('Search')}
          role="combobox" aria-expanded={rows.length > 0} aria-controls="search-results" aria-activedescendant={rows[active] ? `sr-${rows[active].key}` : undefined}
          className="h-14 w-full border-0 border-b border-line-subtle bg-transparent px-5 text-base text-ink outline-none placeholder:text-ink-muted" />
        <div id="search-results" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {query.trim().length < 2 && <p className="m-0 p-4 text-sm text-ink-muted">{t('Type at least 2 letters.')}</p>}
          {failed && <p className="m-0 p-4 text-sm text-danger-ink">{t('Search is not available right now.')}</p>}
          {results && rows.length === 0 && !failed && <p className="m-0 p-4 text-sm text-ink-muted">{t('No results for “{q}”.', { q: query.trim() })}</p>}
          {rows.map((r, i) => {
            const header = r.group !== lastGroup ? (lastGroup = r.group) : null;
            return (
              <div key={r.key}>
                {header && <p className="m-0 px-3 pb-1 pt-3 text-xs font-bold text-ink-muted">{header}</p>}
                <button id={`sr-${r.key}`} role="option" aria-selected={i === active} type="button" onClick={() => go(r.to)} onMouseEnter={() => setActive(i)}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border-0 px-3 py-3 text-start ${i === active ? 'bg-brand-soft text-brand-ink' : 'bg-transparent text-ink'}`}>
                  <span className="min-w-0 truncate font-semibold [unicode-bidi:plaintext]">{r.label}</span>
                  {r.sub && <span className="max-w-[45%] shrink-0 truncate text-xs text-ink-muted [unicode-bidi:plaintext]">{r.sub}</span>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
