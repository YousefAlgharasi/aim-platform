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
