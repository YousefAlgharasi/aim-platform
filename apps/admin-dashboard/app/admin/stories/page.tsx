// Course stories: one reading story per course, told by Sarah, Adam, Yasmin and Tariq, with questions after every scene.
// Here you can add a story for a course, edit any scene, line or question, publish or hide it, and delete it.
// Students only see a PUBLISHED story, and only once its course is unlocked for them.
'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { CoursePaymentsStyles } from '../../../features/course-payments/course-payments-styles';
import { CourseOption, StoryApiError, StoryDetail, StoryInput, StoryRow, StoryStatus, storiesAdminApi } from '../../../features/stories/api';
import { StoryEditor } from '../../../features/stories/StoryEditor';
import { checkStory, emptyStory } from '../../../features/stories/story-form';
import { OperationsErrorCard, OperationsLoadingSpinner } from '../../../shared/components/operations';

type Editing = { id: string | null; courseTitle: string; story: StoryInput; skills: Array<{ key: string; title: string }> };

const BADGE: Record<StoryStatus, string> = { published: 'active', draft: 'pending', archived: 'revoked' };

export default function StoriesPage() {
  const [stories, setStories] = useState<StoryRow[]>([]);
  const [free, setFree] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [saving, setSaving] = useState(false);
  const [newCourse, setNewCourse] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await storiesAdminApi.list();
      setStories(r.stories);
      setFree(r.coursesWithoutStory);
      setNewCourse((cur) => (r.coursesWithoutStory.some((c) => c.id === cur) ? cur : r.coursesWithoutStory[0]?.id ?? ''));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const run = async (action: () => Promise<string>, closeEditor = true) => {
    setSaving(true);
    setError(null);
    setNotice(null);
    setProblems([]);
    try {
      setNotice(await action());
      if (closeEditor) setEditing(null);
      await load();
    } catch (err) {
      if (err instanceof StoryApiError && err.messages.length > 1) setProblems(err.messages);
      else setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const edit = async (row: StoryRow) => {
    setSaving(true);
    setError(null);
    setNotice(null);
    setProblems([]);
    try {
      const d: StoryDetail = await storiesAdminApi.get(row.storyId);
      setEditing({ id: d.storyId, courseTitle: d.courseTitle, skills: d.skills, story: {
        courseId: d.courseId, title: d.title, titleAr: d.titleAr, summary: d.summary, summaryAr: d.summaryAr, status: d.status, scenes: d.scenes } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load the story.');
    } finally {
      setSaving(false);
    }
  };

  const startNew = () => {
    const c = free.find((x) => x.id === newCourse);
    if (!c) return;
    setProblems([]);
    setNotice(null);
    setEditing({ id: null, courseTitle: c.title, skills: [], story: emptyStory(c.id) });
  };

  const save = () => {
    if (!editing) return;
    const local = checkStory(editing.story);
    if (local.length) { setProblems(local); return; }
    run(async () => {
      if (editing.id) await storiesAdminApi.save(editing.id, editing.story);
      else await storiesAdminApi.create(editing.story);
      return 'Saved.';
    }, true);
  };

  const toggle = (r: StoryRow) => run(async () => {
    const next: StoryStatus = r.status === 'published' ? 'draft' : 'published';
    await storiesAdminApi.setStatus(r.storyId, next);
    return next === 'published' ? 'Published: students can now read it.' : 'Hidden from students (draft).';
  }, false);

  const remove = (r: StoryRow) => {
    if (!window.confirm(`Delete the story "${r.title}" with all its scenes and questions? This cannot be undone.`)) return;
    run(async () => { await storiesAdminApi.remove(r.storyId); return 'Deleted.'; }, false);
  };

  return (
    <div className="cp-page">
      <CoursePaymentsStyles />
      <header className="cp-header">
        <p className="cp-eyebrow">Learning</p>
        <h1 className="cp-title">Stories</h1>
        <p className="cp-meta">
          One story per course, told in scenes by Sarah, Adam, Yasmin and Tariq with questions after every scene. A story is split into
          one part per chapter; a part opens when the student finishes that chapter&apos;s lessons. Students only see published stories.
          Answers are scored by the AIM engine like any other practice.
        </p>
      </header>

      {notice && <div className="cp-success" role="status">{notice}</div>}
      {loading && <OperationsLoadingSpinner />}
      {!loading && error && <OperationsErrorCard message={error} onRetry={load} />}

      {!loading && !error && (
        <>
          {editing ? (
            <StoryEditor story={editing.story} courseTitle={editing.courseTitle} skills={editing.skills} errors={problems} saving={saving} isNew={!editing.id}
              onChange={(story) => setEditing({ ...editing, story })} onSave={save} onCancel={() => { setEditing(null); setProblems([]); }} />
          ) : (
            <section className="cp-card" aria-label="Add a story">
              <h2 className="cp-card-title">Add a story</h2>
              {free.length === 0 ? (
                <p className="cp-muted">Every published course already has a story. Edit one below.</p>
              ) : (
                <div className="cp-actions">
                  <label className="cp-label" htmlFor="st-course">Course</label>
                  <select id="st-course" className="cp-select" value={newCourse} onChange={(e) => setNewCourse(e.target.value)}>
                    {free.map((c) => <option key={c.id} value={c.id}>{c.title}{c.cefrCode ? ` (${c.cefrCode})` : ''}</option>)}
                  </select>
                  <button type="button" className="cp-btn" onClick={startNew} disabled={!newCourse}>Add story</button>
                </div>
              )}
            </section>
          )}

          {stories.length === 0 ? (
            <div className="cp-empty">No stories yet. Add one for a course above.</div>
          ) : (
            <div className="cp-table-wrap">
              <table className="cp-table">
                <thead>
                  <tr><th>Course</th><th>Title</th><th>Arabic</th><th>Scenes</th><th>Questions</th><th>Words</th><th>Status</th><th /></tr>
                </thead>
                <tbody>
                  {stories.map((r) => (
                    <tr key={r.storyId}>
                      <td className="cp-strong">{r.courseTitle}{r.cefrCode ? <span className="cp-muted"> · {r.cefrCode}</span> : null}</td>
                      <td>{r.title}</td>
                      <td dir="rtl">{r.titleAr ?? <span className="cp-muted">missing</span>}</td>
                      <td className="cp-num">{r.scenes}</td>
                      <td className="cp-num">{r.questions}</td>
                      <td className="cp-num">{r.words}</td>
                      <td><span className={`cp-badge cp-badge--${BADGE[r.status]}`}>{r.status === 'published' ? 'Published' : r.status === 'draft' ? 'Draft' : 'Archived'}</span></td>
                      <td>
                        <div className="cp-actions">
                          <button type="button" className="cp-btn cp-btn--ghost" disabled={saving} onClick={() => edit(r)}>Edit</button>
                          <button type="button" className="cp-btn cp-btn--ghost" disabled={saving} onClick={() => toggle(r)}>{r.status === 'published' ? 'Hide' : 'Publish'}</button>
                          <button type="button" className="cp-btn cp-btn--danger" disabled={saving} onClick={() => remove(r)}>Delete</button>
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
