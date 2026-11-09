// Vocabulary library: the words students see under Vocabulary in the student web and the mobile app.
// Each word has an English spelling, the Arabic translation of the word only, an English example
// sentence, a part of speech and a difficulty (beginner / intermediate / advanced).
'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { CoursePaymentsStyles } from '../../../features/course-payments/course-payments-styles';
import {
  PARTS_OF_SPEECH, VocabLevel, VocabularyList, VocabularyWord, VocabularyWordInput, vocabularyApi,
} from '../../../features/vocabulary/api';
import { OperationsErrorCard, OperationsLoadingSpinner } from '../../../shared/components/operations';

const PAGE = 50;
const LEVELS: Array<{ id: VocabLevel | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

type Draft = {
  word: string; translationAr: string; exampleSentence: string; partOfSpeech: string;
  level: VocabLevel; sortOrder: string; isActive: boolean;
};

const EMPTY: Draft = { word: '', translationAr: '', exampleSentence: '', partOfSpeech: 'noun', level: 'beginner', sortOrder: '0', isActive: true };

const toDraft = (w: VocabularyWord): Draft => ({
  word: w.word, translationAr: w.translationAr, exampleSentence: w.exampleSentence,
  partOfSpeech: w.partOfSpeech ?? '', level: w.level, sortOrder: String(w.sortOrder), isActive: w.isActive,
});

const toInput = (d: Draft): VocabularyWordInput => ({
  word: d.word.trim(), translationAr: d.translationAr.trim(), exampleSentence: d.exampleSentence.trim(),
  partOfSpeech: d.partOfSpeech || null, level: d.level, sortOrder: Number.parseInt(d.sortOrder, 10) || 0, isActive: d.isActive,
});

function Editor({ draft, onChange, onSave, onCancel, saving, isNew }: {
  draft: Draft; onChange: (d: Draft) => void; onSave: () => void; onCancel: () => void; saving: boolean; isNew: boolean;
}) {
  const set = (patch: Partial<Draft>) => onChange({ ...draft, ...patch });
  const sentenceHasWord = !draft.word.trim() || draft.exampleSentence.toLowerCase().includes(draft.word.trim().toLowerCase().slice(0, Math.max(3, draft.word.trim().length - 2)));
  const valid = draft.word.trim() && draft.translationAr.trim() && draft.exampleSentence.trim();
  return (
    <section className="cp-card" aria-label={isNew ? 'New word' : 'Edit word'}>
      <h2 className="cp-card-title">{isNew ? 'New word' : 'Edit word'}</h2>
      <div className="cp-fields">
        <div className="cp-field">
          <label className="cp-label" htmlFor="vw-word">Word (English)</label>
          <input id="vw-word" className="cp-input" value={draft.word} maxLength={60} disabled={saving} dir="ltr"
            onChange={(e) => set({ word: e.target.value })} />
        </div>
        <div className="cp-field">
          <label className="cp-label" htmlFor="vw-ar">Arabic translation (the word only, not the sentence)</label>
          <input id="vw-ar" className="cp-input" value={draft.translationAr} maxLength={200} disabled={saving} dir="rtl"
            onChange={(e) => set({ translationAr: e.target.value })} />
        </div>
      </div>
      <div className="cp-field">
        <label className="cp-label" htmlFor="vw-ex">Example sentence (English, uses the word)</label>
        <input id="vw-ex" className="cp-input" value={draft.exampleSentence} maxLength={300} disabled={saving} dir="ltr"
          onChange={(e) => set({ exampleSentence: e.target.value })} />
        {!sentenceHasWord && <p className="cp-muted">The sentence does not seem to contain the word.</p>}
      </div>
      <div className="cp-fields">
        <div className="cp-field">
          <label className="cp-label" htmlFor="vw-level">Difficulty</label>
          <select id="vw-level" className="cp-input" value={draft.level} disabled={saving} onChange={(e) => set({ level: e.target.value as VocabLevel })}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="cp-field">
          <label className="cp-label" htmlFor="vw-pos">Part of speech</label>
          <select id="vw-pos" className="cp-input" value={draft.partOfSpeech} disabled={saving} onChange={(e) => set({ partOfSpeech: e.target.value })}>
            <option value="">—</option>
            {PARTS_OF_SPEECH.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="cp-field">
          <label className="cp-label" htmlFor="vw-order">Order</label>
          <input id="vw-order" className="cp-input" type="number" value={draft.sortOrder} disabled={saving} onChange={(e) => set({ sortOrder: e.target.value })} />
        </div>
      </div>
      <label className="cp-label">
        <input type="checkbox" checked={draft.isActive} disabled={saving} onChange={(e) => set({ isActive: e.target.checked })} /> Visible to students
      </label>
      <div className="cp-actions">
        <button type="button" className="cp-btn" onClick={onSave} disabled={saving || !valid}>{saving ? 'Saving…' : 'Save'}</button>
        <button type="button" className="cp-btn cp-btn--ghost" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </section>
  );
}

export default function VocabularyPage() {
  const [data, setData] = useState<VocabularyList | null>(null);
  const [level, setLevel] = useState<VocabLevel | 'all'>('all');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => { setSearch(query.trim()); setOffset(0); }, 300);
    return () => window.clearTimeout(id);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await vocabularyApi.list({ level: level === 'all' ? undefined : level, q: search || undefined, limit: PAGE, offset }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load words.');
    } finally {
      setLoading(false);
    }
  }, [level, search, offset]);

  useEffect(() => { load(); }, [load]);

  const run = async (action: () => Promise<string>) => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      setNotice(await action());
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const save = () => editing && run(async () => {
    if (editing.id) await vocabularyApi.update(editing.id, toInput(editing.draft));
    else await vocabularyApi.create(toInput(editing.draft));
    return 'Saved.';
  });

  const remove = (w: VocabularyWord) => {
    if (!window.confirm(`Delete "${w.word}"? Students who already saved it keep their copy.`)) return;
    run(async () => { await vocabularyApi.remove(w.id); return 'Deleted.'; });
  };

  const counts = data?.counts ?? {};
  const totalAll = (counts.beginner ?? 0) + (counts.intermediate ?? 0) + (counts.advanced ?? 0);
  const total = data?.total ?? 0;

  return (
    <div className="cp-page">
      <CoursePaymentsStyles />
      <header className="cp-header">
        <p className="cp-eyebrow">Learning</p>
        <h1 className="cp-title">Vocabulary</h1>
        <p className="cp-meta">
          The word library students browse in the student web and the mobile app. Each word has its Arabic translation (the word
          only), an example sentence, and a difficulty. Students can listen to a word and save it to My words.
          {' '}{totalAll} words in total ({counts.beginner ?? 0} beginner · {counts.intermediate ?? 0} intermediate · {counts.advanced ?? 0} advanced).
        </p>
      </header>

      <div className="cp-tabs" role="group" aria-label="Difficulty">
        {LEVELS.map((l) => (
          <button key={l.id} type="button" className="cp-tab" aria-pressed={level === l.id}
            onClick={() => { setLevel(l.id); setOffset(0); setEditing(null); }}>
            {l.label}
          </button>
        ))}
      </div>

      <div className="cp-field">
        <label className="cp-label" htmlFor="vw-search">Search by English word or Arabic</label>
        <input id="vw-search" className="cp-input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {notice && <div className="cp-success" role="status">{notice}</div>}
      {loading && !data && <OperationsLoadingSpinner />}
      {error && <OperationsErrorCard message={error} onRetry={load} />}

      {data && (
        <>
          {editing ? (
            <Editor draft={editing.draft} isNew={!editing.id} saving={saving}
              onChange={(draft) => setEditing({ ...editing, draft })} onSave={save} onCancel={() => setEditing(null)} />
          ) : (
            <div className="cp-actions">
              <button type="button" className="cp-btn"
                onClick={() => setEditing({ id: null, draft: { ...EMPTY, level: level === 'all' ? 'beginner' : level } })}>
                Add word
              </button>
            </div>
          )}

          {data.words.length === 0 ? (
            <div className="cp-empty">No words found. Add one so students can learn it.</div>
          ) : (
            <div className="cp-table-wrap">
              <table className="cp-table">
                <thead>
                  <tr><th>Word</th><th>Arabic</th><th>Example</th><th>Type</th><th>Difficulty</th><th>Status</th><th /></tr>
                </thead>
                <tbody>
                  {data.words.map((w) => (
                    <tr key={w.id}>
                      <td className="cp-strong" dir="ltr">{w.word}</td>
                      <td dir="rtl">{w.translationAr}</td>
                      <td dir="ltr">{w.exampleSentence}</td>
                      <td>{w.partOfSpeech ?? '—'}</td>
                      <td>{w.level}</td>
                      <td><span className={`cp-badge cp-badge--${w.isActive ? 'active' : 'revoked'}`}>{w.isActive ? 'Visible' : 'Hidden'}</span></td>
                      <td>
                        <div className="cp-actions">
                          <button type="button" className="cp-btn cp-btn--ghost" disabled={saving} onClick={() => setEditing({ id: w.id, draft: toDraft(w) })}>Edit</button>
                          <button type="button" className="cp-btn cp-btn--danger" disabled={saving} onClick={() => remove(w)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {total > PAGE && (
            <div className="cp-actions">
              <button type="button" className="cp-btn cp-btn--ghost" disabled={offset === 0 || loading} onClick={() => setOffset(Math.max(0, offset - PAGE))}>Previous</button>
              <span className="cp-muted">{offset + 1}–{Math.min(offset + PAGE, total)} of {total}</span>
              <button type="button" className="cp-btn cp-btn--ghost" disabled={offset + PAGE >= total || loading} onClick={() => setOffset(offset + PAGE)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
