import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { ListSkeleton } from '../../components/common/Skeleton';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { vocabularyLibraryApi, type LibraryWord, type VocabLevel } from './learnerApi';

const PAGE_SIZE = 24;
const LEVELS: Array<{ id: VocabLevel | 'all'; label: string }> = [
  { id: 'all', label: 'All levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];
/** Difficulty badge colours reuse the app's soft status tones: easy = green, medium = amber, hard = red. */
const LEVEL_TONE: Record<VocabLevel, string> = {
  beginner: 'bg-success-soft text-success-ink',
  intermediate: 'bg-warning-soft text-warning-ink',
  advanced: 'bg-danger-soft text-danger-ink',
};
const LEVEL_LABEL: Record<VocabLevel, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

function SpeakerIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}
function BookmarkIcon({ filled, className = 'size-5' }: { filled: boolean; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

const ICON_BTN =
  'grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border-0 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-60';

/** Browse the vocabulary library: word, Arabic meaning of the word, an example sentence, listen and save to My words. */
export function VocabularyLibraryPage() {
  const { t } = useI18n();
  const [level, setLevel] = useState<VocabLevel | 'all'>('all');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [words, setWords] = useState<LibraryWord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [playing, setPlaying] = useState<string | null>(null);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  // Debounce the search box so we don't call the API on every keystroke.
  useEffect(() => {
    const id = window.setTimeout(() => setSearch(query.trim()), 300);
    return () => window.clearTimeout(id);
  }, [query]);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    vocabularyLibraryApi.list({ level: level === 'all' ? undefined : level, q: search || undefined, limit: PAGE_SIZE, offset: 0 })
      .then((r) => { setWords(r.words); setTotal(r.total); })
      .catch((e) => setError(getErrorMessage(e, t('Could not load the vocabulary'))))
      .finally(() => setLoading(false));
  }, [level, search, t]);
  useEffect(() => { load(); }, [load]);

  // Stop any sound and free the audio when leaving the page.
  useEffect(() => () => {
    audioRef.current?.pause();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  async function more() {
    setLoadingMore(true);
    try {
      const r = await vocabularyLibraryApi.list({ level: level === 'all' ? undefined : level, q: search || undefined, limit: PAGE_SIZE, offset: words.length });
      setWords((w) => [...w, ...r.words.filter((x) => !w.some((y) => y.id === x.id))]);
      setTotal(r.total);
    } catch (e) {
      setNotice(getErrorMessage(e, t('Could not load the vocabulary')));
    } finally { setLoadingMore(false); }
  }

  async function listen(w: LibraryWord) {
    setNotice('');
    audioRef.current?.pause();
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; }
    setPlaying(w.id);
    try {
      const blob = await vocabularyLibraryApi.audio(w.id);
      if (!blob.size) throw new Error('empty');
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setPlaying((p) => (p === w.id ? null : p));
      audio.onerror = () => setPlaying((p) => (p === w.id ? null : p));
      await audio.play();
    } catch {
      // Server voice not available: fall back to the browser's own voice.
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(w.word);
        u.lang = 'en-US';
        u.onend = () => setPlaying((p) => (p === w.id ? null : p));
        window.speechSynthesis.speak(u);
      } else {
        setPlaying(null);
        setNotice(t('Could not play the audio'));
      }
    }
  }

  async function toggleSave(w: LibraryWord) {
    if (busy.has(w.id)) return;
    setNotice('');
    const next = !w.saved;
    setBusy((b) => new Set(b).add(w.id));
    setWords((list) => list.map((x) => (x.id === w.id ? { ...x, saved: next } : x)));
    try {
      if (next) await vocabularyLibraryApi.save(w.id); else await vocabularyLibraryApi.unsave(w.id);
    } catch (e) {
      setWords((list) => list.map((x) => (x.id === w.id ? { ...x, saved: !next } : x)));
      setNotice(getErrorMessage(e, t('Could not update your saved words')));
    } finally {
      setBusy((b) => { const n = new Set(b); n.delete(w.id); return n; });
    }
  }

  return (
    <div className="stagger flex w-full flex-col gap-6">
      <PageTitleBar
        title={t('Vocabulary')}
        subtitle={t('Browse words with their Arabic meaning, listen to how they sound and save the ones you want to learn.')}
      />

      <div className="flex flex-col gap-3">
        <input
          type="search" value={query} onChange={(e) => setQuery(e.target.value)} dir="auto"
          placeholder={t('Search words')} aria-label={t('Search words')}
          className="h-12 w-full rounded-xl border border-line bg-field px-4 text-ink outline-none placeholder:text-ink-muted focus:border-focus focus:ring-2 focus:ring-focus/30"
        />
        <div role="group" aria-label={t('Level')} className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button key={l.id} type="button" aria-pressed={level === l.id} onClick={() => setLevel(l.id)}
              className={`h-10 cursor-pointer rounded-full border-0 px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                level === l.id ? 'bg-brand text-white' : 'bg-surface text-ink-soft ring-1 ring-line hover:ring-line-strong'
              }`}>
              {t(l.label)}
            </button>
          ))}
        </div>
      </div>

      {notice && <p role="alert" className="m-0 rounded-xl bg-warning-soft px-4 py-3 text-sm font-semibold text-warning-ink">{notice}</p>}

      {loading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : words.length === 0 ? (
        <EmptyState title={t('No words found')} message={t('Try another level or search.')} />
      ) : (
        <section aria-label={t('Vocabulary')} className="flex flex-col gap-4">
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
            {words.map((w) => (
              <li key={w.id} className="flex flex-col gap-3 rounded-2xl bg-surface p-5 ring-1 ring-line">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_TONE[w.level]}`}>{t(LEVEL_LABEL[w.level])}</span>
                      {w.partOfSpeech && <span className="text-xs text-ink-muted">{t(w.partOfSpeech)}</span>}
                    </div>
                    <p dir="ltr" className="lp-display m-0 mt-2 text-[1.75rem] font-semibold text-ink [overflow-wrap:anywhere]">{w.word}</p>
                    <p dir="rtl" lang="ar" className="m-0 mt-1 text-lg font-semibold text-brand-ink">{w.translationAr}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => void listen(w)} aria-label={t('Listen to {word}', { word: w.word })}
                      className={`${ICON_BTN} ${playing === w.id ? 'bg-brand text-white' : 'bg-surface-strong text-ink hover:bg-surface-muted'}`}>
                      <SpeakerIcon />
                    </button>
                    <button type="button" onClick={() => void toggleSave(w)} disabled={busy.has(w.id)} aria-pressed={w.saved}
                      aria-label={w.saved ? t('Remove {word} from My words', { word: w.word }) : t('Save {word} to My words', { word: w.word })}
                      className={`${ICON_BTN} ${w.saved ? 'bg-brand text-white' : 'bg-surface-strong text-ink hover:bg-surface-muted'}`}>
                      <BookmarkIcon filled={w.saved} />
                    </button>
                  </div>
                </div>
                <p dir="ltr" className="m-0 border-s-2 border-line ps-3 text-sm italic text-ink-soft">“{w.exampleSentence}”</p>
              </li>
            ))}
          </ul>
          <div className="flex flex-col items-center gap-3">
            <p className="m-0 text-xs text-ink-muted">{t('Showing {shown} of {total} words', { shown: words.length, total })}</p>
            {words.length < total && (
              <Button variant="secondary" onClick={() => void more()} disabled={loadingMore}>
                {loadingMore ? t('Loading…') : t('Show more words')}
              </Button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
