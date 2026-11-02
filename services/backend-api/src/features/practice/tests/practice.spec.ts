import { HttpStatus } from '@nestjs/common';
import { PromptBuilderService } from '../../ai-teacher/prompt-builder/prompt-builder.service';
import { ContextBuilderService } from '../../ai-teacher/context-builder/context-builder.service';
import { PracticeAccessService } from '../practice-access.service';
import { parseMarking } from '../practice-attempts.service';
import { buildPracticeContextRef, isPracticeContextRef, parsePracticeContextRef } from '../practice-context-ref';

const TOPIC = '11111111-1111-4111-8111-111111111111';
const ATTEMPT = '22222222-2222-4222-8222-222222222222';

describe('practice context ref', () => {
  it('round-trips and rejects anything that is not practice:<uuid>:<uuid>', () => {
    const ref = buildPracticeContextRef(TOPIC, ATTEMPT);
    expect(parsePracticeContextRef(ref)).toEqual({ topicId: TOPIC, attemptId: ATTEMPT });
    expect(isPracticeContextRef(ref)).toBe(true);
    expect(parsePracticeContextRef('lesson:' + TOPIC)).toBeNull();
    expect(parsePracticeContextRef(`practice:${TOPIC}`)).toBeNull();
    expect(parsePracticeContextRef(`practice:not-a-uuid:${ATTEMPT}`)).toBeNull();
  });
});

describe('parseMarking', () => {
  it('reads the JSON out of a chatty reply and clamps the score', () => {
    const out = parseMarking('Sure!\n{"score": 140, "summary": "Good job.", "corrections": [{"original":"I goed","correction":"I went","explanation":"Past tense"}]}\nBye');
    expect(out).toEqual({
      score: 100,
      summary: 'Good job.',
      corrections: [{ original: 'I goed', correction: 'I went', explanation: 'Past tense' }],
    });
  });

  it('drops malformed corrections and caps the list', () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ original: `a${i}`, correction: `b${i}`, explanation: 'x' }));
    const out = parseMarking(JSON.stringify({ score: 70.4, summary: 's', corrections: [{ nope: 1 }, ...many] }));
    expect(out?.score).toBe(70);
    expect(out?.corrections).toHaveLength(8);
  });

  it.each([null, '', 'no json here', '{"score":"abc","summary":"s"}', '{"score":50}', '{broken'])(
    'returns null for unusable reply %p', (reply) => {
      expect(parseMarking(reply)).toBeNull();
    },
  );
});

describe('PracticeAccessService', () => {
  const make = (enrollment: { course_id: string }[], hasAccess: boolean) => {
    const db = { query: jest.fn().mockResolvedValue({ rows: enrollment }) };
    const courseAccess = {
      resolveStudent: jest.fn().mockResolvedValue({ userId: 'u1', forms: ['u1'] }),
      getBilling: jest.fn().mockResolvedValue({ access: { hasAccess } }),
    };
    return { service: new PracticeAccessService(db as never, courseAccess as never), courseAccess };
  };

  it('blocks a student who has not started a course (402)', async () => {
    const { service, courseAccess } = make([], true);
    await expect(service.assertAccess('u1')).rejects.toMatchObject({ statusCode: HttpStatus.PAYMENT_REQUIRED });
    expect(courseAccess.getBilling).not.toHaveBeenCalled();
  });

  it('blocks a student whose access to the course ended or was never paid (402)', async () => {
    const { service } = make([{ course_id: 'c1' }], false);
    await expect(service.assertAccess('u1')).rejects.toMatchObject({ statusCode: HttpStatus.PAYMENT_REQUIRED });
  });

  it('lets a student with a started, accessible course through', async () => {
    const { service, courseAccess } = make([{ course_id: 'c1' }], true);
    await expect(service.assertAccess('u1')).resolves.toBeUndefined();
    expect(courseAccess.getBilling).toHaveBeenCalledWith('u1', 'c1');
  });
});

describe('speaking practice prompt + context', () => {
  const ctx = (extra: object) => ({
    studentId: 's', sessionId: 'x', studentProfile: null, currentLesson: null, curriculumSkill: null,
    focusDirective: null, difficultyDecision: null, emotionalState: null, ...extra,
  });

  it('uses the role-play instructions and includes the topic when practiceTopic is set', () => {
    const prompt = new PromptBuilderService().buildPrompt({
      studentMessage: 'Hi', context: ctx({ practiceTopic: { topic: 'At the doctor', rolePrompt: 'You are Dr. Lee' } }),
    });
    expect(prompt.systemInstructions).toContain('conversation partner');
    expect(prompt.systemInstructions).not.toContain('LESSON_COMPLETE');
    expect(prompt.sections.map((s) => s.key)).toContain('practiceTopic');
    expect(prompt.sections.find((s) => s.key === 'practiceTopic')?.content).toContain('You are Dr. Lee');
  });

  it('keeps the lesson instructions when there is no practiceTopic', () => {
    const prompt = new PromptBuilderService().buildPrompt({ studentMessage: 'Hi', context: ctx({}) });
    expect(prompt.systemInstructions).not.toContain('conversation partner');
  });

  it('builds only profile + topic context for a practice contextRef (no lesson/skill/focus lookups)', async () => {
    const lesson = jest.fn();
    const adapters = {
      profile: { getProfileContext: jest.fn().mockResolvedValue({ preferredLanguage: 'ar' }) },
      lesson: { getCurrentLessonContext: lesson },
      skill: { getSkillContext: jest.fn() },
      focus: { getFocusDirectiveContext: jest.fn() },
      difficulty: { getDifficultyDecisionContext: jest.fn() },
      emotional: { getEmotionalStateContext: jest.fn() },
      snapshot: {},
      practice: { getContext: jest.fn().mockResolvedValue({ topic: 'T', rolePrompt: 'R', timeLimitSeconds: 180 }) },
    };
    const builder = new ContextBuilderService(
      adapters.profile as never, adapters.lesson as never, adapters.skill as never, adapters.focus as never,
      adapters.difficulty as never, adapters.emotional as never, adapters.snapshot as never, adapters.practice as never,
    );
    const out = await builder.buildContext({ studentId: 's', sessionId: 'x', contextRef: buildPracticeContextRef(TOPIC, ATTEMPT) });
    expect(out.practiceTopic).toEqual({ topic: 'T', rolePrompt: 'R', timeLimitSeconds: 180 });
    expect(out.currentLesson).toBeNull();
    expect(lesson).not.toHaveBeenCalled();
    expect(adapters.skill.getSkillContext).not.toHaveBeenCalled();
  });
});

describe('LOOSE_UUID (seeded topic ids)', () => {
  it('accepts seeded readable ids and real uuids, rejects junk', async () => {
    const { LOOSE_UUID } = await import('../practice.dtos');
    expect(LOOSE_UUID.test('e0000000-0000-0000-0000-000000000101')).toBe(true);
    expect(LOOSE_UUID.test('3f2b8c1e-5d4a-4b6f-9a1c-2e7d8f9a0b1c')).toBe(true);
    expect(LOOSE_UUID.test('not-a-uuid')).toBe(false);
  });
});
