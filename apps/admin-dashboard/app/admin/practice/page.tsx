// Practice topics: what students can practise in Practice Speaking (a talk with the AI teacher in
// a role) and Write a Paragraph (marked by AI). Each topic has English + Arabic text, the AI
// prompt (never shown to students), XP, an optional time limit and, for writing, a minimum length.
'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { CoursePaymentsStyles } from '../../../features/course-payments/course-payments-styles';
import { PracticeKind, PracticeTopic, PracticeTopicInput, practiceApi } from '../../../features/practice/api';
import { OperationsErrorCard, OperationsLoadingSpinner } from '../../../shared/components/operations';

type Draft = {
  titleEn: string; descEn: string; titleAr: string; descAr: string;
  levelCode: string; xpReward: string; minutes: string; minWords: string;
  aiPrompt: string; sortOrder: string; isActive: boolean;
};

const EMPTY: Draft = {
  titleEn: '', descEn: '', titleAr: '', descAr: '', levelCode: 'A1', xpReward: '20',
  minutes: '', minWords: '30', aiPrompt: '', sortOrder: '0', isActive: true,
};

const toDraft = (t: PracticeTopic): Draft => ({
  titleEn: t.translations.en?.title ?? '', descEn: t.translations.en?.description ?? '',
  titleAr: t.translations.ar?.title ?? '', descAr: t.translations.ar?.description ?? '',
  levelCode: t.levelCode ?? '', xpReward: String(t.xpReward),
  minutes: t.timeLimitSeconds ? String(Math.round(t.timeLimitSeconds / 60)) : '',
  minWords: t.minWords ? String(t.minWords) : '', aiPrompt: t.aiPrompt,
  sortOrder: String(t.sortOrder), isActive: t.isActive,
});

function toInput(kind: PracticeKind, d: Draft): PracticeTopicInput {
  const translations: PracticeTopicInput['translations'] = {
    en: { title: d.titleEn.trim(), description: d.descEn.trim() || null },
  };
  if (d.titleAr.trim()) translations.ar = { title: d.titleAr.trim(), description: d.descAr.trim() || null };
  const minutes = Number.parseInt(d.minutes, 10);
  return {
    kind,
    levelCode: d.levelCode.trim() || null,
    xpReward: Number.parseInt(d.xpReward, 10) || 0,
    timeLimitSeconds: minutes > 0 ? minutes * 60 : null,
    minWords: kind === 'writing' ? Number.parseInt(d.minWords, 10) || null : null,
    aiPrompt: d.aiPrompt.trim(),
    sortOrder: Number.parseInt(d.sortOrder, 10) || 0,
    isActive: d.isActive,
    translations,
  };
}

function Editor({ kind, draft, onChange, onSave, onCancel, saving, isNew }: {
  kind: PracticeKind; draft: Draft; onChange: (d: Draft) => void;
  onSave: () => void; onCancel: () => void; saving: boolean; isNew: boolean;
}) {
  const set = (patch: Partial<Draft>) => onChange({ ...draft, ...patch });
  const field = (label: string, key: keyof Draft, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="cp-field">
      <label className="cp-label" htmlFor={`pt-${key}`}>{label}</label>
      <input id={`pt-${key}`} className="cp-input" value={String(draft[key])} disabled={saving}
        onChange={(e) => set({ [key]: e.target.value } as Partial<Draft>)} {...props} />
    </div>
  );
  return (
    <section className="cp-card" aria-label={isNew ? 'New topic' : 'Edit topic'}>
      <h2 className="cp-card-title">{isNew ? 'New topic' : 'Edit topic'}</h2>
      <div className="cp-fields">
        {field('Title (English)', 'titleEn', { maxLength: 200 })}
        {field('Description (English)', 'descEn', { maxLength: 1000 })}
        {field('Title (Arabic)', 'titleAr', { maxLength: 200, dir: 'rtl' })}
        {field('Description (Arabic)', 'descAr', { maxLength: 1000, dir: 'rtl' })}
      </div>
      <div className="cp-fields">
        {field('Level (A1, A2…)', 'levelCode', { maxLength: 10 })}
        {field('XP reward', 'xpReward', { type: 'number', min: 0, max: 1000 })}
        {field(kind === 'speaking' ? 'Time limit (minutes)' : 'Writing time (minutes)', 'minutes', { type: 'number', min: 1, max: 120, placeholder: 'No limit' })}
        {kind === 'writing' && field('Minimum words', 'minWords', { type: 'number', min: 1, max: 1000 })}
        {field('Order', 'sortOrder', { type: 'number' })}
      </div>
      <div className="cp-field">
        <label className="cp-label" htmlFor="pt-prompt">
          {kind === 'speaking' ? 'AI prompt: the role the AI teacher plays (students never see this)' : 'Marking hints for the AI (students never see this)'}
        </label>
        <textarea id="pt-prompt" className="cp-textarea" rows={5} maxLength={4000} value={draft.aiPrompt} disabled={saving}
          onChange={(e) => set({ aiPrompt: e.target.value })}
          placeholder={kind === 'speaking' ? 'You are Mr. Brown, the student\'s boss. The student asks for a day off…' : 'The student describes their daily routine…'} />
      </div>
      <label className="cp-label">
        <input type="checkbox" checked={draft.isActive} disabled={saving} onChange={(e) => set({ isActive: e.target.checked })} /> Visible to students
      </label>
      <div className="cp-actions">
        <button type="button" className="cp-btn" onClick={onSave} disabled={saving || !draft.titleEn.trim() || !draft.aiPrompt.trim()}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className="cp-btn cp-btn--ghost" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </section>
  );
}

export default function PracticeTopicsPage() {
  const [topics, setTopics] = useState<PracticeTopic[]>([]);
  const [kind, setKind] = useState<PracticeKind>('speaking');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTopics(await practiceApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load topics.');
    } finally {
      setLoading(false);
    }
  }, []);

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
    const input = toInput(kind, editing.draft);
    if (editing.id) await practiceApi.update(editing.id, input);
    else await practiceApi.create(input);
    return 'Saved.';
  });

  const remove = (t: PracticeTopic) => {
    if (!window.confirm('Delete this topic? Topics students already used are hidden instead.')) return;
    run(async () => ((await practiceApi.remove(t.id)).deleted ? 'Deleted.' : 'Hidden from students (it has attempts).'));
  };

  const shown = topics.filter((t) => t.kind === kind);

  return (
    <div className="cp-page">
      <CoursePaymentsStyles />
      <header className="cp-header">
        <p className="cp-eyebrow">Learning</p>
        <h1 className="cp-title">Practice topics</h1>
        <p className="cp-meta">
          Topics for Practice Speaking (a spoken role-play with the AI teacher) and Write a Paragraph (marked by AI, score
          out of 100). Students earn XP only. Only students with a started, active course can use them.
        </p>
      </header>

      <div className="cp-tabs" role="group" aria-label="Topic type">
        {(['speaking', 'writing'] as const).map((k) => (
          <button key={k} type="button" className="cp-tab" aria-pressed={kind === k} onClick={() => { setKind(k); setEditing(null); }}>
            {k === 'speaking' ? 'Practice Speaking' : 'Write a Paragraph'}
          </button>
        ))}
      </div>

      {notice && <div className="cp-success" role="status">{notice}</div>}
      {loading && <OperationsLoadingSpinner />}
      {!loading && error && <OperationsErrorCard message={error} onRetry={load} />}

      {!loading && !error && (
        <>
          {editing ? (
            <Editor kind={kind} draft={editing.draft} isNew={!editing.id} saving={saving}
              onChange={(draft) => setEditing({ ...editing, draft })} onSave={save} onCancel={() => setEditing(null)} />
          ) : (
            <div className="cp-actions">
              <button type="button" className="cp-btn" onClick={() => setEditing({ id: null, draft: { ...EMPTY, minWords: kind === 'writing' ? '30' : '' } })}>
                Add topic
              </button>
            </div>
          )}

          {shown.length === 0 ? (
            <div className="cp-empty">No topics yet. Add one so students can practise.</div>
          ) : (
            <div className="cp-table-wrap">
              <table className="cp-table">
                <thead>
                  <tr><th>Title</th><th>Arabic</th><th>Level</th><th>XP</th><th>Time</th>{kind === 'writing' && <th>Min words</th>}<th>Status</th><th /></tr>
                </thead>
                <tbody>
                  {shown.map((t) => (
                    <tr key={t.id}>
                      <td className="cp-strong">{t.translations.en?.title ?? '—'}</td>
                      <td dir="rtl">{t.translations.ar?.title ?? <span className="cp-muted">missing</span>}</td>
                      <td>{t.levelCode ?? '—'}</td>
                      <td>{t.xpReward}</td>
                      <td>{t.timeLimitSeconds ? `${Math.round(t.timeLimitSeconds / 60)} min` : '—'}</td>
                      {kind === 'writing' && <td>{t.minWords ?? '—'}</td>}
                      <td><span className={`cp-badge cp-badge--${t.isActive ? 'active' : 'revoked'}`}>{t.isActive ? 'Visible' : 'Hidden'}</span></td>
                      <td>
                        <div className="cp-actions">
                          <button type="button" className="cp-btn cp-btn--ghost" disabled={saving} onClick={() => setEditing({ id: t.id, draft: toDraft(t) })}>Edit</button>
                          <button type="button" className="cp-btn cp-btn--danger" disabled={saving} onClick={() => remove(t)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
