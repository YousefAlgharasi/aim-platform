import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../../database/database.service';
import { cleanLines, StoryLine } from './stories.service';
import { difficultyForCourseRank, StoryInput, StoryStatus, STORY_STATUSES, validateStoryInput } from './admin-stories.validation';

/**
 * Admin editing of the course stories: list, read, create, save (replace the whole content), change status, delete.
 *
 * Saving keeps the id of every scene and question the admin edits, so students' earlier answers stay attached.
 * Story questions are ordinary question_bank rows that STAY 'draft' (tags story / story-only): no lesson, practice or
 * Improve query serves them, and they are answerable only through a PUBLISHED story.
 * Nothing here touches mastery: students' answers are scored by the AIM engine as usual.
 */

export interface AdminStoryRow {
  storyId: string; courseId: string; courseTitle: string; cefrCode: string | null; title: string; titleAr: string | null;
  status: StoryStatus; scenes: number; questions: number; words: number; updatedAt: string;
}
export interface AdminStoryQuestion {
  id: string; stem: string; explanation: string | null; skillKey: string | null; options: Array<{ text: string; correct: boolean }>;
}
export interface AdminStoryScene {
  id: string; setting: string; settingAr: string | null; lines: StoryLine[]; questions: AdminStoryQuestion[];
}
export interface AdminStoryDetail {
  storyId: string; courseId: string; courseTitle: string; cefrCode: string | null;
  title: string; titleAr: string | null; summary: string; summaryAr: string | null; status: StoryStatus;
  scenes: AdminStoryScene[];
  /** The skills the course teaches: the choices for tagging a question. */
  skills: Array<{ key: string; title: string }>;
}

@Injectable()
export class AdminStoriesService {
  constructor(private readonly db: DatabaseService) {}

  async list(): Promise<{ stories: AdminStoryRow[]; coursesWithoutStory: Array<{ id: string; title: string; cefrCode: string | null }> }> {
    const rows = await this.db.query<any>(
      `SELECT st.id, st.course_id, co.title AS course_title, co.cefr_code, st.title, st.title_ar, st.status, st.updated_at,
              (SELECT count(*)::int FROM story_scenes sc WHERE sc.story_id = st.id) AS scenes,
              (SELECT count(*)::int FROM story_scene_questions sq JOIN story_scenes sc ON sc.id = sq.scene_id WHERE sc.story_id = st.id) AS questions,
              (SELECT COALESCE(sum(array_length(regexp_split_to_array(btrim(l->>'text'), '\\s+'), 1)), 0)::int
                 FROM story_scenes sc, jsonb_array_elements(sc.lines) AS l WHERE sc.story_id = st.id) AS words
         FROM stories st JOIN courses co ON co.id = st.course_id
        ORDER BY co.sort_order, co.title`);
    const free = await this.db.query<{ id: string; title: string; cefr_code: string | null }>(
      `SELECT co.id, co.title, co.cefr_code FROM courses co
        WHERE co.status = 'published' AND NOT EXISTS (SELECT 1 FROM stories st WHERE st.course_id = co.id)
        ORDER BY co.sort_order, co.title`);
    return {
      stories: rows.rows.map((r) => ({
        storyId: r.id, courseId: r.course_id, courseTitle: r.course_title, cefrCode: r.cefr_code ?? null, title: r.title, titleAr: r.title_ar ?? null,
        status: r.status, scenes: r.scenes, questions: r.questions, words: r.words, updatedAt: new Date(r.updated_at).toISOString(),
      })),
      coursesWithoutStory: free.rows.map((c) => ({ id: c.id, title: c.title, cefrCode: c.cefr_code ?? null })),
    };
  }

  async get(id: string): Promise<AdminStoryDetail> {
    const st = await this.db.query<any>(
      `SELECT st.id, st.course_id, st.title, st.title_ar, st.summary, st.summary_ar, st.status, co.title AS course_title, co.cefr_code
         FROM stories st JOIN courses co ON co.id = st.course_id WHERE st.id = $1`, [id]);
    const s = st.rows[0];
    if (!s) throw new NotFoundException('Story not found');
    return { ...(await this.content(id)), storyId: s.id, courseId: s.course_id, courseTitle: s.course_title, cefrCode: s.cefr_code ?? null,
      title: s.title, titleAr: s.title_ar ?? null, summary: s.summary, summaryAr: s.summary_ar ?? null, status: s.status,
      skills: await this.courseSkills(s.course_id) };
  }

  /** A blank story shell for a course, to start editing from. 409 when the course already has one. */
  async create(adminId: string, raw: unknown): Promise<{ storyId: string }> {
    const v = validateStoryInput(raw);
    if (!v.ok) throw new BadRequestException(v.errors);
    if (!v.value.courseId) throw new BadRequestException(['Pick the course this story belongs to.']);
    const course = await this.db.query<{ id: string; cefr_rank: number | null }>(`SELECT id, cefr_rank FROM courses WHERE id = $1`, [v.value.courseId]);
    if (!course.rowCount) throw new NotFoundException('Course not found');
    const dup = await this.db.query(`SELECT 1 FROM stories WHERE course_id = $1`, [v.value.courseId]);
    if (dup.rowCount) throw new ConflictException('This course already has a story. Edit it instead.');
    const storyId = await this.db.withClient(async (client) => {
      await client.query('BEGIN');
      try {
        const ins = await client.query<{ id: string }>(
          `INSERT INTO stories (course_id, title, title_ar, summary, summary_ar, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [v.value.courseId, v.value.title, v.value.titleAr, v.value.summary, v.value.summaryAr, v.value.status]);
        await this.writeScenes(client, ins.rows[0].id, v.value.courseId!, course.rows[0].cefr_rank, adminId, v.value, new Set(), new Set());
        await client.query('COMMIT');
        return ins.rows[0].id;
      } catch (e) { await client.query('ROLLBACK'); throw e; }
    });
    return { storyId };
  }

  /** Replace the story's whole content with what the admin sent. */
  async save(adminId: string, id: string, raw: unknown): Promise<{ ok: true }> {
    const v = validateStoryInput(raw);
    if (!v.ok) throw new BadRequestException(v.errors);
    const cur = await this.db.query<{ course_id: string; cefr_rank: number | null }>(
      `SELECT st.course_id, co.cefr_rank FROM stories st JOIN courses co ON co.id = st.course_id WHERE st.id = $1`, [id]);
    if (!cur.rowCount) throw new NotFoundException('Story not found');
    const existingScenes = await this.db.query<{ id: string }>(`SELECT id FROM story_scenes WHERE story_id = $1`, [id]);
    const existingQs = await this.db.query<{ question_id: string }>(
      `SELECT sq.question_id FROM story_scene_questions sq JOIN story_scenes sc ON sc.id = sq.scene_id WHERE sc.story_id = $1`, [id]);
    await this.db.withClient(async (client) => {
      await client.query('BEGIN');
      try {
        await client.query(
          `UPDATE stories SET title = $2, title_ar = $3, summary = $4, summary_ar = $5, status = $6, updated_at = now() WHERE id = $1`,
          [id, v.value.title, v.value.titleAr, v.value.summary, v.value.summaryAr, v.value.status]);
        await this.writeScenes(client, id, cur.rows[0].course_id, cur.rows[0].cefr_rank, adminId, v.value,
          new Set(existingScenes.rows.map((r) => r.id)), new Set(existingQs.rows.map((r) => r.question_id)));
        await client.query('COMMIT');
      } catch (e) { await client.query('ROLLBACK'); throw e; }
    });
    return { ok: true };
  }

  async setStatus(id: string, status: unknown): Promise<{ ok: true }> {
    if (typeof status !== 'string' || !STORY_STATUSES.includes(status as StoryStatus)) throw new BadRequestException(['Status must be draft, published or archived.']);
    if (status === 'published') {
      const empty = await this.db.query(
        `SELECT 1 FROM story_scenes sc WHERE sc.story_id = $1 AND NOT EXISTS (SELECT 1 FROM story_scene_questions sq WHERE sq.scene_id = sc.id) LIMIT 1`, [id]);
      if (empty.rowCount) throw new BadRequestException(['Every scene needs at least one question before the story can be published.']);
      const none = await this.db.query(`SELECT 1 FROM story_scenes WHERE story_id = $1 LIMIT 1`, [id]);
      if (!none.rowCount) throw new BadRequestException(['Add at least one scene before publishing.']);
    }
    const r = await this.db.query(`UPDATE stories SET status = $2, updated_at = now() WHERE id = $1`, [id, status]);
    if (!r.rowCount) throw new NotFoundException('Story not found');
    return { ok: true };
  }

  /** Delete the story, its scenes and its questions. Students' past answers stay in their history. */
  async remove(id: string): Promise<{ deleted: true }> {
    const exists = await this.db.query(`SELECT 1 FROM stories WHERE id = $1`, [id]);
    if (!exists.rowCount) throw new NotFoundException('Story not found');
    await this.db.withClient(async (client) => {
      await client.query('BEGIN');
      try {
        await client.query(
          `DELETE FROM question_bank WHERE id IN (SELECT sq.question_id FROM story_scene_questions sq JOIN story_scenes sc ON sc.id = sq.scene_id WHERE sc.story_id = $1)`, [id]);
        await client.query(`DELETE FROM stories WHERE id = $1`, [id]);
        await client.query('COMMIT');
      } catch (e) { await client.query('ROLLBACK'); throw e; }
    });
    return { deleted: true };
  }

  // -------------------------------------------------------------------------

  private async courseSkills(courseId: string): Promise<Array<{ key: string; title: string }>> {
    const r = await this.db.query<{ key: string; title: string }>(
      `SELECT DISTINCT s.key, s.title FROM levels lv JOIN chapters ch ON ch.level_id = lv.id JOIN lessons l ON l.chapter_id = ch.id
         JOIN lesson_skills ls ON ls.lesson_id = l.id JOIN skills s ON s.id = ls.skill_id WHERE lv.course_id = $1 ORDER BY s.key LIMIT 60`, [courseId]);
    return r.rows;
  }

  private async content(storyId: string): Promise<{ scenes: AdminStoryScene[] }> {
    const scenes = await this.db.query<any>(`SELECT id, setting, setting_ar, lines FROM story_scenes WHERE story_id = $1 ORDER BY position`, [storyId]);
    const qs = await this.db.query<any>(
      `SELECT sq.scene_id, qb.id, qb.stem, qb.explanation,
              (SELECT s.key FROM question_skills qs JOIN skills s ON s.id = qs.skill_id WHERE qs.question_id = qb.id ORDER BY qs.is_primary DESC LIMIT 1) AS skill_key,
              (SELECT json_agg(json_build_object('text', c.text, 'correct', c.is_correct) ORDER BY c.sort_order) FROM question_choices c WHERE c.question_id = qb.id) AS options
         FROM story_scene_questions sq JOIN story_scenes sc ON sc.id = sq.scene_id JOIN question_bank qb ON qb.id = sq.question_id
        WHERE sc.story_id = $1 ORDER BY sq.position`, [storyId]);
    return {
      scenes: scenes.rows.map((sc) => ({
        id: sc.id, setting: sc.setting, settingAr: sc.setting_ar ?? null, lines: cleanLines(sc.lines),
        questions: qs.rows.filter((q) => q.scene_id === sc.id).map((q) => ({
          id: q.id, stem: q.stem, explanation: q.explanation ?? null, skillKey: q.skill_key ?? null, options: q.options ?? [],
        })),
      })),
    };
  }

  /**
   * Write the scenes and questions of [input] for the story: update the ones that already exist (same id), insert new
   * ones, and delete what the admin removed. Runs inside the caller's transaction.
   */
  private async writeScenes(
    client: PoolClient, storyId: string, courseId: string, cefrRank: number | null, adminId: string, input: StoryInput,
    existingSceneIds: Set<string>, existingQuestionIds: Set<string>,
  ): Promise<void> {
    const difficulty = difficultyForCourseRank(cefrRank);
    const skillRows = await client.query<{ id: string; key: string }>(
      `SELECT DISTINCT s.id, s.key FROM levels lv JOIN chapters ch ON ch.level_id = lv.id JOIN lessons l ON l.chapter_id = ch.id
         JOIN lesson_skills ls ON ls.lesson_id = l.id JOIN skills s ON s.id = ls.skill_id WHERE lv.course_id = $1 ORDER BY s.key`, [courseId]);
    const fallbackSkill = skillRows.rows[0]?.id ?? null;
    const allSkills = await client.query<{ id: string; key: string }>(`SELECT id, key FROM skills WHERE key = ANY($1::text[])`,
      [input.scenes.flatMap((s) => s.questions.map((q) => q.skillKey)).filter((k): k is string => !!k)]);
    const skillIdByKey = new Map(allSkills.rows.map((r) => [r.key, r.id]));

    // Move every kept scene out of the way first so positions never collide while they are renumbered.
    await client.query(`UPDATE story_scenes SET position = position + 1000 WHERE story_id = $1`, [storyId]);

    const keptScenes = new Set<string>();
    const keptQuestions = new Set<string>();
    for (let si = 0; si < input.scenes.length; si++) {
      const sc = input.scenes[si];
      let sceneId: string;
      if (sc.id && existingSceneIds.has(sc.id)) {
        sceneId = sc.id;
        await client.query(`UPDATE story_scenes SET position = $2, setting = $3, setting_ar = $4, lines = $5::jsonb WHERE id = $1`,
          [sceneId, si, sc.setting, sc.settingAr, JSON.stringify(sc.lines)]);
      } else {
        const ins = await client.query<{ id: string }>(
          `INSERT INTO story_scenes (story_id, position, setting, setting_ar, lines) VALUES ($1, $2, $3, $4, $5::jsonb) RETURNING id`,
          [storyId, si, sc.setting, sc.settingAr, JSON.stringify(sc.lines)]);
        sceneId = ins.rows[0].id;
      }
      keptScenes.add(sceneId);

      // The scene's question links are rebuilt below (a question can move between scenes).
      await client.query(`DELETE FROM story_scene_questions WHERE scene_id = $1`, [sceneId]);
      for (let qi = 0; qi < sc.questions.length; qi++) {
        const q = sc.questions[qi];
        let questionId: string;
        if (q.id && existingQuestionIds.has(q.id)) {
          questionId = q.id;
          await client.query(`UPDATE question_bank SET stem = $2, explanation = $3, difficulty = $4, updated_at = now() WHERE id = $1`, [questionId, q.stem, q.explanation, difficulty]);
          await client.query(`DELETE FROM question_choices WHERE question_id = $1`, [questionId]);
          await client.query(`DELETE FROM question_skills WHERE question_id = $1`, [questionId]);
        } else {
          const ins = await client.query<{ id: string }>(
            `INSERT INTO question_bank (type, stem, difficulty, explanation, tags, status, created_by)
             VALUES ('multiple_choice', $1, $2, $3, ARRAY['story', 'story-only', 'admin-written'], 'draft', $4) RETURNING id`,
            [q.stem, difficulty, q.explanation, adminId]);
          questionId = ins.rows[0].id;
        }
        keptQuestions.add(questionId);
        for (let oi = 0; oi < q.options.length; oi++) {
          await client.query(`INSERT INTO question_choices (question_id, text, is_correct, sort_order) VALUES ($1, $2, $3, $4)`,
            [questionId, q.options[oi].text, q.options[oi].correct, oi]);
        }
        const skillId = (q.skillKey && skillIdByKey.get(q.skillKey)) || fallbackSkill;
        if (skillId) await client.query(`INSERT INTO question_skills (question_id, skill_id, is_primary) VALUES ($1, $2, true)`, [questionId, skillId]);
        await client.query(`INSERT INTO story_scene_questions (scene_id, question_id, position) VALUES ($1, $2, $3)`, [sceneId, questionId, qi]);
      }
    }

    // Anything the admin removed goes: its questions first (their links go with them), then the scenes.
    const goneQuestions = [...existingQuestionIds].filter((id) => !keptQuestions.has(id));
    if (goneQuestions.length) await client.query(`DELETE FROM question_bank WHERE id = ANY($1::uuid[])`, [goneQuestions]);
    const goneScenes = [...existingSceneIds].filter((id) => !keptScenes.has(id));
    if (goneScenes.length) await client.query(`DELETE FROM story_scenes WHERE id = ANY($1::uuid[])`, [goneScenes]);
  }
}
