// Admin control of the student Achievements page and Daily Challenge card.
// Achievements: edit text/icon, activate/deactivate (unlock rules live in code, so no "create").
// Daily challenges: create, edit, activate/deactivate. Backend is the final authority.
'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { backendFetch } from '../../../core/api/client-api-helpers';
import { OperationsLoadingSpinner, OperationsErrorCard } from '../../../shared/components/operations';

type Achievement = {
  id: string; key: string; title: string; description: string; icon: string; category: string; isActive: boolean;
};
type Challenge = {
  id: string; key: string; title: string; description: string; challengeType: 'lessons' | 'streak'; targetCount: number; isActive: boolean;
};

const unwrap = <T,>(json: any): T[] => (Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []);

async function send(path: string, method: string, body?: unknown) {
  const res = await backendFetch(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try { const j = await res.json(); msg = j?.error?.message ?? j?.message ?? msg; } catch {}
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return res.json();
}

export default function EngagementAdminPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ key: '', title: '', description: '', challengeType: 'lessons', targetCount: 1 });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, c] = await Promise.all([
        send('/admin/achievements', 'GET'),
        send('/admin/daily-challenges', 'GET'),
      ]);
      setAchievements(unwrap<Achievement>(a));
      setChallenges(unwrap<Challenge>(c));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function run(id: string, fn: () => Promise<unknown>) {
    setBusy(id);
    setError(null);
    try { await fn(); setEditing(null); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Action failed.'); }
    finally { setBusy(null); }
  }

  if (loading && !achievements.length && !challenges.length) return <OperationsLoadingSpinner message="Loading…" />;
  if (error && !achievements.length && !challenges.length) return <OperationsErrorCard message={error} onRetry={load} />;

  return (
    <div className="eng">
      <header>
        <p className="eng-eyebrow">Learning</p>
        <h1 className="eng-title">Achievements &amp; Daily Challenges</h1>
        <p className="eng-meta">Changes appear on the student web within a minute — no deploy needed.</p>
      </header>
      {error && <div className="eng-error" role="alert">{error}</div>}

      <section aria-labelledby="ach-h">
        <h2 id="ach-h" className="eng-h2">Achievements</h2>
        <p className="eng-note">Unlock rules are built into the app by key, so new achievements can&apos;t be added here — edit wording and icon, or hide one.</p>
        <div className="eng-wrap"><table className="eng-table">
          <thead><tr><th>Key</th><th>Title</th><th>Description</th><th>Icon</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {achievements.map((a) => {
              const isEd = editing === a.id;
              return (
                <tr key={a.id}>
                  <td><code>{a.key}</code></td>
                  <td>{isEd ? <input className="eng-in" value={draft.title ?? ''} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /> : a.title}</td>
                  <td>{isEd ? <input className="eng-in" value={draft.description ?? ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /> : a.description}</td>
                  <td>{isEd ? <input className="eng-in" value={draft.icon ?? ''} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} /> : <code>{a.icon}</code>}</td>
                  <td><span className={`eng-badge ${a.isActive ? 'on' : 'off'}`}>{a.isActive ? 'Active' : 'Hidden'}</span></td>
                  <td className="eng-actions">
                    {isEd ? (<>
                      <button className="eng-btn primary" disabled={busy === a.id} onClick={() => run(a.id, () => send(`/admin/achievements/${a.id}`, 'PATCH', { title: draft.title, description: draft.description, icon: draft.icon }))}>Save</button>
                      <button className="eng-btn" onClick={() => setEditing(null)}>Cancel</button>
                    </>) : (<>
                      <button className="eng-btn" onClick={() => { setEditing(a.id); setDraft({ title: a.title, description: a.description, icon: a.icon }); }}>Edit</button>
                      <button className="eng-btn" disabled={busy === a.id} onClick={() => run(a.id, () => send(`/admin/achievements/${a.id}`, 'PATCH', { isActive: !a.isActive }))}>{a.isActive ? 'Hide' : 'Show'}</button>
                    </>)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </section>

      <section aria-labelledby="ch-h">
        <div className="eng-row">
          <h2 id="ch-h" className="eng-h2">Daily challenges</h2>
          <button className="eng-btn primary" onClick={() => setCreating(!creating)}>{creating ? 'Cancel' : '+ New challenge'}</button>
        </div>
        <p className="eng-note">Each day a student gets one active challenge. &quot;lessons&quot; = complete N lessons; &quot;streak&quot; = stay active (target 1).</p>
        {creating && (
          <form className="eng-form" onSubmit={(e) => { e.preventDefault(); void run('new', async () => { await send('/admin/daily-challenges', 'POST', { ...form, targetCount: Number(form.targetCount) }); setCreating(false); setForm({ key: '', title: '', description: '', challengeType: 'lessons', targetCount: 1 }); }); }}>
            <input className="eng-in" placeholder="key (e.g. complete_three_lessons)" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} required pattern="[a-z0-9_]+" />
            <input className="eng-in" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={80} />
            <input className="eng-in" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required maxLength={240} />
            <select className="eng-in" value={form.challengeType} onChange={(e) => setForm({ ...form, challengeType: e.target.value })}><option value="lessons">lessons</option><option value="streak">streak</option></select>
            <input className="eng-in" type="number" min={1} max={20} value={form.targetCount} onChange={(e) => setForm({ ...form, targetCount: Number(e.target.value) })} required />
            <button className="eng-btn primary" type="submit" disabled={busy === 'new'}>Create</button>
          </form>
        )}
        <div className="eng-wrap"><table className="eng-table">
          <thead><tr><th>Key</th><th>Title</th><th>Description</th><th>Type</th><th>Target</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {challenges.map((c) => {
              const isEd = editing === c.id;
              return (
                <tr key={c.id}>
                  <td><code>{c.key}</code></td>
                  <td>{isEd ? <input className="eng-in" value={draft.title ?? ''} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /> : c.title}</td>
                  <td>{isEd ? <input className="eng-in" value={draft.description ?? ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /> : c.description}</td>
                  <td>{isEd ? <select className="eng-in" value={draft.challengeType} onChange={(e) => setDraft({ ...draft, challengeType: e.target.value })}><option value="lessons">lessons</option><option value="streak">streak</option></select> : c.challengeType}</td>
                  <td>{isEd ? <input className="eng-in" type="number" min={1} max={20} value={draft.targetCount ?? 1} onChange={(e) => setDraft({ ...draft, targetCount: Number(e.target.value) })} /> : c.targetCount}</td>
                  <td><span className={`eng-badge ${c.isActive ? 'on' : 'off'}`}>{c.isActive ? 'Active' : 'Off'}</span></td>
                  <td className="eng-actions">
                    {isEd ? (<>
                      <button className="eng-btn primary" disabled={busy === c.id} onClick={() => run(c.id, () => send(`/admin/daily-challenges/${c.id}`, 'PATCH', { title: draft.title, description: draft.description, challengeType: draft.challengeType, targetCount: draft.targetCount }))}>Save</button>
                      <button className="eng-btn" onClick={() => setEditing(null)}>Cancel</button>
                    </>) : (<>
                      <button className="eng-btn" onClick={() => { setEditing(c.id); setDraft({ title: c.title, description: c.description, challengeType: c.challengeType, targetCount: c.targetCount }); }}>Edit</button>
                      <button className="eng-btn" disabled={busy === c.id} onClick={() => run(c.id, () => send(`/admin/daily-challenges/${c.id}`, 'PATCH', { isActive: !c.isActive }))}>{c.isActive ? 'Turn off' : 'Turn on'}</button>
                    </>)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </section>

      <style>{`
        .eng { display: flex; flex-direction: column; gap: var(--space-24); }
        .eng-eyebrow { margin: 0; font-size: 12px; font-weight: var(--weight-semibold); text-transform: uppercase; letter-spacing: .05em; color: var(--text-muted); }
        .eng-title { margin: 0; font-size: 24px; font-weight: var(--weight-bold); color: var(--text-primary); }
        .eng-meta, .eng-note { margin: 0; font-size: 13px; color: var(--text-secondary); }
        .eng-h2 { margin: 0; font-size: 17px; font-weight: var(--weight-semibold); color: var(--text-primary); }
        .eng-row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-16); }
        .eng-error { padding: var(--space-12) var(--space-16); background: var(--error-soft); border: 1px solid var(--color-error-200); border-radius: var(--radius-md); font-size: 13px; color: var(--color-error-700); }
        .eng section { display: flex; flex-direction: column; gap: var(--space-12); }
        .eng-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); }
        .eng-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .eng-table th { text-align: start; padding: var(--space-8) var(--space-16); font-size: 12px; font-weight: var(--weight-semibold); color: var(--text-secondary); border-bottom: 1px solid var(--border); background: var(--surface-raised); white-space: nowrap; }
        .eng-table td { padding: var(--space-8) var(--space-16); border-bottom: 1px solid var(--border); color: var(--text-primary); vertical-align: middle; }
        .eng-actions { white-space: nowrap; display: flex; gap: var(--space-8); }
        .eng-in { height: var(--size-btn-md); padding: 0 var(--space-12); border: 1px solid var(--border); border-radius: var(--radius-md); font: inherit; background: var(--surface); color: var(--text-primary); min-width: 120px; }
        .eng-in:focus { outline: none; box-shadow: var(--shadow-focus); }
        .eng-form { display: flex; flex-wrap: wrap; gap: var(--space-8); padding: var(--space-16); border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); }
        .eng-btn { height: var(--size-btn-sm); padding: 0 var(--space-12); border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); color: var(--text-primary); font: inherit; font-size: 12px; font-weight: var(--weight-medium); cursor: pointer; }
        .eng-btn.primary { background: var(--color-primary-500); color: var(--text-on-primary); border-color: transparent; }
        .eng-btn:disabled { opacity: .5; cursor: not-allowed; }
        .eng-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
        .eng-badge { display: inline-flex; padding: 2px var(--space-8); border-radius: var(--radius-sm); font-size: 11px; font-weight: var(--weight-semibold); }
        .eng-badge.on { background: var(--success-soft); color: var(--color-success-700); }
        .eng-badge.off { background: var(--neutral-soft); color: var(--text-secondary); }
      `}</style>
    </div>
  );
}
