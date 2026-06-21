// P9-053: Generate AI Teacher Text Response for Voice tests.

import { VoiceResponseGenerationService } from '../voice-response-generation.service';
import { VoiceSessionContextLinkService } from '../../context-link/voice-session-context-link.service';
import { TranscriptToAiTeacherService } from '../../transcript-pipeline/transcript-to-ai-teacher.service';
import { VoiceSessionContextLink } from '../../context-link/voice-session-context-link.types';
import { DispatchTranscriptResult } from '../../transcript-pipeline/transcript-to-ai-teacher.types';

function makeInput(overrides = {}) {
  return {
    studentId: 'student-1',
    sessionId: 'voice-session-1',
    transcript: 'What is one half plus one quarter?',
    isTranscriptFallback: false,
    ...overrides,
  };
}

function makeLink(overrides: Partial<VoiceSessionContextLink> = {}): VoiceSessionContextLink {
  return {
    sessionId: 'voice-session-1',
    studentId: 'student-1',
    contextRef: 'lesson:fractions',
    ...overrides,
  };
}

function makeDispatchResult(overrides: Partial<DispatchTranscriptResult> = {}): DispatchTranscriptResult {
  return {
    text: 'One half plus one quarter is three quarters.',
    isFallback: false,
    provider: 'fake-provider',
    model: 'fake-model',
    ...overrides,
  };
}

function makeServices(
  link: VoiceSessionContextLink = makeLink(),
  dispatchResult: DispatchTranscriptResult = makeDispatchResult(),
) {
  const contextLink = {
    resolveContext: jest.fn().mockResolvedValue(link),
  } as unknown as VoiceSessionContextLinkService;

  const transcriptToAiTeacher = {
    dispatch: jest.fn().mockResolvedValue(dispatchResult),
  } as unknown as TranscriptToAiTeacherService;

  return { contextLink, transcriptToAiTeacher };
}

describe('VoiceResponseGenerationService', () => {
  it('resolves the session context before dispatching the transcript', async () => {
    const { contextLink, transcriptToAiTeacher } = makeServices();
    const service = new VoiceResponseGenerationService(contextLink, transcriptToAiTeacher);

    await service.generateResponse(makeInput());

    expect(contextLink.resolveContext).toHaveBeenCalledWith({
      studentId: 'student-1',
      sessionId: 'voice-session-1',
    });
  });

  it('dispatches the transcript using the resolved contextRef', async () => {
    const { contextLink, transcriptToAiTeacher } = makeServices(makeLink({ contextRef: 'lesson:algebra' }));
    const service = new VoiceResponseGenerationService(contextLink, transcriptToAiTeacher);

    await service.generateResponse(makeInput());

    expect(transcriptToAiTeacher.dispatch).toHaveBeenCalledWith({
      studentId: 'student-1',
      sessionId: 'voice-session-1',
      contextRef: 'lesson:algebra',
      transcript: 'What is one half plus one quarter?',
      isTranscriptFallback: false,
    });
  });

  it('returns the AI text response mapped from the dispatch result', async () => {
    const { contextLink, transcriptToAiTeacher } = makeServices(
      makeLink(),
      makeDispatchResult({ text: 'Hello!', isFallback: true, provider: 'p', model: 'm' }),
    );
    const service = new VoiceResponseGenerationService(contextLink, transcriptToAiTeacher);

    const result = await service.generateResponse(makeInput());

    expect(result).toEqual({ text: 'Hello!', isFallback: true, provider: 'p', model: 'm' });
  });

  it('throws and never resolves context when studentId is missing', async () => {
    const { contextLink, transcriptToAiTeacher } = makeServices();
    const service = new VoiceResponseGenerationService(contextLink, transcriptToAiTeacher);

    await expect(service.generateResponse(makeInput({ studentId: '' }))).rejects.toThrow(/studentId is missing/);
    expect(contextLink.resolveContext).not.toHaveBeenCalled();
  });

  it('throws and never resolves context when sessionId is missing', async () => {
    const { contextLink, transcriptToAiTeacher } = makeServices();
    const service = new VoiceResponseGenerationService(contextLink, transcriptToAiTeacher);

    await expect(service.generateResponse(makeInput({ sessionId: '' }))).rejects.toThrow(/sessionId is missing/);
    expect(contextLink.resolveContext).not.toHaveBeenCalled();
  });

  it('propagates a context resolution failure without calling the dispatcher', async () => {
    const { contextLink, transcriptToAiTeacher } = makeServices();
    (contextLink.resolveContext as jest.Mock).mockRejectedValue(new Error('session is not active'));
    const service = new VoiceResponseGenerationService(contextLink, transcriptToAiTeacher);

    await expect(service.generateResponse(makeInput())).rejects.toThrow(/session is not active/);
    expect(transcriptToAiTeacher.dispatch).not.toHaveBeenCalled();
  });

  it('never computes a mastery, level, weakness, difficulty, recommendation, or review-schedule value', async () => {
    const { contextLink, transcriptToAiTeacher } = makeServices();
    const service = new VoiceResponseGenerationService(contextLink, transcriptToAiTeacher);

    const result = await service.generateResponse(makeInput());
    const serialized = JSON.stringify(result);

    expect(serialized).not.toMatch(/mastery/i);
    expect(serialized).not.toMatch(/\blevel\b/i);
    expect(serialized).not.toMatch(/weakness/i);
    expect(serialized).not.toMatch(/difficulty/i);
    expect(serialized).not.toMatch(/recommendation/i);
    expect(serialized).not.toMatch(/reviewSchedule/i);
  });

  it('never hard-codes a provider API key or reads process.env directly', () => {
    const source = require('fs').readFileSync(
      require.resolve('../voice-response-generation.service'),
      'utf8',
    ) as string;
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(codeOnly).not.toMatch(/process\.env/);
    expect(codeOnly).not.toMatch(/sk-[a-zA-Z0-9]/);
  });
});
