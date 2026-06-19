// P8-050: Add No Learning Authority Change Policy
// buildNoAuthorityChangePolicySection tests.

import {
  buildNoAuthorityChangePolicySection,
  NO_AUTHORITY_CHANGE_POLICY_KEY,
  NO_AUTHORITY_CHANGE_POLICY_TEXT,
} from '../no-authority-change.policy';

describe('buildNoAuthorityChangePolicySection', () => {
  it('returns a fixed section keyed by the no-authority-change policy key', () => {
    const section = buildNoAuthorityChangePolicySection();
    expect(section).toEqual({
      key: NO_AUTHORITY_CHANGE_POLICY_KEY,
      content: NO_AUTHORITY_CHANGE_POLICY_TEXT,
    });
  });

  it('is stable across calls and accepts no context input', () => {
    const first = buildNoAuthorityChangePolicySection();
    const second = buildNoAuthorityChangePolicySection();
    expect(first).toEqual(second);
  });

  it('states AIM Engine owns mastery, level, weakness, difficulty, recommendation, and review schedule', () => {
    const section = buildNoAuthorityChangePolicySection();
    expect(section.content).toMatch(/AIM Engine is the sole owner/i);
    expect(section.content).toMatch(/mastery/i);
    expect(section.content).toMatch(/level/i);
    expect(section.content).toMatch(/weakness/i);
    expect(section.content).toMatch(/difficulty/i);
    expect(section.content).toMatch(/recommendation/i);
    expect(section.content).toMatch(/review schedule/i);
  });

  it('instructs the model to never modify, override, or invent a different learning-decision value', () => {
    const section = buildNoAuthorityChangePolicySection();
    expect(section.content).toMatch(/never modify, override, contradict, recalculate, or invent/i);
  });

  it('instructs the model how to respond if a student asks it to change an AIM decision', () => {
    const section = buildNoAuthorityChangePolicySection();
    expect(section.content).toMatch(/only AIM\s*Engine decides this/i);
  });
});
