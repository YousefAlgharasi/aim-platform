#!/usr/bin/env node
/*
 * Builds apply.sql from content/<lessonId>.ar.json for the Starter course.
 * NOT to be run against production without approval. This script only reads files (and, with
 * --verify-db, the dev DB) and writes apply.sql; it never connects to a database to write.
 *
 *   node generate.js                    validate + write apply.sql
 *   node generate.js --check            validate only
 *   node generate.js --require-complete fail unless all Starter lessons have a content file
 *   node generate.js --verify-db        also check lesson/asset/question ids exist in the dev DB
 *                                       (docker exec aim-lessons-test-pg; override with SEED_DB_CONTAINER)
 *   node generate.js --source <file>    English source JSON (default source/starter-en.json)
 *
 * English source = backup-derived snapshot of the published Starter course (lessons, explanation,
 * assets, questions, choices). Every parity rule fails loudly (exit 1, nothing written).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DIR = __dirname;
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const SOURCE = opt('--source', path.join(DIR, 'source', 'starter-en.json'));
const CONTENT_DIR = path.join(DIR, 'content');
const OUT = path.join(DIR, 'apply.sql');
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const errors = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isStr = (v) => typeof v === 'string' && v.trim().length > 0;

function loadSource() {
  const src = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
  const lessons = new Map();
  for (const ch of src.chapters) for (const l of ch.lessons) lessons.set(l.id, l);
  return lessons;
}

function checkExplanation(f, ar, en) {
  if (en == null) {
    if (ar !== undefined && ar !== null) err(f, 'explanation given but the English lesson has none');
    return;
  }
  if (!isObj(ar)) return err(f, 'explanation is required and must be an object');
  if (!isStr(ar.overview)) err(f, 'explanation.overview must be a non-empty string');
  const parity = (a, b, label) => {
    if (!Array.isArray(a) || a.length !== (b || []).length) {
      err(f, `${label}: expected array of length ${(b || []).length}, got ${Array.isArray(a) ? a.length : typeof a}`);
      return false;
    }
    return true;
  };
  if (parity(ar.sections, en.sections, 'explanation.sections')) {
    ar.sections.forEach((s, i) => {
      const e = en.sections[i];
      const p = `explanation.sections[${i}]`;
      if (!isObj(s) || !isStr(s.heading) || !isStr(s.body)) return err(f, `${p} needs non-empty heading and body`);
      const enEx = e.examples || [];
      if ((s.examples || []).length !== enEx.length) {
        return err(f, `${p}.examples: expected length ${enEx.length}, got ${(s.examples || []).length}`);
      }
      enEx.forEach((x, j) => {
        const a = s.examples[j];
        if (!isObj(a) || a.text !== x.text) err(f, `${p}.examples[${j}].text must equal English verbatim (${JSON.stringify(x.text)})`);
        if (x.note && !isStr(a && a.note)) err(f, `${p}.examples[${j}].note is required (English has one)`);
      });
    });
  }
  if (parity(ar.keyPoints, en.keyPoints, 'explanation.keyPoints')) {
    ar.keyPoints.forEach((k, i) => isStr(k) || err(f, `explanation.keyPoints[${i}] must be non-empty`));
  }
  if (parity(ar.commonMistakes, en.commonMistakes, 'explanation.commonMistakes')) {
    ar.commonMistakes.forEach((m, i) => {
      const e = en.commonMistakes[i];
      const p = `explanation.commonMistakes[${i}]`;
      if (!isObj(m)) return err(f, `${p} must be an object`);
      if (m.wrong !== e.wrong) err(f, `${p}.wrong must equal English verbatim`);
      if (m.right !== e.right) err(f, `${p}.right must equal English verbatim`);
      if (!isStr(m.why)) err(f, `${p}.why must be non-empty`);
    });
  }
  if (Boolean(en.recap) !== Boolean(ar.recap)) err(f, 'explanation.recap must be present iff English has one');
  const allowed = ['overview', 'sections', 'keyPoints', 'commonMistakes', 'recap'];
  for (const k of Object.keys(ar)) if (!allowed.includes(k)) err(f, `explanation: unknown field "${k}"`);
}

function checkAssets(f, ar, en) {
  if (ar === undefined) return;
  if (!isObj(ar)) return err(f, 'assets must be an object');
  const ids = new Set(en.assets.map((a) => a.id));
  for (const [id, v] of Object.entries(ar)) {
    if (!ids.has(id)) err(f, `assets.${id}: not an asset of this lesson`);
    if (!isObj(v)) { err(f, `assets.${id} must be an object`); continue; }
    for (const k of Object.keys(v)) if (!['title', 'description'].includes(k)) err(f, `assets.${id}: unknown field "${k}"`);
    for (const k of ['title', 'description']) if (v[k] !== undefined && !isStr(v[k])) err(f, `assets.${id}.${k} must be a non-empty string`);
  }
}

function checkQuestions(f, ar, en) {
  if (ar === undefined) return;
  if (!isObj(ar)) return err(f, 'questions must be an object');
  const byId = new Map(en.questions.map((q) => [q.id, q]));
  for (const [qid, v] of Object.entries(ar)) {
    const q = byId.get(qid);
    const p = `questions.${qid}`;
    if (!q) { err(f, `${p}: not a question of this lesson`); continue; }
    if (!isObj(v)) { err(f, `${p} must be an object`); continue; }
    for (const k of Object.keys(v)) if (!['stem', 'explanation', 'hint', 'choices'].includes(k)) err(f, `${p}: unknown field "${k}"`);
    if (!isStr(v.stem)) err(f, `${p}.stem must be non-empty`);
    if (q.explanation && !isStr(v.explanation)) err(f, `${p}.explanation is required (English has one)`);
    if (v.explanation !== undefined && !isStr(v.explanation)) err(f, `${p}.explanation must be non-empty`);
    if (v.hint !== undefined && !(q.hint && isStr(v.hint))) err(f, `${p}.hint only allowed (and non-empty) when English has a hint`);
    const enChoices = q.choices || [];
    const arChoices = v.choices === undefined ? {} : v.choices;
    if (!isObj(arChoices)) { err(f, `${p}.choices must be an object`); continue; }
    if (q.type === 'true_false' && Object.keys(arChoices).length) err(f, `${p}: true/false labels are never translated`);
    const enIds = new Set(enChoices.map((c) => c.id));
    for (const [cid, text] of Object.entries(arChoices)) {
      if (!enIds.has(cid)) err(f, `${p}.choices.${cid}: not a choice of this question`);
      else if (!isStr(text)) err(f, `${p}.choices.${cid} must be a non-empty string`);
    }
    if (q.type === 'multiple_choice' && enChoices.length) {
      for (const c of enChoices) if (!(c.id in arChoices)) err(f, `${p}.choices: missing translation for choice ${c.id}`);
    }
  }
}

function verifyDb(lessons, files) {
  const container = process.env.SEED_DB_CONTAINER || 'aim-lessons-test-pg';
  const q = (sql) =>
    execFileSync('docker', ['exec', container, 'psql', '-U', 'supabase_admin', 'aimtest2', '-At', '-c', sql]).toString().trim();
  const lessonIds = [...lessons.keys()];
  const list = (a) => `'${a.join("','")}'`;
  const n = Number(q(`select count(*) from lessons where id in (${list(lessonIds)})`));
  if (n !== lessonIds.length) errors.push(`db: only ${n}/${lessonIds.length} Starter lessons exist`);
  const assetIds = [].concat(...files.map((id) => lessons.get(id).assets.map((a) => a.id)));
  if (assetIds.length) {
    const m = Number(q(`select count(*) from lesson_assets where id in (${list(assetIds)})`));
    if (m !== assetIds.length) errors.push(`db: only ${m}/${assetIds.length} Starter assets exist`);
  }
  const qids = [].concat(...files.map((id) => lessons.get(id).questions.map((x) => x.id)));
  if (qids.length) {
    const k = Number(q(`select count(*) from question_bank where id in (${list(qids)})`));
    if (k !== qids.length) console.warn(`db note: only ${k}/${qids.length} Starter questions exist in this DB (question updates will be no-ops here)`);
  }
}

function dq(value) {
  // Dollar-quote with a tag that cannot occur in the value.
  let tag = 'aimseed';
  while (value.includes(`$${tag}$`)) tag += 'x';
  return `$${tag}$${value}$${tag}$`;
}
const lit = (s) => dq(String(s));
const json = (o) => `${dq(JSON.stringify(o))}::jsonb`;

function main() {
  const lessons = loadSource();
  const files = fs.existsSync(CONTENT_DIR) ? fs.readdirSync(CONTENT_DIR).filter((n) => n.endsWith('.ar.json')).sort() : [];
  const stmts = [];
  const seen = [];

  for (const name of files) {
    const f = name;
    let doc;
    try { doc = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, name), 'utf8')); }
    catch (e) { err(f, `invalid JSON: ${e.message}`); continue; }
    const id = name.replace(/\.ar\.json$/, '');
    const en = lessons.get(id);
    if (!UUID.test(id) || !en) { err(f, 'file name must be <Starter lessonId>.ar.json'); continue; }
    if (doc.lessonId !== id) err(f, `lessonId ${doc.lessonId} does not match file name`);
    for (const k of Object.keys(doc)) if (!['lessonId', 'title', 'description', 'explanation', 'assets', 'questions'].includes(k)) err(f, `unknown top-level field "${k}"`);
    if (!isStr(doc.title)) err(f, 'title must be non-empty');
    if (!isStr(doc.description)) err(f, 'description must be non-empty');
    checkExplanation(f, doc.explanation, en.explanation);
    checkAssets(f, doc.assets, en);
    checkQuestions(f, doc.questions, en);
    seen.push(id);
    if (errors.length) continue;

    const content = {};
    if (doc.explanation) content.explanation = doc.explanation;
    if (doc.assets && Object.keys(doc.assets).length) content.assets = doc.assets;
    stmts.push(`-- lesson ${id}: ${en.title}`);
    // Existing ar title/description are never overwritten; they are only inserted when the row is missing.
    stmts.push(
      `INSERT INTO lesson_translations (lesson_id, locale, title, description, content)\n` +
        `VALUES ('${id}', 'ar', ${lit(doc.title)}, ${lit(doc.description)}, ${json(content)})\n` +
        `ON CONFLICT (lesson_id, locale) DO UPDATE SET content = EXCLUDED.content;`,
    );
    for (const [qid, v] of Object.entries(doc.questions || {})) {
      const t = { stem: v.stem };
      if (v.hint) t.hint = v.hint;
      if (v.explanation) t.explanation = v.explanation;
      stmts.push(
        `UPDATE question_bank SET translations = COALESCE(translations, '{}'::jsonb) || jsonb_build_object('ar', ${json(t)})\n` +
          ` WHERE id = '${qid}';`,
      );
      for (const [cid, text] of Object.entries(v.choices || {})) {
        stmts.push(
          `UPDATE question_choices SET translations = COALESCE(translations, '{}'::jsonb) || jsonb_build_object('ar', ${json({ text })})\n` +
            ` WHERE id = '${cid}' AND question_id = '${qid}';`,
        );
      }
    }
  }

  if (flag('--require-complete')) {
    for (const id of lessons.keys()) if (!seen.includes(id)) errors.push(`missing content file for lesson ${id} (${lessons.get(id).title})`);
  }
  if (flag('--verify-db')) verifyDb(lessons, seen);

  if (errors.length) {
    console.error(`FAILED: ${errors.length} problem(s)\n` + errors.map((e) => `  - ${e}`).join('\n'));
    process.exit(1);
  }
  console.log(`OK: ${seen.length}/${lessons.size} lesson files valid`);
  if (flag('--check')) return;

  const header =
    `-- Starter course Arabic seed (generated by generate.js; do not edit by hand).\n` +
    `-- NOT to be run in production without approval.\n` +
    `-- Requires migration 20261114130000_lesson_translation_content.\n` +
    `-- Idempotent: re-running yields the same rows. Existing 'ar' title/description are never overwritten.\n` +
    `-- Lessons covered: ${seen.length}\n`;
  const guard = seen.length
    ? `DO $$ BEGIN\n  IF (SELECT count(*) FROM lessons WHERE id IN (${seen.map((i) => `'${i}'`).join(', ')})) <> ${seen.length} THEN\n` +
      `    RAISE EXCEPTION 'starter-arabic: some Starter lessons are missing in this database';\n  END IF;\nEND $$;\n`
    : '';
  fs.writeFileSync(OUT, `${header}BEGIN;\n${guard}\n${stmts.join('\n')}\n\nCOMMIT;\n`);
  console.log(`wrote ${path.relative(process.cwd(), OUT)}`);
}

main();
