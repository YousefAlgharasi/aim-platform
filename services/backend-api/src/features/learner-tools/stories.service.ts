import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { LessonProgressService } from '../lessons/lesson-progress.service';
import { SessionsService } from '../sessions/sessions.service';

/**
 * Stories: one reading story per course, told in scenes by the four friends, with questions after every scene.
 *
 * Reading is real practice: a student's answers go through POST /sessions/:id/attempt like any other practice, so
 * the AIM engine (never this service, never a client) updates mastery for the course's skills. Nothing here
 * computes mastery or correctness.
 *
 * - Only PUBLISHED stories are visible; the draft -> published step is the human review gate.
 * - A story is locked exactly when its course is (same rule as lessons: LessonProgressService.effectiveUnlockedRank).
 * - Progress is derived from the student's real answers (lesson_attempts); there is no separate progress table.
 */

export const STORY_SPEAKERS = ['narrator', 'sarah', 'adam', 'yasmin', 'tariq'] as const;
export type StorySpeaker = (typeof STORY_SPEAKERS)[number];

export interface StoryLine { speaker: StorySpeaker; text: string }
export interface StoryQuestion { itemId: string; type: string; prompt: string; options: Array<{ id: string; text: string }> }
export interface StoryScene { position: number; setting: string; settingAr: string | null; lines: StoryLine[]; questions: StoryQuestion[]; done: boolean }

export interface StorySummary {
  storyId: string; courseId?: string; courseTitle: string; cefrCode: string | null; title: string; titleAr: string | null; summary: string; summaryAr: string | null;
  scenes: number; questions: number; answered: number; words: number; minutes: number; locked: boolean; completed: boolean;
}
export interface StoryPart {
  index: number; chapterId: string; chapterTitle: string;
  scenes: number; questions: number; answered: number;
  /** The chapter's lessons are all finished (or it has none). */
  unlocked: boolean; done: boolean;
}
export interface CourseStory extends StorySummary { parts: StoryPart[]; partsRead: number }
export interface StoryDetail extends StorySummary {
  sceneList: StoryScene[]; resumeScene: number;
  /** Set when only one part of the story was asked for. */
  part: number | null; partCount: number;
}

/** Pure: reading minutes from the word count (about 120 words a minute for a learner, plus time to answer). */
export function estimateMinutes(words: number, questions: number): number {
  return Math.max(1, Math.round(words / 120 + questions * 0.4));
}

/**
 * Pure: which scenes belong to each chapter's part. S scenes are spread over C chapters as evenly as possible, in order
 * (6 scenes over 4 chapters -> 1, 2, 1, 2). Chapters that would get no scene are skipped. With no chapters the whole
 * story is one part.
 */
export function partRanges(sceneCount: number, chapterCount: number): Array<{ chapterIndex: number; from: number; to: number }> {
  if (sceneCount <= 0) return [];
  if (chapterCount <= 0) return [{ chapterIndex: -1, from: 0, to: sceneCount }];
  const out: Array<{ chapterIndex: number; from: number; to: number }> = [];
  for (let i = 0; i < chapterCount; i++) {
    const from = Math.floor((i * sceneCount) / chapterCount);
    const to = Math.floor(((i + 1) * sceneCount) / chapterCount);
    if (to > from) out.push({ chapterIndex: i, from, to });
  }
  return out;
}

/** Pure: keep only valid lines (known speaker, non-empty text) so a bad row can never break the reader. */
export function cleanLines(raw: unknown): StoryLine[] {
  if (!Array.isArray(raw)) return [];
  const out: StoryLine[] = [];
  for (const l of raw as Array<Record<string, unknown>>) {
    const speaker = typeof l?.speaker === 'string' ? l.speaker.toLowerCase() : '';
    const text = typeof l?.text === 'string' ? l.text.trim() : '';
    if (text && (STORY_SPEAKERS as readonly string[]).includes(speaker)) out.push({ speaker: speaker as StorySpeaker, text });
  }
  return out;
}

const shuffle = <T,>(xs: readonly T[]): T[] => [...xs].sort(() => Math.random() - 0.5);
const studentIds = (ids: string | readonly string[]): string[] => [...new Set((Array.isArray(ids) ? ids : [ids]).filter(Boolean))];

@Injectable()
export class StoriesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly progress: LessonProgressService,
    private readonly sessions: SessionsService,
  ) {}

  /** All published stories with this student's progress and lock state, in course order. */
  async list(authId: string, student: string | readonly string[], courseId?: string): Promise<{ stories: StorySummary[] }> {
    const ids = studentIds(student);
    const rows = await this.db.query<any>(
      `SELECT st.id, st.course_id, st.title, st.title_ar, st.summary, st.summary_ar,
              co.title AS course_title, co.cefr_code, co.cefr_rank, COALESCE(co.track_slug, 'english') AS track_slug,
              (SELECT count(*)::int FROM story_scenes sc WHERE sc.story_id = st.id) AS scenes,
              (SELECT count(*)::int FROM story_scene_questions sq JOIN story_scenes sc ON sc.id = sq.scene_id WHERE sc.story_id = st.id) AS questions,
              (SELECT count(DISTINCT sq.question_id)::int FROM story_scene_questions sq JOIN story_scenes sc ON sc.id = sq.scene_id
                 JOIN lesson_attempts la ON la.item_id = sq.question_id AND la.student_id = ANY($1::uuid[])
                WHERE sc.story_id = st.id) AS answered,
              (SELECT COALESCE(sum(array_length(regexp_split_to_array(btrim(l->>'text'), '\\s+'), 1)), 0)::int
                 FROM story_scenes sc, jsonb_array_elements(sc.lines) AS l WHERE sc.story_id = st.id) AS words
         FROM stories st JOIN courses co ON co.id = st.course_id
        WHERE st.status = 'published' AND co.status = 'published' AND ($2::uuid IS NULL OR st.course_id = $2::uuid)
        ORDER BY co.sort_order, co.title`,
      [ids, courseId ?? null],
    );
    const ranks = new Map<string, number>();
    for (const t of new Set(rows.rows.map((r) => r.track_slug as string))) ranks.set(t, await this.progress.effectiveUnlockedRank(authId, t));
    return {
      stories: rows.rows.map((r) => ({ ...this.summary(r, r.cefr_rank !== null && r.cefr_rank > (ranks.get(r.track_slug) ?? 1)), courseId: r.course_id as string })),
    };
  }

  /** The story of one course, split into one part per chapter, with what each part needs to unlock. Null if the course has no published story. */
  async forCourse(authId: string, internalId: string, courseId: string): Promise<CourseStory | null> {
    const ids = studentIds([authId, internalId]);
    const { stories } = await this.list(authId, ids, courseId);
    const story = stories[0];
    if (!story || story.locked) return null;
    const parts = await this.parts(ids, internalId, story);
    return { ...story, parts, partsRead: parts.filter((p) => p.done).length };
  }

  /** The story part that belongs to one chapter (for the chapter's lesson list), or null when its course has no story. */
  async forChapter(authId: string, internalId: string, chapterId: string): Promise<{ storyId: string; title: string; titleAr: string | null; courseId: string; part: StoryPart } | null> {
    const c = await this.db.query<{ course_id: string }>(
      `SELECT lv.course_id FROM chapters ch JOIN levels lv ON lv.id = ch.level_id WHERE ch.id = $1 LIMIT 1`, [chapterId]);
    const courseId = c.rows[0]?.course_id;
    if (!courseId) return null;
    const story = await this.forCourse(authId, internalId, courseId);
    const part = story?.parts.find((p) => p.chapterId === chapterId);
    return story && part ? { storyId: story.storyId, title: story.title, titleAr: story.titleAr, courseId, part } : null;
  }

  /** One story with its scenes, lines and questions (no correctness data). 403 while its course (or the asked part) is locked. */
  async get(authId: string, student: string | readonly string[], storyId: string, part?: number): Promise<StoryDetail> {
    const ids = studentIds(student);
    const { stories } = await this.list(authId, ids);
    const story = stories.find((s) => s.storyId === storyId);
    if (!story) throw new NotFoundException('Story not found');
    if (story.locked) throw new ForbiddenException('This story is locked until you reach its course');

    let range: { from: number; to: number } | null = null;
    let partCount = 1;
    if (part !== undefined) {
      const parts = await this.parts(ids, ids[ids.length - 1], story);
      partCount = parts.length;
      const p = parts[part];
      if (!p) throw new NotFoundException('Story part not found');
      if (!p.unlocked) throw new ForbiddenException('Finish this chapter\'s lessons to unlock this part of the story');
      range = this.partScenes(p.index, parts);
    }

    const scenes = await this.db.query<any>(
      `SELECT sc.id, sc.position, sc.setting, sc.setting_ar, sc.lines FROM story_scenes sc WHERE sc.story_id = $1 ORDER BY sc.position`, [storyId]);
    const qrows = await this.db.query<any>(
      `SELECT sq.scene_id, sq.position, qb.id, qb.type, qb.stem,
              EXISTS (SELECT 1 FROM lesson_attempts la WHERE la.item_id = qb.id AND la.student_id = ANY($2::uuid[])) AS answered
         FROM story_scene_questions sq JOIN story_scenes sc ON sc.id = sq.scene_id JOIN question_bank qb ON qb.id = sq.question_id
        WHERE sc.story_id = $1 ORDER BY sq.position`,
      [storyId, ids]);
    const choices = await this.db.query<{ question_id: string; id: string; text: string }>(
      `SELECT c.question_id, c.id, c.text FROM question_choices c WHERE c.question_id = ANY($1::uuid[]) ORDER BY c.sort_order, c.created_at`,
      [qrows.rows.map((q) => q.id)]);
    const opts = new Map<string, Array<{ id: string; text: string }>>();
    for (const c of choices.rows) opts.set(c.question_id, [...(opts.get(c.question_id) ?? []), { id: c.id, text: c.text }]);

    const all: StoryScene[] = scenes.rows.map((sc) => {
      const qs = qrows.rows.filter((q) => q.scene_id === sc.id);
      return {
        position: sc.position, setting: sc.setting, settingAr: sc.setting_ar, lines: cleanLines(sc.lines),
        questions: qs
          .filter((q) => (opts.get(q.id)?.length ?? 0) >= 2)
          .map((q): StoryQuestion => ({ itemId: q.id, type: q.type, prompt: q.stem, options: q.type === 'true_false' ? opts.get(q.id)! : shuffle(opts.get(q.id)!) })),
        done: qs.length > 0 && qs.every((q) => q.answered),
      };
    });
    const out = range ? all.filter((sc) => sc.position >= range!.from && sc.position < range!.to) : all;
    const resume = out.findIndex((s) => !s.done);
    return { ...story, sceneList: out, resumeScene: resume === -1 ? 0 : resume, part: part ?? null, partCount };
  }

  /** A real learning session for reading this story; answers go through /sessions/:id/attempt. */
  async start(authId: string, internalId: string, storyId: string, part?: number): Promise<{ sessionId: string }> {
    const story = await this.get(authId, [authId, internalId], storyId, part);
    const skills = await this.db.query<{ key: string }>(
      `SELECT DISTINCT s.key FROM story_scene_questions sq JOIN story_scenes sc ON sc.id = sq.scene_id
         JOIN question_skills qs ON qs.question_id = sq.question_id JOIN skills s ON s.id = qs.skill_id WHERE sc.story_id = $1 LIMIT 10`,
      [story.storyId]);
    const session = await this.sessions.startSession({
      studentId: authId, internalUserId: internalId, sessionType: 'adaptive_drill', skillFocusIds: skills.rows.map((r) => r.key),
    });
    return { sessionId: session.id };
  }

  /** One part per chapter that gets scenes, with this student's unlock and reading state. */
  private async parts(ids: string[], internalId: string, story: StorySummary): Promise<StoryPart[]> {
    const profile = await this.db.query<{ id: string }>(`SELECT id FROM student_profiles WHERE user_id = $1 LIMIT 1`, [internalId]);
    const who = [...new Set([...ids, ...profile.rows.map((r) => r.id)])];
    const chapters = await this.db.query<{ id: string; title: string; total: number; done: number }>(
      `SELECT ch.id, ch.title,
              (SELECT count(*)::int FROM lessons l WHERE l.chapter_id = ch.id AND l.status = 'published') AS total,
              (SELECT count(DISTINCT l.id)::int FROM lessons l JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.completed AND lp.student_id = ANY($2::uuid[])
                WHERE l.chapter_id = ch.id AND l.status = 'published') AS done
         FROM chapters ch JOIN levels lv ON lv.id = ch.level_id AND lv.status = 'published' AND lv.course_id = $1
        WHERE ch.status = 'published' ORDER BY lv.sort_order, ch.sort_order`,
      [story.courseId, who]);
    const perScene = await this.db.query<{ position: number; questions: number; answered: number }>(
      `SELECT sc.position, count(sq.question_id)::int AS questions,
              count(sq.question_id) FILTER (WHERE EXISTS (SELECT 1 FROM lesson_attempts la WHERE la.item_id = sq.question_id AND la.student_id = ANY($2::uuid[])))::int AS answered
         FROM story_scenes sc LEFT JOIN story_scene_questions sq ON sq.scene_id = sc.id WHERE sc.story_id = $1 GROUP BY sc.position`,
      [story.storyId, ids]);
    return partRanges(story.scenes, chapters.rows.length).map((r, index): StoryPart => {
      const ch = chapters.rows[r.chapterIndex];
      const inRange = perScene.rows.filter((x) => x.position >= r.from && x.position < r.to);
      const questions = inRange.reduce((n, x) => n + x.questions, 0);
      const answered = inRange.reduce((n, x) => n + x.answered, 0);
      return {
        index, chapterId: ch?.id ?? '', chapterTitle: ch?.title ?? story.title,
        scenes: r.to - r.from, questions, answered,
        unlocked: !ch || ch.total === 0 || ch.done >= ch.total,
        done: questions > 0 && answered >= questions,
      };
    });
  }

  /** The scene range of part [index] (scenes are spread over the parts in order). */
  private partScenes(index: number, parts: StoryPart[]): { from: number; to: number } {
    let from = 0;
    for (let i = 0; i < index; i++) from += parts[i].scenes;
    return { from, to: from + parts[index].scenes };
  }

  private summary(r: any, locked: boolean): StorySummary {
    const scenes = r.scenes ?? 0;
    const questions = r.questions ?? 0;
    const answered = r.answered ?? 0;
    return {
      storyId: r.id, courseTitle: r.course_title, cefrCode: r.cefr_code ?? null, title: r.title, titleAr: r.title_ar ?? null,
      summary: r.summary, summaryAr: r.summary_ar ?? null, scenes, questions, answered, words: r.words ?? 0,
      minutes: estimateMinutes(r.words ?? 0, questions), locked, completed: questions > 0 && answered >= questions,
    };
  }
}
