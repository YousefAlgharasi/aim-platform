#!/usr/bin/env node
/**
 * QA: reports which Arabic (locale 'ar') fields exist/are missing for each of the 12 Starter lessons.
 * READ-ONLY. Exits 1 if anything is missing (or the course doesn't have 12 lessons), 0 otherwise.
 *
 * Checks per lesson: ar title, ar description, ar explanation (overview + each section heading/body, and each
 * example text/note, keyPoints, commonMistakes, recap mirroring the English explanation when one exists), and
 * for EACH lesson asset content.assets[<assetId>].title (+ description when the English asset has one).
 *
 * Usage: node scripts/qa-starter-bilingual-check.js [--json]
 *   DATABASE_URL (default postgres://supabase_admin:testpass@127.0.0.1:54330/aimtest2)
 *   COURSE_ID    (default c2f2a93b-b4bb-4786-a381-c4e97932af08)
 */
const { Pool } = require('pg');

const COURSE_ID = process.env.COURSE_ID || 'c2f2a93b-b4bb-4786-a381-c4e97932af08';
const URL = process.env.DATABASE_URL || 'postgres://supabase_admin:testpass@127.0.0.1:54330/aimtest2';
const AS_JSON = process.argv.includes('--json');
const has = (s) => typeof s === 'string' && s.trim().length > 0;

function checkExplanation(ar, en) {
  const miss = [];
  if (!ar || typeof ar !== 'object') return ['explanation (entire)'];
  if (!has(ar.overview)) miss.push('explanation.overview');
  const ars = Array.isArray(ar.sections) ? ar.sections : [];
  const ens = en && Array.isArray(en.sections) ? en.sections : null;
  if (ars.length === 0) miss.push('explanation.sections (none)');
  if (ens && ars.length !== ens.length) miss.push(`explanation.sections count ${ars.length} != en ${ens.length}`);
  const n = ens ? ens.length : ars.length;
  for (let i = 0; i < n; i++) {
    const s = ars[i] || {};
    if (!has(s.heading)) miss.push(`explanation.sections[${i}].heading`);
    if (!has(s.body)) miss.push(`explanation.sections[${i}].body`);
    const ee = ens && ens[i] && ens[i].examples;
    if (ee) ee.forEach((ex, j) => {
      const a = s.examples && s.examples[j];
      if (!a || !has(a.text)) miss.push(`explanation.sections[${i}].examples[${j}].text`);
      if (ex.note && (!a || !has(a.note))) miss.push(`explanation.sections[${i}].examples[${j}].note`);
    });
  }
  if (en) {
    (en.keyPoints || []).forEach((_, i) => { if (!has((ar.keyPoints || [])[i])) miss.push(`explanation.keyPoints[${i}]`); });
    (en.commonMistakes || []).forEach((m, i) => {
      const a = (ar.commonMistakes || [])[i] || {};
      for (const k of ['wrong', 'right', 'why']) if (m[k] && !has(a[k])) miss.push(`explanation.commonMistakes[${i}].${k}`);
    });
    if (has(en.recap) && !has(ar.recap)) miss.push('explanation.recap');
  }
  return miss;
}

(async () => {
  const pool = new Pool({ connectionString: URL });
  try {
    const { rows: lessons } = await pool.query(
      `SELECT l.id, l.title, l.explanation, l.status, lv.sort_order AS lvl, ch.sort_order AS ch, l.sort_order AS ord
         FROM lessons l JOIN chapters ch ON ch.id = l.chapter_id JOIN levels lv ON lv.id = ch.level_id
        WHERE lv.course_id = $1 ORDER BY lv.sort_order, ch.sort_order, l.sort_order`, [COURSE_ID]);
    const report = [];
    for (const l of lessons) {
      const { rows: [tr] } = await pool.query(
        `SELECT title, description, content FROM lesson_translations WHERE lesson_id = $1 AND locale = 'ar'`, [l.id]);
      const { rows: assets } = await pool.query(
        `SELECT id, title, description, "order" FROM lesson_assets WHERE lesson_id = $1 AND status <> 'archived' ORDER BY "order"`, [l.id]);
      const missing = [];
      if (!tr) missing.push('ar translation row (all)');
      else {
        if (!has(tr.title)) missing.push('title');
        if (!has(tr.description)) missing.push('description');
        const c = tr.content && typeof tr.content === 'object' ? tr.content : null;
        if (!c) missing.push('content (explanation + assets)');
        else {
          missing.push(...checkExplanation(c.explanation, l.explanation));
          for (const a of assets) {
            const t = c.assets && c.assets[a.id];
            if (!t || !has(t.title)) missing.push(`asset ${a.order} (${a.id}) title`);
            if (a.description && (!t || !has(t.description))) missing.push(`asset ${a.order} (${a.id}) description`);
          }
        }
      }
      report.push({ lessonId: l.id, title: l.title, position: `${l.lvl}.${l.ch}.${l.ord}`, assets: assets.length, enExplanation: !!l.explanation, missing });
    }
    const bad = report.filter((r) => r.missing.length);
    const structural = lessons.length !== 12 ? [`expected 12 lessons, found ${lessons.length}`] : [];
    if (AS_JSON) console.log(JSON.stringify({ courseId: COURSE_ID, lessons: report, structural }, null, 2));
    else {
      console.log(`Starter course ${COURSE_ID}: ${lessons.length} lessons`);
      for (const r of report) {
        console.log(`${r.missing.length ? 'MISSING' : 'OK     '} [${r.position}] ${r.title} (${r.lessonId}) assets=${r.assets} enExplanation=${r.enExplanation}`);
        for (const m of r.missing) console.log(`           - ${m}`);
      }
      structural.forEach((s) => console.log(`STRUCTURAL: ${s}`));
      console.log(`\nSummary: ${report.length - bad.length}/${report.length} lessons complete, ${bad.length} incomplete, ${report.reduce((n, r) => n + r.missing.length, 0)} missing items`);
    }
    process.exitCode = bad.length || structural.length ? 1 : 0;
  } finally {
    await pool.end();
  }
})().catch((e) => { console.error('qa script error:', e.message); process.exit(2); });
