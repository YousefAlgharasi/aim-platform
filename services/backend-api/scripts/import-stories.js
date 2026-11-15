#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Imports stories that were WRITTEN BY HAND (not by the AI provider) from JSON files into the database.
 *
 *   node scripts/import-stories.js --dir /stories [--publish] [--dry-run]
 *
 * One JSON file per course:
 *   { "course": "B2.2", "title": "...", "title_ar": "...", "summary": "...", "summary_ar": "...",
 *     "scenes": [ { "setting": "...", "setting_ar": "...",
 *        "lines": [ { "speaker": "narrator|sarah|adam|yasmin|tariq", "text": "..." } ],
 *        "questions": [ { "stem": "...", "options": ["..."], "correctIndex": 0, "explanation": "...", "skill": "<exact skill title of the course>" } ] } ] }
 *
 * Every story is checked with the same rules the generator and the admin editor use; a story with any problem is
 * reported and NOT saved. An existing PUBLISHED story is never replaced. Needs DATABASE_URL (like the backend).
 * Questions are saved as question_bank rows that stay 'draft' (tags story / story-only), answerable only through a
 * published story.
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { parseGeneratedQuestions } = require(path.join(__dirname, '..', 'dist', 'features', 'learner-tools', 'recovery.service'));

const SPEAKERS = ['narrator', 'sarah', 'adam', 'yasmin', 'tariq'];
const SYSTEM_USER = '00000000-0000-0000-0000-000000000001';
const LEVEL = { // question_bank.difficulty per course, and the scene length the course expects
  'Writing 2': { level: 'upper_intermediate', words: [110, 150] }, 'B2.2': { level: 'upper_intermediate', words: [140, 180] },
  'B2+': { level: 'upper_intermediate', words: [150, 200] }, 'C1.1': { level: 'advanced', words: [170, 230] },
  'C1.2': { level: 'advanced', words: [190, 250] }, 'Writing 3': { level: 'advanced', words: [180, 240] }, 'C2': { level: 'advanced', words: [220, 300] },
};

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const DIR = opt('--dir') || '/stories';
const PUBLISH = argv.includes('--publish');
const DRY = argv.includes('--dry-run');

const norm = (t) => t.toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[‐-―]/g, '-').replace(/\s+/g, ' ').trim();
const wordsOf = (lines) => lines.reduce((n, l) => n + l.text.split(/\s+/).filter(Boolean).length, 0);
const NARRATION_IN_SPEECH = /\b(whispered|murmured|leaned|nodded|shrugged|adjusted|nudged|smiled)\b/i;

function problems(story, plan, skills) {
  const out = [];
  if (!story.title || !story.summary) out.push('title and summary are required');
  if (!Array.isArray(story.scenes) || story.scenes.length < 4) out.push('needs at least 4 scenes');
  const seen = new Set();
  (story.scenes || []).forEach((sc, i) => {
    const at = `scene ${i + 1}`;
    if (!sc.setting) out.push(`${at}: setting missing`);
    const lines = (sc.lines || []).filter((l) => SPEAKERS.includes(l.speaker) && l.text && l.text.trim());
    if (lines.length !== (sc.lines || []).length) out.push(`${at}: a line has an unknown speaker or empty text`);
    if (lines.length < 4) out.push(`${at}: fewer than 4 lines`);
    if (new Set(lines.filter((l) => l.speaker !== 'narrator').map((l) => l.speaker)).size < 2) out.push(`${at}: fewer than two friends speak`);
    const bad = lines.find((l) => l.speaker !== 'narrator' && (NARRATION_IN_SPEECH.test(l.text) || /^["“‘]/.test(l.text.trim())));
    if (bad) out.push(`${at}: a friend's line has narration or starts with a quote ("${bad.text.slice(0, 50)}")`);
    const wc = wordsOf(lines);
    if (wc < plan.words[0] * 0.75 || wc > plan.words[1] * 1.35) out.push(`${at}: ${wc} words, expected about ${plan.words[0]}-${plan.words[1]}`);
    const text = norm(lines.map((l) => l.text).join(' '));
    const qs = sc.questions || [];
    if (qs.length !== 3) out.push(`${at}: needs exactly 3 questions (has ${qs.length})`);
    const valid = parseGeneratedQuestions(JSON.stringify(qs.map((q) => ({ ...q, skill: undefined }))), seen);
    if (valid.length !== qs.length) out.push(`${at}: ${qs.length - valid.length} question(s) invalid (need 2-4 distinct options, one correct, a unique stem of 8+ characters)`);
    qs.forEach((q, qi) => {
      if (!skills.some((s) => s.title === q.skill)) out.push(`${at}, question ${qi + 1}: skill "${q.skill}" is not a skill of this course`);
      const quoted = [...String(q.stem).matchAll(/[“"]([^”"]{10,})[”"]/g)].map((m) => norm(m[1]).replace(/[.?!,]+$/g, ''));
      // A gap-fill sentence contains "____": check each piece around the gap instead of the whole string.
      const miss = quoted.flatMap((x) => x.split(/_{2,}/).map((p) => p.trim().replace(/^[.,?!\s]+|[.,?!\s]+$/g, '')).filter((p) => p.length >= 6)).find((x) => !text.includes(x));
      if (miss) out.push(`${at}, question ${qi + 1}: quotes words not in the scene ("${miss.slice(0, 50)}")`);
      seen.add(String(q.stem).toLowerCase());
    });
  });
  return out;
}

async function save(db, courseId, skills, story, plan) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query('SELECT id, status FROM stories WHERE course_id = $1', [courseId]);
    if (existing.rows[0]) {
      if (existing.rows[0].status === 'published') throw new Error('a PUBLISHED story already exists for this course; not replacing it');
      await client.query('DELETE FROM question_bank WHERE id IN (SELECT sq.question_id FROM story_scene_questions sq JOIN story_scenes sc ON sc.id = sq.scene_id WHERE sc.story_id = $1)', [existing.rows[0].id]);
      await client.query('DELETE FROM stories WHERE id = $1', [existing.rows[0].id]);
    }
    const st = await client.query(
      `INSERT INTO stories (course_id, title, title_ar, summary, summary_ar, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [courseId, story.title, story.title_ar || null, story.summary, story.summary_ar || null, PUBLISH ? 'published' : 'draft']);
    for (let i = 0; i < story.scenes.length; i++) {
      const sc = story.scenes[i];
      const sr = await client.query(`INSERT INTO story_scenes (story_id, position, setting, setting_ar, lines) VALUES ($1, $2, $3, $4, $5::jsonb) RETURNING id`,
        [st.rows[0].id, i, sc.setting, sc.setting_ar || null, JSON.stringify(sc.lines)]);
      for (let j = 0; j < sc.questions.length; j++) {
        const q = sc.questions[j];
        const qr = await client.query(
          `INSERT INTO question_bank (type, stem, difficulty, explanation, tags, status, created_by)
           VALUES ('multiple_choice', $1, $2, $3, ARRAY['story', 'story-only', 'hand-written'], 'draft', $4) RETURNING id`,
          [q.stem, plan.level, q.explanation || null, SYSTEM_USER]);
        const order = q.options.map((_, k) => k).sort(() => Math.random() - 0.5);
        for (let pos = 0; pos < order.length; pos++) {
          await client.query(`INSERT INTO question_choices (question_id, text, is_correct, sort_order) VALUES ($1, $2, $3, $4)`,
            [qr.rows[0].id, q.options[order[pos]], order[pos] === q.correctIndex, pos]);
        }
        await client.query(`INSERT INTO question_skills (question_id, skill_id, is_primary) VALUES ($1, $2, true)`, [qr.rows[0].id, skills.find((s) => s.title === q.skill).id]);
        await client.query(`INSERT INTO story_scene_questions (scene_id, question_id, position) VALUES ($1, $2, $3)`, [sr.rows[0].id, qr.rows[0].id, j]);
      }
    }
    await client.query('COMMIT');
    return st.rows[0].id;
  } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
}

async function main() {
  const raw = process.env.DATABASE_URL;
  const u = new URL(raw);
  const ssl = raw.includes('sslmode=require') || process.env.NODE_ENV === 'production';
  u.searchParams.delete('sslmode');
  const db = new Pool({ connectionString: u.toString(), max: 2, ssl: ssl ? { rejectUnauthorized: false } : undefined });
  let failed = 0;
  for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.json')).sort()) {
    const story = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    const plan = LEVEL[story.course];
    const course = (await db.query(`SELECT id FROM courses WHERE title = $1 AND status = 'published'`, [story.course])).rows[0];
    if (!plan || !course) { console.error(`${f}: unknown course "${story.course}"`); failed++; continue; }
    const skills = (await db.query(
      `SELECT DISTINCT s.id, s.title FROM levels lv JOIN chapters ch ON ch.level_id = lv.id JOIN lessons l ON l.chapter_id = ch.id AND l.status = 'published'
         JOIN lesson_skills ls ON ls.lesson_id = l.id JOIN skills s ON s.id = ls.skill_id WHERE lv.course_id = $1`, [course.id])).rows;
    const errs = problems(story, plan, skills);
    const words = (story.scenes || []).reduce((n, sc) => n + wordsOf(sc.lines || []), 0);
    if (errs.length) { console.error(`NOT SAVED ${story.course} (${f}):\n  - ${errs.join('\n  - ')}`); failed++; continue; }
    if (DRY) { console.log(`ok ${story.course}: ${story.scenes.length} scenes, ${words} words, ${story.scenes.reduce((n, s) => n + s.questions.length, 0)} questions (dry run)`); continue; }
    try { const id = await save(db, course.id, skills, story, plan); console.log(`saved ${story.course} -> ${id} (${PUBLISH ? 'published' : 'draft'}; ${story.scenes.length} scenes, ${words} words)`); }
    catch (e) { console.error(`NOT SAVED ${story.course}: ${e.message}`); failed++; }
  }
  await db.end();
  process.exit(failed ? 2 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
