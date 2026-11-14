#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Writes ONE reading story per course (the four friends Sarah, Adam, Yasmin and Tariq), scene by scene, and saves it
 * as a DRAFT for human review. Students only see a story after its status is changed to 'published'.
 *
 *   node scripts/generate-stories.js                      all courses without a story yet
 *   node scripts/generate-stories.js --only "A1.1,B2.1"   just these courses (by title)
 *   node scripts/generate-stories.js --force              replace an existing DRAFT story (never a published one)
 *   node scripts/generate-stories.js --dry-run --out DIR  write JSON files into DIR and touch nothing in the database
 *   node scripts/generate-stories.js --publish            save finished stories as PUBLISHED (students see them) instead of draft
 *   node scripts/generate-stories.js --budget 60000 --ledger FILE
 *        never spend more than N AI tokens in any rolling 24 hours (tracked in FILE, so it survives restarts); when the
 *        budget is used up it WAITS, then carries on. The AI account has a 200,000 tokens/day limit shared with the live
 *        AI Teacher and student practice, so keep this well under half.
 *
 * Uses the same env as the backend: DATABASE_URL, AI_PROVIDER_BASE_URL, AI_PROVIDER_API_KEY, AI_PROVIDER_MODEL.
 * The questions are saved as question_bank rows that STAY 'draft' (tags story / story-only): they are answerable only
 * through a published story, so they can never appear in lesson, practice or Improve pools.
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const { parseGeneratedQuestions } = require(path.join(__dirname, '..', 'dist', 'features', 'learner-tools', 'recovery.service'));

const SPEAKERS = ['narrator', 'sarah', 'adam', 'yasmin', 'tariq'];
const SYSTEM_USER = '00000000-0000-0000-0000-000000000001'; // same created_by as the rest of the question bank

const CAST = `The cast (the same four friends in every story, growing up across the series):
- Sarah: curious, organised, loves books and asking "why". Long wavy hair and a yellow bow.
- Adam: sporty, funny, always hungry, never without his backpack.
- Yasmin: creative and brave, loves drawing and music. Hair in two puffs.
- Tariq: thoughtful, loves gadgets and puzzles, gently shy. Curly hair.`;

// level = question_bank difficulty; scenes / words per scene / questions per scene grow with the course.
const PLAN = {
  'Starter':   { level: 'beginner', cefr: 'absolute beginner (pre-A1)', scenes: 4,  words: [25, 40],   qs: 2, theme: 'The First Day', premise: 'The four friends meet on the first day of class: names, greetings, colours, numbers, things in the classroom.', style: 'Only very simple present-tense sentences of 3 to 6 words. Use the 300 most common words. Lots of repetition. No contractions except I\'m and it\'s.' },
  'A1.1':      { level: 'beginner', cefr: 'A1', scenes: 5,  words: [35, 55],   qs: 2, theme: "Sarah's Birthday", premise: "It is Sarah's birthday. Family, food and drink, numbers, days and months.", style: 'Simple present and "to be", "can", short sentences of 4 to 8 words. Everyday words only.' },
  'A1.2':      { level: 'beginner', cefr: 'A1', scenes: 5,  words: [40, 60],   qs: 2, theme: 'Saturday in the Neighbourhood', premise: 'A Saturday walking round town: places, directions, daily routine.', style: 'Present simple, "there is/are", prepositions of place, imperatives for directions. Short sentences.' },
  'Writing 1': { level: 'beginner', cefr: 'A1 writing', scenes: 5,  words: [40, 60], qs: 2, theme: 'The Class Notice Board', premise: 'The friends write short notices, name tags and messages for the class notice board: capital letters, full stops, simple sentences, writing about yourself.', style: 'Simple sentences of 4 to 8 words. The scenes should SHOW good and bad examples of simple writing the questions can ask about.' },
  'A2.1':      { level: 'elementary', cefr: 'A2', scenes: 6,  words: [55, 80],   qs: 2, theme: 'The School Trip', premise: 'A school trip to the coast: transport, weather, what happened, plans for the day.', style: 'Past simple (regular and irregular), "going to", simple connectors (and, but, because). Sentences of 6 to 12 words.' },
  'A2.2':      { level: 'elementary', cefr: 'A2', scenes: 6,  words: [65, 90],   qs: 2, theme: 'The Lost Phone', premise: "Tariq loses his phone in the market. Shopping, money, polite requests, comparing things.", style: 'Past simple and continuous, comparatives and superlatives, polite requests. Sentences of 6 to 14 words.' },
  'B1.1':      { level: 'intermediate', cefr: 'B1', scenes: 7,  words: [80, 110],  qs: 3, theme: 'The Charity Cook-off', premise: 'The friends organise a charity cook-off: plans, advice, experiences so far.', style: 'Present perfect, future forms, modals of advice/obligation, first conditional. Natural spoken English with some contractions.' },
  'B1.2':      { level: 'intermediate', cefr: 'B1', scenes: 7,  words: [90, 120],  qs: 3, theme: 'The New Student', premise: 'A new student joins the class and the friends help her settle in: past vs present perfect, reporting what people said.', style: 'Narrative tenses, present perfect vs past simple, reported statements, relative clauses.' },
  'B1+':       { level: 'intermediate', cefr: 'B1+', scenes: 8,  words: [100, 135], qs: 3, theme: 'The Summer Job', premise: 'Summer jobs: interviews, hopes and hypotheticals, what they enjoy and dislike.', style: 'Conditionals (zero, first, second), gerunds and infinitives, phrasal verbs in context.' },
  'B2.1':      { level: 'upper_intermediate', cefr: 'B2', scenes: 8,  words: [120, 160], qs: 3, theme: 'The Debate Club', premise: 'The friends join the school debate club: opinions, arguments, giving reasons.', style: 'Passive voice, non-defining relative clauses, opinion and agreement language, longer complex sentences.' },
  'Writing 2': { level: 'upper_intermediate', cefr: 'B2 writing', scenes: 8,  words: [110, 150], qs: 3, theme: 'The School Newspaper', premise: 'The friends start a school newspaper: paragraphs and topic sentences, linking words, emails and opinion pieces, formal vs informal register.', style: 'Show real drafts of paragraphs, emails and opinion pieces the questions can ask about (structure, linking, register).' },
  'B2.2':      { level: 'upper_intermediate', cefr: 'B2', scenes: 9,  words: [140, 180], qs: 3, theme: 'The Missing Trophy', premise: 'The school trophy disappears: the friends investigate, deduce and speculate.', style: 'Modals of deduction, third conditional, reported questions and commands, narrative tension.' },
  'B2+':       { level: 'upper_intermediate', cefr: 'B2+', scenes: 9,  words: [150, 200], qs: 3, theme: 'The Film Festival', premise: 'The friends make a short film for the school festival: creative disagreements, hedging, hypotheticals about the past and present.', style: 'Mixed conditionals, hedging language, advanced connectors and discourse markers.' },
  'C1.1':      { level: 'advanced', cefr: 'C1', scenes: 10, words: [170, 230], qs: 3, theme: 'The Startup', premise: 'The friends, now young adults, launch a small startup: pitches, negotiations, formal and informal registers.', style: 'Formal register, inversion for emphasis, complex conditionals, precise vocabulary and collocations.' },
  'C1.2':      { level: 'advanced', cefr: 'C1', scenes: 10, words: [190, 250], qs: 3, theme: 'The Town Meeting', premise: 'A town meeting about the old library: persuasion, nuance, idioms and diplomatic language.', style: 'Persuasive and argumentative language, idioms and collocations, nuanced modality. Rich, natural English.' },
  'Writing 3': { level: 'advanced', cefr: 'C1 writing', scenes: 10, words: [180, 240], qs: 3, theme: 'The Editorial', premise: 'The friends write an editorial about the future of their town: argumentative structure, synthesising several viewpoints, editing for cohesion and concision.', style: 'Show drafts, edits and several viewpoints the questions can ask about.' },
  'C2':        { level: 'advanced', cefr: 'C2', scenes: 11, words: [220, 300], qs: 3, theme: 'The Last Lecture', premise: 'A beloved teacher gives a final lecture and the friends reflect on how far they have come: rhetorical devices, subtle implication, extended natural speech.', style: 'Sophisticated, natural, idiomatic English; subtle modality and implication; literary and rhetorical devices.' },
};

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const ONLY = (opt('--only') || '').split(',').map((s) => s.trim()).filter(Boolean);
const FORCE = flag('--force');
const DRY = flag('--dry-run');
const OUT = opt('--out') || '/tmp/stories-out';
const CONCURRENCY = Number(opt('--concurrency') || 1);
const PUBLISH = flag('--publish');
const BUDGET = Number(opt('--budget') || 0); // tokens per rolling 24h; 0 = no own budget
const LEDGER = opt('--ledger') || '/tmp/stories-ledger.json';

const url = process.env.AI_PROVIDER_BASE_URL;
const key = process.env.AI_PROVIDER_API_KEY;
const model = process.env.AI_PROVIDER_MODEL;
if (!url || !key || !model) { console.error('AI_PROVIDER_* env is missing'); process.exit(1); }

function pool() {
  const raw = process.env.DATABASE_URL;
  const u = new URL(raw);
  const ssl = raw.includes('sslmode=require') || process.env.NODE_ENV === 'production';
  u.searchParams.delete('sslmode');
  return new Pool({ connectionString: u.toString(), max: 4, ssl: ssl ? { rejectUnauthorized: false } : undefined });
}

// The AI account allows only ~8,000 tokens a minute and the live AI Teacher and student practice share it, so this
// script paces itself to --tpm tokens per rolling minute (default 4500, a bit over half) and obeys 429 wait times.
const TPM = Number(opt('--tpm') || 4500);
const EST_TOKENS = 2200;
const EFFORT = opt('--effort') || 'low'; // this model burns tokens thinking; story writing does not need much
const used = []; // { t, tokens } within the last minute
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function pace() {
  for (;;) {
    const now = Date.now();
    while (used.length && now - used[0].t > 60000) used.shift();
    if (used.reduce((n, u) => n + u.tokens, 0) + EST_TOKENS <= TPM) return;
    await sleep(1500);
  }
}

/** "17.7s", "8m38.4s", "250ms" -> milliseconds */
function parseWait(v) {
  if (!v) return 0;
  const m = /^(?:(\d+)m(?!s))?(?:([\d.]+)s)?(?:([\d.]+)ms)?$/.exec(String(v).trim());
  if (!m) return Number(v) * 1000 || 0;
  return (Number(m[1] || 0) * 60 + Number(m[2] || 0)) * 1000 + Number(m[3] || 0);
}

const DAY = 24 * 60 * 60 * 1000;
function readLedger() {
  try { return JSON.parse(fs.readFileSync(LEDGER, 'utf8')).filter((e) => Date.now() - e.t < DAY); } catch { return []; }
}
function addLedger(tokens) {
  const l = readLedger();
  l.push({ t: Date.now(), tokens });
  try { fs.writeFileSync(LEDGER, JSON.stringify(l)); } catch (e) { console.error('ledger write failed:', e.message); }
}
/** Wait until spending EST_TOKENS more stays inside the 24h budget. */
async function budgetGate() {
  if (!BUDGET) return;
  let said = false;
  for (;;) {
    const l = readLedger();
    const spent = l.reduce((n, e) => n + e.tokens, 0);
    if (spent + EST_TOKENS <= BUDGET) return;
    if (!said) { console.log(`daily budget reached (${spent}/${BUDGET} tokens in 24h); waiting for it to free up`); said = true; }
    await sleep(5 * 60 * 1000);
  }
}

async function ai(prompt) {
  for (let attempt = 1; attempt <= 10; attempt++) {
    await budgetGate();
    await pace();
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` }, body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], reasoning_effort: EFFORT }) });
      if (r.status === 429) {
        const body = await r.text().catch(() => '');
        if (/per day|TPD/i.test(body)) {
          // The whole account's daily limit is used up (live AI included): back off for a long while and do not burn attempts.
          console.log('AI daily limit reached; waiting 20 minutes');
          await sleep(20 * 60 * 1000);
          attempt -= 1;
          continue;
        }
        const wait = Math.min(120000, Math.max(parseWait(r.headers.get('retry-after')) , parseWait(r.headers.get('x-ratelimit-reset-tokens')), 5000)) + 1000;
        used.push({ t: Date.now(), tokens: TPM }); // back off: treat the minute as full
        await sleep(wait);
        continue;
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      const spent = Number(j?.usage?.total_tokens) || EST_TOKENS;
      used.push({ t: Date.now(), tokens: spent });
      if (BUDGET) addLedger(spent);
      const text = j?.choices?.[0]?.message?.content ?? '';
      if (text.trim()) return text;
      throw new Error('empty reply');
    } catch (e) {
      if (attempt === 10) throw e;
      await sleep(2000 * Math.min(attempt, 5));
    }
  }
}

const parseObject = (raw) => { const m = raw && raw.match(/\{[\s\S]*\}/); if (!m) return null; try { return JSON.parse(m[0]); } catch { return null; } };
const wordCount = (lines) => lines.reduce((n, l) => n + l.text.split(/\s+/).filter(Boolean).length, 0);


const norm = (t) => t.toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2010-\u2015]/g, '-').replace(/\s+/g, ' ').trim();
const NARRATION_IN_SPEECH = /\b(she|he|they)\s+(said|says|whispered|murmured|replied|asked|smiled|leaned|added|nodded|shrugged|laughed|adjusted|nudged)\b|,\s*and\s+(whispered|murmured|said|added|replied)\b|\b(whispered|murmured)\b/i;

/** A question may only quote words that really are in the scene (otherwise it asks about something the student never read). */
function unsupportedQuote(stem, sceneText) {
  const quoted = [...stem.matchAll(/[\u201c"]([^\u201d"]{10,})[\u201d"]/g)].map((m) => norm(m[1]).replace(/[.?!,]+$/g, ''));
  return quoted.find((q) => !sceneText.includes(q)) || null;
}

function skillBlock(skills) {
  return skills.map((s, i) => `${i + 1}. ${s.title}${s.description ? ` (${s.description})` : ''}`).join('\n');
}

async function outline(course, plan, skills) {
  const prompt = `You are planning a graded reader for an English-learning app. ${CAST}

Story: "${plan.theme}". Level: ${plan.cefr}. ${plan.premise}
Target skills the story should naturally practise:\n${skillBlock(skills)}

Plan exactly ${plan.scenes} scenes that tell ONE clear story with a beginning, a small problem and a satisfying ending. All four friends should appear, and each scene needs a clear place.
Reply with ONLY a JSON object:
{"title":"short story title","title_ar":"Arabic title","summary":"one sentence for the story card","summary_ar":"Arabic summary","scenes":[{"setting":"place and time, 3-8 words","setting_ar":"Arabic","beat":"one sentence: what happens"}]}`;
  for (let i = 0; i < 3; i++) {
    const o = parseObject(await ai(prompt));
    if (o && o.title && o.summary && Array.isArray(o.scenes) && o.scenes.length >= plan.scenes - 0) {
      o.scenes = o.scenes.slice(0, plan.scenes);
      if (o.scenes.every((s) => s.setting && s.beat)) return o;
    }
  }
  throw new Error('outline failed');
}

async function writeScene(plan, skills, outlineObj, index, previous, seenStems) {
  const sc = outlineObj.scenes[index];
  const [minW, maxW] = plan.words;
  const prompt = `You write a graded reader for an English-learning app. ${CAST}

Story: "${outlineObj.title}" (${plan.cefr}). ${plan.premise}
Language level rules: ${plan.style} Everything must be understandable at this level or EASIER.
Full outline:\n${outlineObj.scenes.map((s, i) => `${i + 1}. ${s.setting}: ${s.beat}`).join('\n')}
${previous.length ? `What has happened so far (last scene, for continuity):\n${previous[previous.length - 1]}\n` : ''}
Now write scene ${index + 1} of ${plan.scenes}: ${sc.setting}. ${sc.beat}
- ${minW} to ${maxW} words in total across all lines.
- Use "lines": each line is one speaker: "narrator" (scene-setting or action, third person, one or two sentences) or one of "sarah", "adam", "yasmin", "tariq". A friend's line contains ONLY the words that friend says out loud: no "she said", no actions, no stage directions, no quotation marks around it. Put actions and descriptions in separate narrator lines. At least two friends speak. Never put a name or label inside the text.
- STORY FIRST: every line must be a natural, correct sentence a real person would say at this level. Never write isolated letters, sounds, word lists or fragments. Do not force every target skill into every scene; let them appear where they fit and repeat the useful patterns across the story.
- Keep each friend's personality and keep the plot moving; end the scene so the next one follows.
Then write exactly ${plan.qs} multiple-choice questions about THIS scene: ${plan.qs >= 3 ? 'one comprehension question (what happened / who said what), one language question, and one inference or detail question' : 'one comprehension question (what happened / who said what) and one language question'}.
- Language question: copy ONE sentence from the scene, replace ONE key word or phrase with "____", and ask which option completes it correctly. The options must all be grammatically possible words so only the target grammar or vocabulary decides it. Never ask "which phrase shows the pattern" or any question about grammar terminology the student has not met.
- Every question must be answerable from the scene text. Each has 3 or 4 short options, exactly one correct, and a one-sentence explanation. Do not reveal the answer in the question.
Tag every question with "skill": the number of the target skill it tests:\n${skillBlock(skills)}

Reply with ONLY a JSON object:
{"lines":[{"speaker":"narrator","text":"..."}],"questions":[{"stem":"...","options":["..."],"correctIndex":0,"explanation":"...","skill":1}]}`;
  let lastWhy = '';
  for (let attempt = 1; attempt <= 4; attempt++) {
    const o = parseObject(await ai(prompt + (lastWhy ? `\n\nYour previous attempt was rejected because: ${lastWhy}. Fix that.` : '')));
    if (!o || !Array.isArray(o.lines) || !Array.isArray(o.questions)) { lastWhy = 'it was not valid JSON in the required shape'; continue; }
    const lines = o.lines
      .map((l) => ({ speaker: String(l.speaker || '').toLowerCase(), text: String(l.text || '').trim() }))
      .filter((l) => SPEAKERS.includes(l.speaker) && l.text);
    if (lines.length < 4) { lastWhy = 'fewer than 4 valid lines'; continue; }
    if (new Set(lines.filter((l) => l.speaker !== 'narrator').map((l) => l.speaker)).size < 2) { lastWhy = 'fewer than two friends speak'; continue; }
    if (lines.some((l) => /^\s*(sarah|adam|yasmin|tariq|narrator)\s*:/i.test(l.text))) { lastWhy = 'a speaker name is written inside the text'; continue; }
    const badSpeech = lines.find((l) => l.speaker !== 'narrator' && (NARRATION_IN_SPEECH.test(l.text) || /^["\u201c\u2018]/.test(l.text)));
    if (badSpeech) { lastWhy = `a friend's line contains narration or quotation marks ("${badSpeech.text.slice(0, 60)}"): friends' lines must be only the spoken words`; continue; }
    const wc = wordCount(lines);
    if (wc < minW * 0.6 || wc > maxW * 1.5) { lastWhy = `it had ${wc} words but the scene must have ${minW} to ${maxW}`; continue; }
    const withSkill = o.questions.map((q, i) => ({ ...q, skill: Number.isInteger(q.skill) && q.skill >= 1 && q.skill <= skills.length ? q.skill : (i % skills.length) + 1 }));
    const valid = parseGeneratedQuestions(JSON.stringify(withSkill), seenStems);
    // parseGeneratedQuestions drops the skill field, so re-attach it by matching stems.
    const byStem = new Map(withSkill.map((q) => [String(q.stem).trim(), q.skill]));
    const questions = valid.slice(0, plan.qs).map((q) => ({ ...q, skill: byStem.get(q.stem) || 1 }));
    const sceneText = norm(lines.map((l) => l.text).join(' '));
    const bad = questions.map((q) => unsupportedQuote(q.stem, sceneText)).find(Boolean);
    if (bad) { lastWhy = `a question quotes words that are not in the scene ("${bad.slice(0, 60)}"): every question must be answerable from the scene text`; continue; }
    if (questions.length < plan.qs) { lastWhy = `only ${questions.length} of ${plan.qs} questions were valid (need distinct options, one correct answer, a unique stem)`; continue; }
    questions.forEach((q) => seenStems.add(q.stem.toLowerCase()));
    return { setting: sc.setting, setting_ar: sc.setting_ar || null, lines, questions, words: wc };
  }
  throw new Error(`scene ${index + 1} failed: ${lastWhy}`);
}

async function buildStory(course, skills) {
  const plan = PLAN[course.title];
  const o = await outline(course, plan, skills);
  const scenes = [];
  const seen = new Set();
  const previous = [];
  for (let i = 0; i < plan.scenes; i++) {
    const scene = await writeScene(plan, skills, o, i, previous, seen);
    scenes.push(scene);
    previous.push(scene.lines.map((l) => `${l.speaker}: ${l.text}`).join(' '));
    console.log(`  ${course.title}: scene ${i + 1}/${plan.scenes} (${scene.words} words)`);
  }
  return { course: course.title, plan, title: o.title, title_ar: o.title_ar || null, summary: o.summary, summary_ar: o.summary_ar || null, scenes };
}

async function save(db, courseId, skills, story) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query('SELECT id, status FROM stories WHERE course_id = $1', [courseId]);
    if (existing.rows[0]) {
      if (existing.rows[0].status === 'published') throw new Error('a PUBLISHED story already exists for this course; refusing to replace it');
      await client.query('DELETE FROM question_bank WHERE id IN (SELECT sq.question_id FROM story_scene_questions sq JOIN story_scenes sc ON sc.id = sq.scene_id WHERE sc.story_id = $1)', [existing.rows[0].id]);
      await client.query('DELETE FROM stories WHERE id = $1', [existing.rows[0].id]);
    }
    const st = await client.query(
      `INSERT INTO stories (course_id, title, title_ar, summary, summary_ar, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [courseId, story.title, story.title_ar, story.summary, story.summary_ar, PUBLISH ? 'published' : 'draft']);
    for (let i = 0; i < story.scenes.length; i++) {
      const sc = story.scenes[i];
      const sr = await client.query(
        `INSERT INTO story_scenes (story_id, position, setting, setting_ar, lines) VALUES ($1, $2, $3, $4, $5::jsonb) RETURNING id`,
        [st.rows[0].id, i, sc.setting, sc.setting_ar, JSON.stringify(sc.lines)]);
      for (let j = 0; j < sc.questions.length; j++) {
        const q = sc.questions[j];
        const qr = await client.query(
          `INSERT INTO question_bank (type, stem, difficulty, explanation, tags, status, created_by)
           VALUES ('multiple_choice', $1, $2, $3, ARRAY['story', 'story-only', 'ai-generated'], 'draft', $4) RETURNING id`,
          [q.stem, story.plan.level, q.explanation || null, SYSTEM_USER]);
        const order = q.options.map((_, k) => k).sort(() => Math.random() - 0.5);
        for (let pos = 0; pos < order.length; pos++) {
          await client.query(`INSERT INTO question_choices (question_id, text, is_correct, sort_order) VALUES ($1, $2, $3, $4)`,
            [qr.rows[0].id, q.options[order[pos]], order[pos] === q.correctIndex, pos]);
        }
        await client.query(`INSERT INTO question_skills (question_id, skill_id, is_primary) VALUES ($1, $2, true)`, [qr.rows[0].id, skills[q.skill - 1].id]);
        await client.query(`INSERT INTO story_scene_questions (scene_id, question_id, position) VALUES ($1, $2, $3)`, [sr.rows[0].id, qr.rows[0].id, j]);
      }
    }
    await client.query('COMMIT');
    return st.rows[0].id;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function main() {
  const db = pool();
  const courses = (await db.query(`SELECT id, title FROM courses WHERE status = 'published' ORDER BY sort_order, title`)).rows
    .filter((c) => PLAN[c.title] && (ONLY.length === 0 || ONLY.includes(c.title)));
  if (DRY) fs.mkdirSync(OUT, { recursive: true });
  const todo = [];
  for (const c of courses) {
    if (!DRY) {
      const ex = await db.query('SELECT status FROM stories WHERE course_id = $1', [c.id]);
      if (ex.rows[0] && !FORCE) { console.log(`skip ${c.title}: story exists (${ex.rows[0].status})`); continue; }
    }
    const skills = (await db.query(
      `SELECT DISTINCT s.id, s.key, s.title, s.description
         FROM levels lv JOIN chapters ch ON ch.level_id = lv.id JOIN lessons l ON l.chapter_id = ch.id AND l.status = 'published'
         JOIN lesson_skills ls ON ls.lesson_id = l.id JOIN skills s ON s.id = ls.skill_id
        WHERE lv.course_id = $1 ORDER BY s.key LIMIT 8`, [c.id])).rows;
    if (skills.length === 0) { console.log(`skip ${c.title}: no skills`); continue; }
    todo.push({ course: c, skills });
  }
  console.log(`writing ${todo.length} stor${todo.length === 1 ? 'y' : 'ies'}${DRY ? ' (dry run)' : ''}`);
  const failures = [];
  let next = 0;
  async function worker() {
    while (next < todo.length) {
      const { course, skills } = todo[next++];
      try {
        console.log(`start ${course.title}`);
        const story = await buildStory(course, skills);
        if (DRY) fs.writeFileSync(path.join(OUT, `${course.title.replace(/[^\w+.-]/g, '_')}.json`), JSON.stringify({ ...story, skills: skills.map((s) => s.title) }, null, 2));
        else { const id = await save(db, course.id, skills, story); console.log(`saved ${course.title} -> story ${id} (${PUBLISH ? 'published' : 'draft'})`); }
      } catch (e) {
        console.error(`FAILED ${course.title}: ${e.message}`);
        failures.push(course.title);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, CONCURRENCY) }, worker));
  await db.end();
  console.log(failures.length ? `done with ${failures.length} failure(s): ${failures.join(', ')}` : 'done');
  process.exit(failures.length ? 2 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
