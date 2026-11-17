'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminAiSystemPrompt, AdminAiPromptPart, AdminAiCustomRule } from '../../../core/api/admin-ai-teacher-api';

export type SystemPromptActions = {
  readonly savePart: (key: string, body: string) => Promise<{ error?: string }>;
  readonly resetPart: (key: string) => Promise<{ error?: string }>;
  readonly addRule: (rule: { title: string; body: string; courseTitles?: string[] | null }) => Promise<{ error?: string }>;
  readonly updateRule: (id: string, patch: { title?: string; body?: string; enabled?: boolean; courseTitles?: string[] | null }) => Promise<{ error?: string }>;
  readonly deleteRule: (id: string) => Promise<{ error?: string }>;
};

const TITLES: Record<string, { title: string; hint: string }> = {
  identity: { title: '1. Identity & core rules', hint: 'Always sent first, in every lesson conversation.' },
  greeting: { title: '2a. Greeting stage', hint: 'When the student arrives at a lesson.' },
  teaching: { title: '2b. Teaching stage', hint: 'While the lesson is taught. Must keep the hidden completion marker.' },
  complete: { title: '2c. Complete stage', hint: 'After the lesson is finished.' },
  practice: { title: '3. Speaking practice mode', hint: 'Used instead of 2a–2c in speaking practice.' },
};
const card = { border: '1px solid var(--border-default, #2a3142)', borderRadius: 10, padding: 16 } as const;
const area = { width: '100%', minHeight: 140, padding: 10, borderRadius: 8, fontFamily: 'inherit', fontSize: 14, lineHeight: 1.5, background: 'transparent', color: 'inherit', border: '1px solid var(--border-default, #2a3142)' } as const;
const btn = { padding: '6px 14px', borderRadius: 8, cursor: 'pointer' } as const;

function splitCourses(v: string): string[] | null {
  const list = v.split(',').map((x) => x.trim()).filter(Boolean);
  return list.length > 0 ? list : null;
}

function useAction() {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  function run(fn: () => Promise<{ error?: string }>, okText: string) {
    setMsg(null);
    start(async () => {
      const r = await fn();
      if (r.error) setMsg({ ok: false, text: r.error });
      else { setMsg({ ok: true, text: okText }); router.refresh(); }
    });
  }
  return { msg, pending, run };
}

const Msg = ({ m }: { m: { ok: boolean; text: string } | null }) =>
  m ? <span role="status" style={{ color: m.ok ? 'var(--success, #3ecf8e)' : 'var(--danger, #ff6b6b)', fontSize: 14 }}>{m.text}</span> : null;

function PartEditor({ part, actions }: { part: AdminAiPromptPart; actions: SystemPromptActions }) {
  const [text, setText] = useState(part.effective);
  const { msg, pending, run } = useAction();
  const t = TITLES[part.key] ?? { title: part.key, hint: '' };
  const edited = part.override !== null;
  return (
    <section style={card}>
      <h3 style={{ margin: 0 }}>{t.title} {edited && <span style={{ fontSize: 12, color: 'var(--warning, #f5a623)' }}>● edited</span>}</h3>
      <p style={{ margin: '4px 0 10px', opacity: 0.7, fontSize: 14 }}>{t.hint}</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} style={area} spellCheck={false} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
        <button type="button" style={btn} disabled={pending || text === part.effective} onClick={() => run(() => actions.savePart(part.key, text), 'Saved — live within seconds.')}>Save</button>
        <button type="button" style={btn} disabled={pending || !edited} onClick={() => run(async () => { const r = await actions.resetPart(part.key); if (!r.error) setText(part.default); return r; }, 'Reset to the built-in default.')}>Reset to default</button>
        <Msg m={msg} />
      </div>
    </section>
  );
}

function RuleRow({ rule, actions }: { rule: AdminAiCustomRule; actions: SystemPromptActions }) {
  const [title, setTitle] = useState(rule.title);
  const [body, setBody] = useState(rule.body);
  const [courses, setCourses] = useState((rule.courseTitles ?? []).join(', '));
  const { msg, pending, run } = useAction();
  const dirty = title !== rule.title || body !== rule.body || courses !== (rule.courseTitles ?? []).join(', ');
  return (
    <div style={{ ...card, opacity: rule.enabled ? 1 : 0.6 }}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ ...area, minHeight: 0, fontWeight: 600, marginBottom: 6 }} aria-label="Rule title" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} style={{ ...area, minHeight: 70 }} aria-label="Rule text" />
      <input value={courses} onChange={(e) => setCourses(e.target.value)} placeholder="Applies to courses (e.g. Starter, A1.1) — empty = all courses" style={{ ...area, minHeight: 0, marginTop: 6 }} aria-label="Courses" />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={rule.enabled} disabled={pending} onChange={(e) => run(() => actions.updateRule(rule.id, { enabled: e.target.checked }), e.target.checked ? 'Enabled.' : 'Disabled.')} />
          Enabled
        </label>
        <button type="button" style={btn} disabled={pending || !dirty} onClick={() => run(() => actions.updateRule(rule.id, { title, body, courseTitles: splitCourses(courses) }), 'Saved.')}>Save</button>
        <button type="button" style={btn} disabled={pending} onClick={() => { if (window.confirm('Delete this rule?')) run(() => actions.deleteRule(rule.id), 'Deleted.'); }}>Delete</button>
        <Msg m={msg} />
      </div>
    </div>
  );
}

function AddRule({ actions }: { actions: SystemPromptActions }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [courses, setCourses] = useState('');
  const { msg, pending, run } = useAction();
  return (
    <div style={card}>
      <h4 style={{ margin: '0 0 8px' }}>Add a rule</h4>
      <input placeholder="Short title, e.g. Explain in Arabic first" value={title} onChange={(e) => setTitle(e.target.value)} style={{ ...area, minHeight: 0, marginBottom: 6 }} />
      <textarea placeholder="The instruction the teacher must follow, e.g. “When the student is in the Starter course, give explanations mostly in Arabic and keep English words for examples.”" value={body} onChange={(e) => setBody(e.target.value)} style={{ ...area, minHeight: 80 }} />
      <input placeholder="Applies to courses (e.g. Starter, A1.1) — empty = all courses" value={courses} onChange={(e) => setCourses(e.target.value)} style={{ ...area, minHeight: 0, marginTop: 6 }} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
        <button type="button" style={btn} disabled={pending || !title.trim() || !body.trim()} onClick={() => run(async () => { const r = await actions.addRule({ title, body, courseTitles: splitCourses(courses) }); if (!r.error) { setTitle(''); setBody(''); setCourses(''); } return r; }, 'Rule added — live within seconds.')}>Add rule</button>
        <Msg m={msg} />
      </div>
    </div>
  );
}

export function SystemPromptEditor({ data, actions }: { data: AdminAiSystemPrompt; actions: SystemPromptActions }) {
  return (
    <div className="flex flex-col gap-4">
      <p style={{ margin: 0, opacity: 0.75, fontSize: 14 }}>
        Edit any part of the prompt the AI Teacher receives, or add your own rules. Changes apply to new messages within about 30 seconds. “Reset to default” restores the built-in text.
      </p>
      {data.parts.map((p) => <PartEditor key={`${p.key}:${p.effective}`} part={p} actions={actions} />)}

      <section style={card}>
        <h3 style={{ margin: 0 }}>Extra rules (added to every prompt)</h3>
        <p style={{ margin: '4px 0 12px', opacity: 0.7, fontSize: 14 }}>Your own instructions, appended after the parts above — lesson and practice modes alike. Turn a rule off to keep it without using it.</p>
        <div className="flex flex-col gap-3">
          {data.rules.map((r) => <RuleRow key={`${r.id}:${r.updatedAt}`} rule={r} actions={actions} />)}
          <AddRule actions={actions} />
        </div>
      </section>

      <section style={card}>
        <h3 style={{ margin: 0 }}>Context the teacher is given after these instructions</h3>
        <ol style={{ margin: '8px 0 0', paddingInlineStart: 20, fontSize: 14 }}>{data.contextSections.map((c) => <li key={c}><code>{c}</code></li>)}</ol>
      </section>
      <section style={card}>
        <h3 style={{ margin: 0 }}>Limits enforced by the backend (not editable here)</h3>
        <ul style={{ margin: '8px 0 0', paddingInlineStart: 20, fontSize: 14 }}>{data.safetyRules.map((r) => <li key={r}>{r}</li>)}</ul>
      </section>
    </div>
  );
}
