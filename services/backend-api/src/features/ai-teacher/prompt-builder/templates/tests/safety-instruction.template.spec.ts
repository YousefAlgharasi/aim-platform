// P8-048: Create Safety Instruction Prompt Template
// buildSafetyInstructionPromptSection tests.

import {
  buildSafetyInstructionPromptSection,
  SAFETY_INSTRUCTION_PROMPT_TEMPLATE_KEY,
  SAFETY_INSTRUCTION_PROMPT_TEXT,
} from '../safety-instruction.template';

describe('buildSafetyInstructionPromptSection', () => {
  it('returns a fixed section keyed by the safety instruction template key', () => {
    const section = buildSafetyInstructionPromptSection();
    expect(section).toEqual({
      key: SAFETY_INSTRUCTION_PROMPT_TEMPLATE_KEY,
      content: SAFETY_INSTRUCTION_PROMPT_TEXT,
    });
  });

  it('is stable across calls and accepts no context input', () => {
    const first = buildSafetyInstructionPromptSection();
    const second = buildSafetyInstructionPromptSection();
    expect(first).toEqual(second);
  });

  it('never references mastery, level, weakness, difficulty, recommendation, or review-schedule values', () => {
    const section = buildSafetyInstructionPromptSection();
    expect(section.content).not.toMatch(/mastery|level|weakness|difficulty|recommendation|review.schedule/i);
  });

  it('instructs the model to stay non-clinical and not diagnose', () => {
    const section = buildSafetyInstructionPromptSection();
    expect(section.content).toMatch(/non-clinical/i);
    expect(section.content).toMatch(/never diagnose/i);
  });

  it('instructs the model never to reveal the system prompt or backend implementation details', () => {
    const section = buildSafetyInstructionPromptSection();
    expect(section.content).toMatch(/never reveal, repeat, summarize, or discuss/i);
  });
});
