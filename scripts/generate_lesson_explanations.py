#!/usr/bin/env python3
"""Generate the student-facing `lessons.explanation` JSON for published lessons.

Usage: generate_lesson_explanations.py [--limit N] [--offset N] [--only-missing] [--lesson-id UUID] [--dry-run]
Reads AI_PROVIDER_* from /opt/aim/backend.env (never printed). Writes via psql in the supabase-db container.
Requires migration 20261110090000_add_lesson_explanation to be applied first.
"""
import argparse, json, os, re, subprocess, sys, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

ENV = {}
for line in open('/opt/aim/backend.env'):
    m = re.match(r'^(AI_PROVIDER_[A-Z_]+)=(.*)$', line.strip())
    if m:
        ENV[m.group(1)] = m.group(2).strip().strip('"\'')

PSQL = ['docker', 'exec', '-i', 'supabase-db', 'psql', '-U', 'postgres', '-d', 'postgres', '-At', '-v', 'ON_ERROR_STOP=1']


def psql(sql):
    r = subprocess.run(PSQL, input=sql, capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(r.stderr)
    return r.stdout


CONTEXT_SQL = """
select coalesce(json_agg(x), '[]'::json) from (
 select l.id, l.title, l.description, l.sort_order, ch.title as chapter, ch.description as chapter_description, lv.title as level,
  (select coalesce(json_agg(o.title || ' - ' || coalesce(o.description,'')), '[]'::json) from lesson_objectives lo join objectives o on o.id=lo.objective_id where lo.lesson_id=l.id) as objectives,
  (select coalesce(json_agg(s.title), '[]'::json) from lesson_skills ls join skills s on s.id=ls.skill_id where ls.lesson_id=l.id) as skills,
  (select coalesce(json_agg(a.type || ': ' || a.title || ' - ' || coalesce(a.description,'') order by a."order"), '[]'::json) from lesson_assets a where a.lesson_id=l.id and a.status='published') as assets
 from lessons l join chapters ch on ch.id=l.chapter_id join levels lv on lv.id=ch.level_id
 where l.status='published' %s
 order by lv.sort_order, ch.sort_order, l.sort_order %s
) x;
"""

SYSTEM = """You are an expert English teacher writing the written explanation that appears at the top of a lesson page in an English-learning app. Learners are adults whose first language is usually Arabic. Your explanation must actually TEACH the topic, not describe it.

Write in clear English at or slightly below the learner's CEFR level (the level code is given: Starter/A1 = very short, simple sentences and everyday words; B1+ = natural but clear). Never use grammar jargon without explaining it in plain words first.

Return ONLY a JSON object with this exact shape:
{
 "overview": "2-3 sentences: what this lesson is about, why it is useful in real life, what the learner will be able to do after it.",
 "sections": [ { "heading": "short heading", "body": "markdown explanation (2-5 short sentences, may use **bold** and short bullet lists)", "examples": [ {"text": "example sentence or phrase", "note": "very short explanation of why/what it shows"} ] } ],
 "keyPoints": ["4-6 short, memorable rules or takeaways"],
 "commonMistakes": [ {"wrong": "...", "right": "...", "why": "one short sentence"} ],
 "recap": "1-2 sentence summary telling the learner what to do next (practice)."
}
Rules:
- 3 to 5 sections, ordered from the core idea to using it. Each section has 2-4 concrete examples with real, natural sentences (for vocabulary lessons: the words with meaning in simple English; for listening/speaking/reading/writing lessons: explain the strategy step by step plus useful phrases/model sentences).
- 2-4 commonMistakes that learners at this level (especially Arabic speakers) genuinely make. For listening/reading lessons, mistakes can be strategy mistakes (use wrong/right as 'what many learners do' vs 'what works better').
- Stay strictly on this lesson's topic and objectives. Do not invent facts about the app. No emojis. No Arabic text.
- Plain text only (no * or ** markdown) in overview, examples, keyPoints, commonMistakes, recap. Only section bodies may use markdown; in bodies put every list item on its own line starting with '- ' or '1. ' (separated by \n).
- Be accurate: every example must be correct English."""


def build_user(c):
    return (f"Level: {c['level']}\nChapter: {c['chapter']} - {c.get('chapter_description') or ''}\nLesson title: {c['title']}\n"
            f"Lesson description: {c['description']}\nLearning objectives: {json.dumps(c['objectives'], ensure_ascii=False)}\n"
            f"Skills: {json.dumps(c['skills'], ensure_ascii=False)}\nExisting lesson steps: {json.dumps(c['assets'], ensure_ascii=False)}")


def plain(t):
    return re.sub(r'\*+', '', str(t)).strip()


def validate(d):
    assert isinstance(d.get('overview'), str) and len(d['overview']) > 40
    secs = d['sections']
    assert 3 <= len(secs) <= 6
    for s in secs:
        assert s['heading'] and len(s['body']) > 40
        s['examples'] = [{'text': str(e['text']), **({'note': str(e['note'])} if e.get('note') else {})}
                         for e in s.get('examples', []) if e.get('text')]
    assert 3 <= len(d['keyPoints']) <= 8
    d['commonMistakes'] = [m for m in d.get('commonMistakes', []) if m.get('wrong') and m.get('right') and m.get('why')]
    d['overview'] = plain(d['overview'])
    d['keyPoints'] = [plain(k) for k in d['keyPoints']]
    for s in secs:
        s['examples'] = [{k: plain(v) for k, v in e.items()} for e in s['examples']]
    d['commonMistakes'] = [{k: plain(v) for k, v in m.items()} for m in d['commonMistakes']]
    if d.get('recap'):
        d['recap'] = plain(d['recap'])
    return {k: d[k] for k in ('overview', 'sections', 'keyPoints', 'commonMistakes', 'recap') if k in d}


def call(c):
    body = json.dumps({'model': ENV['AI_PROVIDER_MODEL'], 'temperature': 0.5, 'max_tokens': 3500,
                       'response_format': {'type': 'json_object'},
                       'messages': [{'role': 'system', 'content': SYSTEM}, {'role': 'user', 'content': build_user(c)}]}).encode()
    for attempt in range(6):
        req = urllib.request.Request(ENV['AI_PROVIDER_BASE_URL'], body, {
            'Content-Type': 'application/json', 'Authorization': 'Bearer ' + ENV['AI_PROVIDER_API_KEY'],
            'User-Agent': 'aim-content-generator/1.0'})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                out = json.load(r)['choices'][0]['message']['content']
            return validate(json.loads(out))
        except urllib.error.HTTPError as e:
            time.sleep(15 * (attempt + 1) if e.code == 429 else 3)
        except Exception:
            time.sleep(3)
    raise RuntimeError('failed after retries')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--limit', type=int)
    ap.add_argument('--offset', type=int, default=0)
    ap.add_argument('--only-missing', action='store_true')
    ap.add_argument('--lesson-id')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--workers', type=int, default=3)
    a = ap.parse_args()
    where = ''
    if a.only_missing:
        where += ' and l.explanation is null'
    if a.lesson_id:
        where += f" and l.id='{a.lesson_id}'"
    tail = (f'limit {a.limit}' if a.limit else '') + (f' offset {a.offset}' if a.offset else '')
    lessons = json.loads(psql(CONTEXT_SQL % (where, tail)))
    print(f'{len(lessons)} lessons', file=sys.stderr)

    def work(c):
        try:
            exp = call(c)
        except Exception as e:
            print('FAIL', c['id'], c['title'], e, file=sys.stderr)
            return False
        if a.dry_run:
            print(json.dumps(exp, ensure_ascii=False, indent=1))
            return True
        tag = 'x' + os.urandom(4).hex()
        psql(f"update lessons set explanation = ${tag}${json.dumps(exp, ensure_ascii=False)}${tag}$::jsonb where id='{c['id']}';")
        print('ok', c['level'], c['title'], file=sys.stderr)
        return True

    with ThreadPoolExecutor(a.workers) as ex:
        res = list(ex.map(work, lessons))
    print(f'done {sum(res)}/{len(res)}', file=sys.stderr)


main()
