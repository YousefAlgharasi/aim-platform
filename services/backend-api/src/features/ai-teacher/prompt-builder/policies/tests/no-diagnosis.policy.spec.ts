// P8-049: Add No Diagnosis Policy
// buildNoDiagnosisPolicySection tests.

import {
  buildNoDiagnosisPolicySection,
  NO_DIAGNOSIS_POLICY_KEY,
  NO_DIAGNOSIS_POLICY_TEXT,
} from '../no-diagnosis.policy';

describe('buildNoDiagnosisPolicySection', () => {
  it('returns a fixed section keyed by the no-diagnosis policy key', () => {
    const section = buildNoDiagnosisPolicySection();
    expect(section).toEqual({
      key: NO_DIAGNOSIS_POLICY_KEY,
      content: NO_DIAGNOSIS_POLICY_TEXT,
    });
  });

  it('is stable across calls and accepts no context input', () => {
    const first = buildNoDiagnosisPolicySection();
    const second = buildNoDiagnosisPolicySection();
    expect(first).toEqual(second);
  });

  it('instructs the model to never diagnose a learning disability or mental/medical condition', () => {
    const section = buildNoDiagnosisPolicySection();
    expect(section.content).toMatch(/never diagnose, name, label, or suggest/i);
    expect(section.content).toMatch(/learning disability/i);
    expect(section.content).toMatch(/mental health condition/i);
  });

  it('instructs the model to redirect health/emotional concerns to a parent, teacher, or professional', () => {
    const section = buildNoDiagnosisPolicySection();
    expect(section.content).toMatch(/parent, teacher, or qualified professional/i);
  });

  it('never references mastery, level, weakness, difficulty, recommendation, or review-schedule values', () => {
    const section = buildNoDiagnosisPolicySection();
    expect(section.content).not.toMatch(/mastery|level|weakness|difficulty|recommendation|review.schedule/i);
  });
});
