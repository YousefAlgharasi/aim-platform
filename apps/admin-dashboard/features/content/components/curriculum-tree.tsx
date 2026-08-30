'use client';

// Unified curriculum tree: lets an admin browse and manage a course's
// Levels → Chapters → Lessons as nested, lazily-loaded dropdowns inside
// the course detail panel, instead of navigating through separate
// Levels/Chapters/Lessons pages with course/level/chapter pickers.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LevelForm } from './level-form';
import { ChapterForm } from './chapter-form';
import { LessonForm } from './lesson-form';
import { ContentStatusWorkflow } from './content-status-workflow';
import type { ContentStatus } from '../api/admin-content-status-api';
import type { AdminLevelSummary } from '../api/admin-levels-api';
import type { AdminChapterSummary } from '../api/admin-chapters-api';
import type { AdminLessonSummary } from '../api/admin-lessons-api';

export type LessonSkillBadge = {
  readonly id: string;
  readonly key: string;
  readonly title: string;
  readonly domain: string;
};

type ActionResult = { error?: string };
type TransitionAction = 'publish' | 'archive' | 'restore';

export type CurriculumTreeActions = {
  readonly fetchLevels: (courseId: string) => Promise<{ data?: AdminLevelSummary[]; error?: string }>;
  readonly createLevel: (
    courseId: string,
    data: { title: string; code: string | null; slug: string | null; description: string | null },
  ) => Promise<ActionResult>;
  readonly updateLevel: (
    courseId: string,
    levelId: string,
    data: { title: string; code: string | null; slug: string | null; description: string | null },
  ) => Promise<ActionResult>;
  readonly transitionLevel: (levelId: string, action: TransitionAction) => Promise<ActionResult>;

  readonly fetchChapters: (levelId: string) => Promise<{ data?: AdminChapterSummary[]; error?: string }>;
  readonly createChapter: (
    levelId: string,
    data: { title: string; slug: string | null; description: string | null },
  ) => Promise<ActionResult>;
  readonly updateChapter: (
    chapterId: string,
    data: { title: string; slug: string | null; description: string | null },
  ) => Promise<ActionResult>;
  readonly transitionChapter: (chapterId: string, action: TransitionAction) => Promise<ActionResult>;

  readonly fetchLessons: (chapterId: string) => Promise<{ data?: AdminLessonSummary[]; error?: string }>;
  readonly createLesson: (
    chapterId: string,
    data: { title: string; description: string },
  ) => Promise<ActionResult>;
  readonly updateLesson: (
    lessonId: string,
    data: { title: string; description: string },
  ) => Promise<ActionResult>;
  readonly transitionLesson: (lessonId: string, action: TransitionAction) => Promise<ActionResult>;

  readonly fetchLessonSkills: (lessonId: string) => Promise<{ data?: LessonSkillBadge[]; error?: string }>;
};

type Props = {
  readonly courseId: string;
  readonly actions: CurriculumTreeActions;
};

const STATUS_DOT: Record<string, string> = {
  draft: 'var(--text-muted)',
  in_review: 'var(--color-warning-500, #f59e0b)',
  approved: 'var(--color-primary-500)',
  published: 'var(--color-success-500)',
  archived: 'var(--text-muted)',
};

function StatusDot({ status }: { readonly status: string }) {
  return <span className="ctree-dot" style={{ background: STATUS_DOT[status] ?? 'var(--text-muted)' }} />;
}

export function CurriculumTree({ courseId, actions }: Props) {
  const [levels, setLevels] = useState<AdminLevelSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateLevel, setShowCreateLevel] = useState(false);

  async function load() {
    setLoading(true);
    setLoadError(null);
    const result = await actions.fetchLevels(courseId);
    if (result.error) setLoadError(result.error);
    else setLevels(result.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function handleCreateLevel(data: {
    title: string; code: string | null; slug: string | null; description: string | null;
  }) {
    const result = await actions.createLevel(courseId, data);
    if (!result.error) { setShowCreateLevel(false); await load(); }
    return result;
  }

  return (
    <div className="ctree-root">
      <div className="ctree-section-header">
        <h3 className="ctree-section-title">Levels</h3>
        <button type="button" className="ctree-add-btn" onClick={() => setShowCreateLevel((v) => !v)}>
          {showCreateLevel ? 'Cancel' : '+ Add Level'}
        </button>
      </div>

      {showCreateLevel && (
        <LevelForm mode="create" onSubmit={handleCreateLevel} onCancel={() => setShowCreateLevel(false)} />
      )}

      {loading && <p className="ctree-hint">Loading levels…</p>}
      {loadError && <div className="admin-error-banner" role="alert">{loadError}</div>}
      {levels && levels.length === 0 && !loading && (
        <p className="ctree-hint">No levels yet. Add one to start building this course's curriculum.</p>
      )}

      {levels && levels.length > 0 && (
        <ul className="ctree-list">
          {levels.map((level) => (
            <LevelNode key={level.id} level={level} courseId={courseId} actions={actions} onChanged={load} />
          ))}
        </ul>
      )}

      <style>{`
        .ctree-root { display: flex; flex-direction: column; gap: 12px; }
        .ctree-section-header { display: flex; align-items: center; justify-content: space-between; }
        .ctree-section-title { margin: 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-secondary); }
        .ctree-add-btn {
          background: none; border: 1px solid var(--border); border-radius: var(--radius-sm);
          padding: 4px 10px; font-size: 12px; font-weight: 600; color: var(--color-primary-500);
          cursor: pointer; font-family: inherit;
        }
        .ctree-add-btn:hover { background: var(--surface-sunken); }
        .ctree-hint { margin: 0; font-size: 13px; color: var(--text-muted); }
        .ctree-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
        .ctree-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; display: inline-block; }

        .ctree-node { border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); }
        .ctree-node-row { display: flex; align-items: center; gap: 8px; padding: 8px 10px; }
        .ctree-node-toggle {
          background: none; border: none; cursor: pointer; padding: 2px;
          color: var(--text-muted); display: flex; align-items: center; flex-shrink: 0;
        }
        .ctree-node-toggle svg { transition: transform 0.15s; }
        .ctree-node-toggle--open svg { transform: rotate(90deg); }
        .ctree-node-title { font-weight: 600; font-size: 13px; color: var(--text-primary); flex: 1; }
        .ctree-node-badge { font-size: 11px; background: var(--surface-sunken); padding: 1px 6px; border-radius: 4px; color: var(--text-secondary); }
        .ctree-node-actions { display: flex; gap: 4px; }
        .ctree-node-btn {
          background: none; border: 1px solid var(--border); border-radius: var(--radius-sm);
          padding: 3px 9px; font-size: 11px; font-weight: 500; color: var(--text-secondary);
          cursor: pointer; font-family: inherit;
        }
        .ctree-node-btn:hover { background: var(--surface-sunken); color: var(--text-primary); }
        .ctree-node-link { text-decoration: none; }
        .ctree-node-body { padding: 0 10px 10px 30px; display: flex; flex-direction: column; gap: 8px; }
        .ctree-node-edit { padding: 10px; }

        .ctree-skills-row {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          padding: 0 10px 8px 32px;
        }
        .ctree-skill-badges { display: flex; gap: 4px; flex-wrap: wrap; }
        .ctree-skill-badge {
          font-size: 10px; font-family: var(--font-mono, monospace);
          background: color-mix(in srgb, var(--color-primary-500) 10%, transparent);
          color: var(--color-primary-600, #4f46e5);
          padding: 1px 6px; border-radius: 4px;
        }
        .ctree-skills-warning { font-size: 11px; color: var(--color-warning-700, #b45309); font-weight: 500; }
        .ctree-skills-error { font-size: 11px; color: var(--text-muted); }
        .ctree-skills-manage { font-size: 11px; color: var(--text-link); font-weight: 500; margin-left: auto; }
        .ctree-skills-manage:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}

function LevelNode({
  level, courseId, actions, onChanged,
}: {
  readonly level: AdminLevelSummary;
  readonly courseId: string;
  readonly actions: CurriculumTreeActions;
  readonly onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit' | 'status'>('view');
  const [chapters, setChapters] = useState<AdminChapterSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreateChapter, setShowCreateChapter] = useState(false);

  async function loadChapters() {
    setLoading(true);
    setLoadError(null);
    const result = await actions.fetchChapters(level.id);
    if (result.error) setLoadError(result.error);
    else setChapters(result.data ?? []);
    setLoading(false);
  }

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && chapters === null) loadChapters();
  }

  async function handleUpdate(data: { title: string; code: string | null; slug: string | null; description: string | null }) {
    const result = await actions.updateLevel(courseId, level.id, data);
    if (!result.error) { setMode('view'); onChanged(); }
    return result;
  }

  async function handleTransition(action: TransitionAction) {
    const result = await actions.transitionLevel(level.id, action);
    if (!result.error) onChanged();
    return result;
  }

  async function handleCreateChapter(data: { title: string; slug: string | null; description: string | null }) {
    const result = await actions.createChapter(level.id, data);
    if (!result.error) { setShowCreateChapter(false); await loadChapters(); }
    return result;
  }

  if (mode === 'edit') {
    return (
      <li className="ctree-node">
        <div className="ctree-node-edit">
          <LevelForm mode="edit" initial={level} onSubmit={handleUpdate} onCancel={() => setMode('view')} />
        </div>
      </li>
    );
  }

  if (mode === 'status') {
    return (
      <li className="ctree-node">
        <div className="ctree-node-edit">
          <ContentStatusWorkflow
            entityId={level.id}
            entityType="levels"
            entityTitle={level.title}
            currentStatus={level.status as ContentStatus}
            onTransition={handleTransition}
          />
          <button type="button" className="ctree-node-btn" style={{ marginTop: 8 }} onClick={() => setMode('view')}>
            Done
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="ctree-node">
      <div className="ctree-node-row">
        <button
          type="button"
          className={`ctree-node-toggle ${open ? 'ctree-node-toggle--open' : ''}`}
          onClick={toggleOpen}
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg>
        </button>
        <StatusDot status={level.status} />
        <span className="ctree-node-title">{level.title}</span>
        {level.code && <code className="ctree-node-badge">{level.code}</code>}
        <div className="ctree-node-actions">
          <button type="button" className="ctree-node-btn" onClick={() => setMode('status')}>Status</button>
          <button type="button" className="ctree-node-btn" onClick={() => setMode('edit')}>Edit</button>
        </div>
      </div>

      {open && (
        <div className="ctree-node-body">
          <div className="ctree-section-header">
            <h4 className="ctree-section-title">Chapters</h4>
            <button type="button" className="ctree-add-btn" onClick={() => setShowCreateChapter((v) => !v)}>
              {showCreateChapter ? 'Cancel' : '+ Add Chapter'}
            </button>
          </div>

          {showCreateChapter && (
            <ChapterForm mode="create" onSubmit={handleCreateChapter} onCancel={() => setShowCreateChapter(false)} />
          )}

          {loading && <p className="ctree-hint">Loading chapters…</p>}
          {loadError && <div className="admin-error-banner" role="alert">{loadError}</div>}
          {chapters && chapters.length === 0 && !loading && (
            <p className="ctree-hint">No chapters yet in this level.</p>
          )}

          {chapters && chapters.length > 0 && (
            <ul className="ctree-list">
              {chapters.map((chapter) => (
                <ChapterNode key={chapter.id} chapter={chapter} actions={actions} onChanged={loadChapters} />
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

function ChapterNode({
  chapter, actions, onChanged,
}: {
  readonly chapter: AdminChapterSummary;
  readonly actions: CurriculumTreeActions;
  readonly onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit' | 'status'>('view');
  const [lessons, setLessons] = useState<AdminLessonSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreateLesson, setShowCreateLesson] = useState(false);

  async function loadLessons() {
    setLoading(true);
    setLoadError(null);
    const result = await actions.fetchLessons(chapter.id);
    if (result.error) setLoadError(result.error);
    else setLessons(result.data ?? []);
    setLoading(false);
  }

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && lessons === null) loadLessons();
  }

  async function handleUpdate(data: { title: string; slug: string | null; description: string | null }) {
    const result = await actions.updateChapter(chapter.id, data);
    if (!result.error) { setMode('view'); onChanged(); }
    return result;
  }

  async function handleTransition(action: TransitionAction) {
    const result = await actions.transitionChapter(chapter.id, action);
    if (!result.error) onChanged();
    return result;
  }

  async function handleCreateLesson(data: { title: string; description: string }) {
    const result = await actions.createLesson(chapter.id, data);
    if (!result.error) { setShowCreateLesson(false); await loadLessons(); }
    return result;
  }

  if (mode === 'edit') {
    return (
      <li className="ctree-node">
        <div className="ctree-node-edit">
          <ChapterForm mode="edit" initial={chapter} onSubmit={handleUpdate} onCancel={() => setMode('view')} />
        </div>
      </li>
    );
  }

  if (mode === 'status') {
    return (
      <li className="ctree-node">
        <div className="ctree-node-edit">
          <ContentStatusWorkflow
            entityId={chapter.id}
            entityType="chapters"
            entityTitle={chapter.title}
            currentStatus={chapter.status as ContentStatus}
            onTransition={handleTransition}
          />
          <button type="button" className="ctree-node-btn" style={{ marginTop: 8 }} onClick={() => setMode('view')}>
            Done
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="ctree-node">
      <div className="ctree-node-row">
        <button
          type="button"
          className={`ctree-node-toggle ${open ? 'ctree-node-toggle--open' : ''}`}
          onClick={toggleOpen}
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg>
        </button>
        <StatusDot status={chapter.status} />
        <span className="ctree-node-title">{chapter.title}</span>
        <div className="ctree-node-actions">
          <button type="button" className="ctree-node-btn" onClick={() => setMode('status')}>Status</button>
          <button type="button" className="ctree-node-btn" onClick={() => setMode('edit')}>Edit</button>
        </div>
      </div>

      {open && (
        <div className="ctree-node-body">
          <div className="ctree-section-header">
            <h4 className="ctree-section-title">Lessons</h4>
            <button type="button" className="ctree-add-btn" onClick={() => setShowCreateLesson((v) => !v)}>
              {showCreateLesson ? 'Cancel' : '+ Add Lesson'}
            </button>
          </div>

          {showCreateLesson && (
            <LessonForm mode="create" onSubmit={handleCreateLesson} onCancel={() => setShowCreateLesson(false)} />
          )}

          {loading && <p className="ctree-hint">Loading lessons…</p>}
          {loadError && <div className="admin-error-banner" role="alert">{loadError}</div>}
          {lessons && lessons.length === 0 && !loading && (
            <p className="ctree-hint">No lessons yet in this chapter.</p>
          )}

          {lessons && lessons.length > 0 && (
            <ul className="ctree-list">
              {lessons.map((lesson) => (
                <LessonNode key={lesson.id} lesson={lesson} actions={actions} onChanged={loadLessons} />
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

function LessonNode({
  lesson, actions, onChanged,
}: {
  readonly lesson: AdminLessonSummary;
  readonly actions: CurriculumTreeActions;
  readonly onChanged: () => void;
}) {
  const [mode, setMode] = useState<'view' | 'edit' | 'status'>('view');
  const [skills, setSkills] = useState<LessonSkillBadge[] | null>(null);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    actions.fetchLessonSkills(lesson.id).then((result) => {
      if (cancelled) return;
      if (result.error) setSkillsError(result.error);
      else setSkills(result.data ?? []);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  async function handleUpdate(data: { title: string; description: string }) {
    const result = await actions.updateLesson(lesson.id, data);
    if (!result.error) { setMode('view'); onChanged(); }
    return result;
  }

  async function handleTransition(action: TransitionAction) {
    const result = await actions.transitionLesson(lesson.id, action);
    if (!result.error) onChanged();
    return result;
  }

  if (mode === 'edit') {
    return (
      <li className="ctree-node">
        <div className="ctree-node-edit">
          <LessonForm mode="edit" initial={lesson} onSubmit={handleUpdate} onCancel={() => setMode('view')} />
        </div>
      </li>
    );
  }

  if (mode === 'status') {
    return (
      <li className="ctree-node">
        <div className="ctree-node-edit">
          <ContentStatusWorkflow
            entityId={lesson.id}
            entityType="lessons"
            entityTitle={lesson.title}
            currentStatus={lesson.status as ContentStatus}
            onTransition={handleTransition}
          />
          <button type="button" className="ctree-node-btn" style={{ marginTop: 8 }} onClick={() => setMode('view')}>
            Done
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="ctree-node">
      <div className="ctree-node-row">
        <span style={{ width: 14 }} />
        <StatusDot status={lesson.status} />
        <span className="ctree-node-title">{lesson.title}</span>
        <div className="ctree-node-actions">
          <Link href={`/admin/content/lessons/${lesson.id}`} className="ctree-node-link">
            <span className="ctree-node-btn">Content</span>
          </Link>
          <button type="button" className="ctree-node-btn" onClick={() => setMode('status')}>Status</button>
          <button type="button" className="ctree-node-btn" onClick={() => setMode('edit')}>Edit</button>
        </div>
      </div>
      <div className="ctree-skills-row">
        {skillsError && <span className="ctree-skills-error">Skills unavailable</span>}
        {!skillsError && skills === null && <span className="ctree-hint">Loading skills…</span>}
        {!skillsError && skills !== null && skills.length === 0 && (
          <span className="ctree-skills-warning">No skills linked — required before publish</span>
        )}
        {!skillsError && skills !== null && skills.length > 0 && (
          <div className="ctree-skill-badges">
            {skills.map((skill) => (
              <span key={skill.id} className="ctree-skill-badge" title={skill.title}>{skill.key}</span>
            ))}
          </div>
        )}
        <Link href={`/admin/content/lessons/${lesson.id}/skills`} className="ctree-node-link">
          <span className="ctree-skills-manage">Manage Skills</span>
        </Link>
      </div>
    </li>
  );
}
