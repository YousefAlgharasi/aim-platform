'use client';

// The story editor: title and summary (English + Arabic), then scenes. A scene has a place, lines spoken by the narrator or
// one of the four friends, and questions with 2 to 4 answers (one correct). Everything is plain form fields; the backend
// checks the whole story again when you save.

import React, { useMemo } from 'react';

import type { StoryInput, StoryScene, StoryStatus } from './api';
import { SPEAKERS, emptyLine, emptyQuestion, emptyScene, markCorrect, moveItem, orNull, removeItem, replaceItem } from './story-form';

const STYLES = `
.se-scene{border:1px solid var(--cp-border, #d8dce6);border-radius:14px;padding:16px;margin-top:16px;background:var(--cp-surface, #fff)}
.se-head{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;margin-bottom:12px}
.se-head h3{margin:0;font-size:1rem}
.se-row{display:flex;gap:8px;align-items:flex-start;margin-bottom:8px}
.se-row > .se-grow{flex:1;min-width:0}
.se-sub{margin:16px 0 8px;font-size:.78rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;opacity:.7}
.se-q{border:1px dashed var(--cp-border, #d8dce6);border-radius:12px;padding:12px;margin-bottom:12px}
.se-mini{padding:4px 10px;font-size:.85rem}
.se-errors{margin:12px 0;padding:12px 16px;border-radius:12px;background:#fdecec;color:#8a1c1c}
.se-errors ul{margin:6px 0 0;padding-inline-start:20px}
.se-radio{margin-top:10px}
`;

type Props = {
  story: StoryInput;
  courseTitle: string;
  skills: Array<{ key: string; title: string }>;
  errors: string[];
  saving: boolean;
  isNew: boolean;
  onChange: (s: StoryInput) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function StoryEditor({ story, courseTitle, skills, errors, saving, isNew, onChange, onSave, onCancel }: Props) {
  const set = (patch: Partial<StoryInput>) => onChange({ ...story, ...patch });
  const defaultSkill = skills[0]?.key ?? null;
  const setScene = (i: number, scene: StoryScene) => set({ scenes: replaceItem(story.scenes, i, scene) });

  const text = (id: string, label: string, value: string, onValue: (v: string) => void, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="cp-field">
      <label className="cp-label" htmlFor={id}>{label}</label>
      <input id={id} className="cp-input" value={value} disabled={saving} onChange={(e) => onValue(e.target.value)} {...extra} />
    </div>
  );

  const summaryLeft = useMemo(() => story.scenes.reduce((n, s) => n + s.questions.length, 0), [story.scenes]);

  return (
    <section className="cp-card" aria-label={isNew ? 'New story' : 'Edit story'}>
      <style>{STYLES}</style>
      <h2 className="cp-card-title">{isNew ? 'New story' : 'Edit story'} <span className="cp-muted">· {courseTitle}</span></h2>

      <div className="cp-fields">
        {text('st-title', 'Title (English)', story.title, (v) => set({ title: v }), { maxLength: 120 })}
        {text('st-title-ar', 'Title (Arabic)', story.titleAr ?? '', (v) => set({ titleAr: orNull(v) }), { maxLength: 120, dir: 'rtl' })}
      </div>
      <div className="cp-fields">
        {text('st-sum', 'Summary (English): shown on the course card', story.summary, (v) => set({ summary: v }), { maxLength: 400 })}
        {text('st-sum-ar', 'Summary (Arabic)', story.summaryAr ?? '', (v) => set({ summaryAr: orNull(v) }), { maxLength: 400, dir: 'rtl' })}
      </div>
      <div className="cp-field">
        <label className="cp-label" htmlFor="st-status">Status</label>
        <select id="st-status" className="cp-select" value={story.status} disabled={saving} onChange={(e) => set({ status: e.target.value as StoryStatus })}>
          <option value="draft">Draft (students cannot see it)</option>
          <option value="published">Published (students see it, once their course is unlocked)</option>
          <option value="archived">Archived (hidden)</option>
        </select>
      </div>

      {story.scenes.map((scene, si) => (
        <div className="se-scene" key={scene.id ?? `new-${si}`} role="group" aria-label={`Scene ${si + 1}`}>
          <div className="se-head">
            <h3>Scene {si + 1} of {story.scenes.length}</h3>
            <div className="cp-actions">
              <button type="button" className="cp-btn cp-btn--ghost se-mini" disabled={saving || si === 0} onClick={() => set({ scenes: moveItem(story.scenes, si, -1) })} aria-label={`Move scene ${si + 1} up`}>↑</button>
              <button type="button" className="cp-btn cp-btn--ghost se-mini" disabled={saving || si === story.scenes.length - 1} onClick={() => set({ scenes: moveItem(story.scenes, si, 1) })} aria-label={`Move scene ${si + 1} down`}>↓</button>
              <button type="button" className="cp-btn cp-btn--danger se-mini" disabled={saving} onClick={() => { if (window.confirm(`Remove scene ${si + 1} and its questions?`)) set({ scenes: removeItem(story.scenes, si) }); }}>Remove scene</button>
            </div>
          </div>

          <div className="cp-fields">
            {text(`sc-${si}-set`, 'Place (English)', scene.setting, (v) => setScene(si, { ...scene, setting: v }), { maxLength: 120, placeholder: 'At school, morning' })}
            {text(`sc-${si}-set-ar`, 'Place (Arabic)', scene.settingAr ?? '', (v) => setScene(si, { ...scene, settingAr: orNull(v) }), { maxLength: 120, dir: 'rtl' })}
          </div>

          <p className="se-sub">Lines</p>
          {scene.lines.map((line, li) => (
            <div className="se-row" key={li}>
              <select className="cp-select" aria-label={`Scene ${si + 1} line ${li + 1} speaker`} value={line.speaker} disabled={saving}
                onChange={(e) => setScene(si, { ...scene, lines: replaceItem(scene.lines, li, { ...line, speaker: e.target.value as typeof line.speaker }) })}>
                {SPEAKERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <div className="se-grow">
                <textarea className="cp-textarea" rows={2} maxLength={600} aria-label={`Scene ${si + 1} line ${li + 1} text`} value={line.text} disabled={saving}
                  placeholder={line.speaker === 'narrator' ? 'What happens, in one or two sentences' : 'Only the words this friend says'}
                  onChange={(e) => setScene(si, { ...scene, lines: replaceItem(scene.lines, li, { ...line, text: e.target.value }) })} />
              </div>
              <div className="cp-actions">
                <button type="button" className="cp-btn cp-btn--ghost se-mini" disabled={saving || li === 0} onClick={() => setScene(si, { ...scene, lines: moveItem(scene.lines, li, -1) })} aria-label={`Move line ${li + 1} up`}>↑</button>
                <button type="button" className="cp-btn cp-btn--ghost se-mini" disabled={saving || li === scene.lines.length - 1} onClick={() => setScene(si, { ...scene, lines: moveItem(scene.lines, li, 1) })} aria-label={`Move line ${li + 1} down`}>↓</button>
                <button type="button" className="cp-btn cp-btn--danger se-mini" disabled={saving} onClick={() => setScene(si, { ...scene, lines: removeItem(scene.lines, li) })} aria-label={`Remove line ${li + 1}`}>✕</button>
              </div>
            </div>
          ))}
          <button type="button" className="cp-btn cp-btn--ghost se-mini" disabled={saving || scene.lines.length >= 40} onClick={() => setScene(si, { ...scene, lines: [...scene.lines, emptyLine('sarah')] })}>Add line</button>

          <p className="se-sub">Questions after this scene</p>
          {scene.questions.map((q, qi) => (
            <div className="se-q" key={q.id ?? `q-${qi}`} role="group" aria-label={`Scene ${si + 1} question ${qi + 1}`}>
              <div className="se-head">
                <strong>Question {qi + 1}</strong>
                <div className="cp-actions">
                  <button type="button" className="cp-btn cp-btn--ghost se-mini" disabled={saving || qi === 0} onClick={() => setScene(si, { ...scene, questions: moveItem(scene.questions, qi, -1) })} aria-label={`Move question ${qi + 1} up`}>↑</button>
                  <button type="button" className="cp-btn cp-btn--ghost se-mini" disabled={saving || qi === scene.questions.length - 1} onClick={() => setScene(si, { ...scene, questions: moveItem(scene.questions, qi, 1) })} aria-label={`Move question ${qi + 1} down`}>↓</button>
                  <button type="button" className="cp-btn cp-btn--danger se-mini" disabled={saving} onClick={() => setScene(si, { ...scene, questions: removeItem(scene.questions, qi) })}>Remove question</button>
                </div>
              </div>
              <div className="cp-field">
                <label className="cp-label" htmlFor={`q-${si}-${qi}-stem`}>Question</label>
                <input id={`q-${si}-${qi}-stem`} className="cp-input" maxLength={400} value={q.stem} disabled={saving}
                  onChange={(e) => setScene(si, { ...scene, questions: replaceItem(scene.questions, qi, { ...q, stem: e.target.value }) })} />
              </div>
              {q.options.map((o, oi) => (
                <div className="se-row" key={oi}>
                  <input type="radio" className="se-radio" name={`correct-${si}-${qi}`} checked={o.correct} disabled={saving}
                    aria-label={`Answer ${oi + 1} is correct`}
                    onChange={() => setScene(si, { ...scene, questions: replaceItem(scene.questions, qi, markCorrect(q, oi)) })} />
                  <div className="se-grow">
                    <input className="cp-input" maxLength={160} aria-label={`Scene ${si + 1} question ${qi + 1} answer ${oi + 1}`} value={o.text} disabled={saving}
                      placeholder={`Answer ${oi + 1}`}
                      onChange={(e) => setScene(si, { ...scene, questions: replaceItem(scene.questions, qi, { ...q, options: replaceItem(q.options, oi, { ...o, text: e.target.value }) }) })} />
                  </div>
                  <button type="button" className="cp-btn cp-btn--danger se-mini" disabled={saving || q.options.length <= 2} aria-label={`Remove answer ${oi + 1}`}
                    onClick={() => {
                      const options = removeItem(q.options, oi);
                      const fixed = options.some((x) => x.correct) ? options : options.map((x, k) => ({ ...x, correct: k === 0 }));
                      setScene(si, { ...scene, questions: replaceItem(scene.questions, qi, { ...q, options: fixed }) });
                    }}>✕</button>
                </div>
              ))}
              <button type="button" className="cp-btn cp-btn--ghost se-mini" disabled={saving || q.options.length >= 4}
                onClick={() => setScene(si, { ...scene, questions: replaceItem(scene.questions, qi, { ...q, options: [...q.options, { text: '', correct: false }] }) })}>Add answer</button>
              <div className="cp-fields" style={{ marginTop: 12 }}>
                <div className="cp-field">
                  <label className="cp-label" htmlFor={`q-${si}-${qi}-why`}>Explanation (shown after the answer)</label>
                  <input id={`q-${si}-${qi}-why`} className="cp-input" maxLength={400} value={q.explanation ?? ''} disabled={saving}
                    onChange={(e) => setScene(si, { ...scene, questions: replaceItem(scene.questions, qi, { ...q, explanation: orNull(e.target.value) }) })} />
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor={`q-${si}-${qi}-skill`}>Skill it practises</label>
                  <select id={`q-${si}-${qi}-skill`} className="cp-select" value={q.skillKey ?? ''} disabled={saving}
                    onChange={(e) => setScene(si, { ...scene, questions: replaceItem(scene.questions, qi, { ...q, skillKey: e.target.value || null }) })}>
                    <option value="">{skills.length ? 'First skill of the course' : 'Course default'}</option>
                    {skills.map((s) => <option key={s.key} value={s.key}>{s.title}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="cp-btn cp-btn--ghost se-mini" disabled={saving || scene.questions.length >= 6}
            onClick={() => setScene(si, { ...scene, questions: [...scene.questions, emptyQuestion(defaultSkill)] })}>Add question</button>
        </div>
      ))}

      <div className="cp-actions" style={{ marginTop: 16 }}>
        <button type="button" className="cp-btn cp-btn--ghost" disabled={saving || story.scenes.length >= 30} onClick={() => set({ scenes: [...story.scenes, emptyScene(defaultSkill)] })}>Add scene</button>
      </div>

      {errors.length > 0 && (
        <div className="se-errors" role="alert">
          <strong>Fix this before saving:</strong>
          <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}

      <div className="cp-actions" style={{ marginTop: 16 }}>
        <button type="button" className="cp-btn" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save story'}</button>
        <button type="button" className="cp-btn cp-btn--ghost" onClick={onCancel} disabled={saving}>Cancel</button>
        <span className="cp-muted">{story.scenes.length} scenes · {summaryLeft} questions</span>
      </div>
    </section>
  );
}
