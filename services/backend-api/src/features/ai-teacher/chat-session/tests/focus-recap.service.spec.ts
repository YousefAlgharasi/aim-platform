import { FocusRecapService } from '../focus-recap.service';
import { FocusDirectiveContextAdapter } from '../../context-builder/adapters/focus-directive-context.adapter';
import { SkillsService } from '../../../curriculum/skills/skills.service';

describe('FocusRecapService', () => {
  function build(overrides: {
    directive?: { skillId: string; directiveText: string } | null;
    getSkill?: jest.Mock;
  } = {}) {
    const focusDirectiveContext = {
      getFocusDirectiveContext: jest
        .fn()
        .mockResolvedValue(overrides.directive === undefined ? { skillId: 'skill-1', directiveText: 'past tense' } : overrides.directive),
    } as unknown as FocusDirectiveContextAdapter;

    const skills = {
      getSkill: overrides.getSkill ?? jest.fn().mockResolvedValue({ id: 'skill-1', title: 'Past tense irregular verbs' }),
    } as unknown as SkillsService;

    return { service: new FocusRecapService(focusDirectiveContext, skills), skills };
  }

  it('returns null when no active directive exists', async () => {
    const { service } = build({ directive: null });
    const result = await service.getFocusRecap('student-1');
    expect(result).toBeNull();
  });

  it('returns a templated recap line using the real skill title', async () => {
    const { service } = build();
    const result = await service.getFocusRecap('student-1');
    expect(result).toBe("Today we're focusing on: Past tense irregular verbs");
  });

  it('falls back to the raw skillId when the skill lookup fails, without fabricating a title', async () => {
    const { service } = build({ getSkill: jest.fn().mockRejectedValue(new Error('not found')) });
    const result = await service.getFocusRecap('student-1');
    expect(result).toBe("Today we're focusing on: skill-1");
  });
});
