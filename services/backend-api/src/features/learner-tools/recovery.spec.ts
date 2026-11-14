import { groupForDomain, parseGeneratedQuestions, retryWindow, RECOVERY_COOLDOWN_DAYS } from './recovery.service';

const DAY = 24 * 60 * 60 * 1000;

describe('retryWindow', () => {
  const now = new Date('2026-11-13T12:00:00Z');
  it('is open when there is no mistake to wait on', () => {
    expect(retryWindow(null, now)).toEqual({ retryAvailableAt: null, unlocked: true });
  });
  it('locks for 3 days after the latest mistake', () => {
    const w = retryWindow(new Date(now.getTime() - 1 * DAY), now);
    expect(w.unlocked).toBe(false);
    expect(w.retryAvailableAt?.getTime()).toBe(now.getTime() - DAY + RECOVERY_COOLDOWN_DAYS * DAY);
  });
  it('unlocks exactly when the 3 days are over', () => {
    expect(retryWindow(new Date(now.getTime() - 3 * DAY), now).unlocked).toBe(true);
    expect(retryWindow(new Date(now.getTime() - 3 * DAY + 1), now).unlocked).toBe(false);
  });
});

describe('groupForDomain', () => {
  it('folds pronunciation and functional language into speaking', () => {
    expect(groupForDomain('pronunciation')).toBe('speaking');
    expect(groupForDomain('functional_language')).toBe('speaking');
    expect(groupForDomain('grammar')).toBe('grammar');
  });
});

describe('parseGeneratedQuestions', () => {
  const good = { stem: 'She ___ to school every day.', options: ['go', 'goes', 'going'], correctIndex: 1, explanation: 'Third person adds -s.' };
  it('accepts a valid question, even inside stray text', () => {
    expect(parseGeneratedQuestions(`Here you go:\n${JSON.stringify([good])}`, new Set())).toHaveLength(1);
  });
  it('rejects bad shapes: no correct index, duplicate options, one option, out of range', () => {
    const bad = [
      { ...good, correctIndex: 5 }, { ...good, correctIndex: -1 }, { ...good, options: ['go', 'Go', 'going'] },
      { ...good, options: ['go'] }, { ...good, stem: 'short' }, { ...good, options: ['a', '', 'c'] },
    ];
    expect(parseGeneratedQuestions(JSON.stringify(bad), new Set())).toHaveLength(0);
  });
  it('drops questions the student can already see in the bank, and duplicates in the reply', () => {
    expect(parseGeneratedQuestions(JSON.stringify([good]), new Set([good.stem.toLowerCase()]))).toHaveLength(0);
    expect(parseGeneratedQuestions(JSON.stringify([good, good]), new Set())).toHaveLength(1);
  });
  it('never throws on garbage', () => {
    expect(parseGeneratedQuestions('not json', new Set())).toEqual([]);
    expect(parseGeneratedQuestions('[{', new Set())).toEqual([]);
    expect(parseGeneratedQuestions('', new Set())).toEqual([]);
  });
});

import { nudgeText, readySkills } from './recovery-nudge.service';
import type { RecoverySkill } from './recovery.service';

const sk = (o: Partial<RecoverySkill>): RecoverySkill => ({
  skillKey: 'k', title: 'Comparatives', group: 'grammar', masteryScore: 0.3, openMistakes: 2,
  lastMistakeAt: null, retryAvailableAt: null, unlocked: true, ...o,
});

describe('readySkills', () => {
  it('keeps only unlocked skills that still have unfixed mistakes, weakest first', () => {
    const out = readySkills([
      sk({ skillKey: 'locked', unlocked: false }),
      sk({ skillKey: 'no-mistakes', openMistakes: 0 }),
      sk({ skillKey: 'ok', masteryScore: 0.4 }),
      sk({ skillKey: 'weaker', masteryScore: 0.1 }),
    ]);
    expect(out.map((s) => s.skillKey)).toEqual(['weaker', 'ok']);
  });
  it('is empty when nothing is ready, so nobody is nudged', () => {
    expect(readySkills([sk({ unlocked: false }), sk({ openMistakes: 0 })])).toEqual([]);
  });
});

describe('nudgeText', () => {
  it('names the weakest skill and counts the rest, in both languages', () => {
    const ready = [sk({ title: 'Articles', group: 'grammar' }), sk({}), sk({})];
    expect(nudgeText(ready, 'en')).toEqual({ group: 'Grammar', skill: 'Articles', extra: ' (+2 more)' });
    expect(nudgeText(ready, 'ar').group).toBe('القواعد');
    expect(nudgeText(ready, 'ar').extra).toContain('2');
  });
  it('adds nothing extra for a single skill', () => {
    expect(nudgeText([sk({ group: 'speaking' })], 'en').extra).toBe('');
  });
});

import { parseGeneratedSet, skillLevelRank } from './skill-practice.service';

describe('skillLevelRank', () => {
  it('reads the level tag from the skill key', () => {
    expect(skillLevelRank('en.a1.gra.articles_a_an')).toBe(0);
    expect(skillLevelRank('en.a2.read.short_paragraphs')).toBe(1);
    expect(skillLevelRank('en.a3.gra.present_perfect')).toBe(2);
    expect(skillLevelRank('en.b2.gra.third_conditional')).toBe(3);
    expect(skillLevelRank('en.c2.lis.extended_natural_pace')).toBe(4);
  });
  it('treats keys without a tag as available from the start', () => {
    expect(skillLevelRank('grammar.past_simple.forms')).toBe(0);
  });
});

describe('parseGeneratedSet', () => {
  const q = { stem: 'Where does Sam work?', options: ['A bank', 'A school', 'A shop'], correctIndex: 1, explanation: 'He teaches.' };
  const passage = 'Sam works at a school near his house. He teaches young children every morning and walks home at noon.';
  it('accepts a passage with questions, even inside stray text', () => {
    const out = parseGeneratedSet(`Sure!\n${JSON.stringify({ passage, questions: [q, { ...q, stem: 'When does Sam walk home?' }] })}`, 'passage', new Set());
    expect(out?.text).toBe(passage);
    expect(out?.questions).toHaveLength(2);
  });
  it('uses the script key for listening', () => {
    expect(parseGeneratedSet(JSON.stringify({ script: passage, questions: [q, { ...q, stem: 'What does Sam do?' }] }), 'script', new Set())).not.toBeNull();
    expect(parseGeneratedSet(JSON.stringify({ passage, questions: [q, { ...q, stem: 'What does Sam do?' }] }), 'script', new Set())).toBeNull();
  });
  it('rejects a too-short passage or fewer than two valid questions', () => {
    expect(parseGeneratedSet(JSON.stringify({ passage: 'Too short.', questions: [q, q] }), 'passage', new Set())).toBeNull();
    expect(parseGeneratedSet(JSON.stringify({ passage, questions: [q] }), 'passage', new Set())).toBeNull();
  });
  it('never throws on garbage', () => {
    expect(parseGeneratedSet('nope', 'passage', new Set())).toBeNull();
    expect(parseGeneratedSet('{"passage":', 'passage', new Set())).toBeNull();
  });
});

import { cleanLines, estimateMinutes } from './stories.service';

describe('cleanLines', () => {
  it('keeps known speakers with text and drops everything else', () => {
    expect(cleanLines([
      { speaker: 'Sarah', text: ' Hello! ' },
      { speaker: 'narrator', text: 'The bell rang.' },
      { speaker: 'teacher', text: 'Not a cast member' },
      { speaker: 'adam', text: '   ' },
      { speaker: 'yasmin' },
      null,
    ])).toEqual([{ speaker: 'sarah', text: 'Hello!' }, { speaker: 'narrator', text: 'The bell rang.' }]);
  });
  it('never throws on a bad value', () => {
    expect(cleanLines(null)).toEqual([]);
    expect(cleanLines('x')).toEqual([]);
  });
});

describe('estimateMinutes', () => {
  it('grows with the story and is never below one minute', () => {
    expect(estimateMinutes(0, 0)).toBe(1);
    expect(estimateMinutes(120, 0)).toBe(1);
    expect(estimateMinutes(2000, 30)).toBeGreaterThan(estimateMinutes(200, 8));
  });
});

import { partRanges } from './stories.service';

describe('partRanges (story scenes over chapters)', () => {
  it('spreads scenes evenly and in order', () => {
    expect(partRanges(6, 4).map((r) => r.to - r.from)).toEqual([1, 2, 1, 2]);
    expect(partRanges(4, 4).map((r) => r.to - r.from)).toEqual([1, 1, 1, 1]);
    expect(partRanges(11, 4).map((r) => r.to - r.from)).toEqual([2, 3, 3, 3]);
  });
  it('covers every scene exactly once', () => {
    for (const [s, c] of [[5, 5], [8, 4], [9, 5], [10, 4], [11, 4]]) {
      const r = partRanges(s, c);
      expect(r[0].from).toBe(0);
      expect(r[r.length - 1].to).toBe(s);
      r.slice(1).forEach((x, i) => expect(x.from).toBe(r[i].to));
    }
  });
  it('skips chapters that would get no scene, and handles no chapters', () => {
    expect(partRanges(2, 4)).toHaveLength(2);
    expect(partRanges(5, 0)).toEqual([{ chapterIndex: -1, from: 0, to: 5 }]);
    expect(partRanges(0, 4)).toEqual([]);
  });
});

import { difficultyForCourseRank, validateStoryInput } from './admin-stories.validation';

const goodScene = () => ({
  setting: 'At school, morning',
  lines: [{ speaker: 'narrator', text: 'The bell rang.' }, { speaker: 'sarah', text: 'Hello, Adam!' }],
  questions: [{ stem: 'Who said hello?', explanation: 'Sarah did.', options: [{ text: 'Sarah', correct: true }, { text: 'Adam', correct: false }] }],
});
const goodStory = (over: Record<string, unknown> = {}) => ({ title: 'The First Day', summary: 'Four friends meet.', status: 'draft', scenes: [goodScene()], ...over });

describe('validateStoryInput (admin)', () => {
  it('accepts a complete story and trims it', () => {
    const r = validateStoryInput(goodStory({ title: '  The First Day  ', titleAr: '' }));
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.value.title).toBe('The First Day'); expect(r.value.titleAr).toBeNull(); expect(r.value.scenes[0].lines[1].speaker).toBe('sarah'); }
  });
  it('reports every problem at once, in plain words', () => {
    const r = validateStoryInput({ title: '', summary: '', status: 'nope', scenes: [{ setting: '', lines: [{ speaker: 'teacher', text: '' }], questions: [{ stem: 'x', options: [{ text: 'a', correct: true }, { text: 'a', correct: true }] }] }] });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      const all = r.errors.join(' | ');
      expect(all).toMatch(/needs a title/); expect(all).toMatch(/summary/); expect(all).toMatch(/Status must be/);
      expect(all).toMatch(/Scene 1 needs a place/); expect(all).toMatch(/pick narrator, Sarah, Adam, Yasmin or Tariq/); expect(all).toMatch(/line 1 is empty/);
      expect(all).toMatch(/write the question/); expect(all).toMatch(/two answers are the same/); expect(all).toMatch(/exactly one correct/);
    }
  });
  it('needs one correct answer and 2-4 answers per question', () => {
    const bad = (options: unknown[]) => validateStoryInput(goodStory({ scenes: [{ ...goodScene(), questions: [{ stem: 'Who said hello?', options }] }] }));
    expect(bad([{ text: 'a', correct: false }, { text: 'b', correct: false }]).ok).toBe(false);
    expect(bad([{ text: 'a', correct: true }]).ok).toBe(false);
    expect(bad([1, 2, 3, 4, 5].map((n) => ({ text: `o${n}`, correct: n === 1 }))).ok).toBe(false);
    expect(bad([{ text: 'a', correct: true }, { text: 'b', correct: false }, { text: 'c', correct: false }]).ok).toBe(true);
  });
  it('a published story needs a question in every scene, a draft does not', () => {
    const noQ = { ...goodScene(), questions: [] };
    expect(validateStoryInput(goodStory({ status: 'published', scenes: [noQ] })).ok).toBe(false);
    expect(validateStoryInput(goodStory({ status: 'draft', scenes: [noQ] })).ok).toBe(true);
  });
  it('needs at least one scene and ignores bad ids', () => {
    expect(validateStoryInput(goodStory({ scenes: [] })).ok).toBe(false);
    const r = validateStoryInput(goodStory({ scenes: [{ ...goodScene(), id: 'not-a-uuid' }] }));
    expect(r.ok && r.value.scenes[0].id).toBeUndefined();
    expect(validateStoryInput(null).ok).toBe(false);
  });
});

describe('difficultyForCourseRank', () => {
  it('climbs with the course ladder', () => {
    expect([1, 4, 5, 8, 12, 17].map(difficultyForCourseRank)).toEqual(['beginner', 'beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced']);
    expect(difficultyForCourseRank(null)).toBe('beginner');
  });
});
