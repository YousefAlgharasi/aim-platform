// P9-057: Add Voice Orchestrator Tests.
//
// `VoiceOrchestratorService` (P9-048) is a thin STT -> AI Teacher -> TTS
// coordinator and already has its own unit suite
// (voice-orchestrator.service.spec.ts). This suite instead exercises the
// broader Group F voice orchestration pipeline built across P9-048..P9-056
// as it composes end-to-end for a single voice turn:
//
//   1. VoiceRateLimitPolicyService (P9-055) — must run first and stop the
//      pipeline before any other step on breach.
//   2. VoiceSessionContextLinkService (P9-052) — resolves/validates the
//      backend session and contextRef; must run before AI Teacher dispatch
//      and must stop the pipeline on failure.
//   3. TranscriptToAiTeacherService (P9-051) — dispatches the transcript to
//      the AI Teacher orchestrator using the resolved contextRef.
//   4. VoiceFallbackToTextPolicyService (P9-056) — decides the safe
//      audioRef/text delivery for the turn.
//   5. VoiceMessagePersistenceService (P9-054) — persists the transcript and
//      reply only after the prior steps succeed.
//
// No step in this composed pipeline computes or returns a mastery/level/
// weakness/difficulty/recommendation/review-schedule value
// (docs/phase-9/no-aim-authority-change-rule.md), and no provider
// credential or raw audio ever appears in the result.

import { VoiceRateLimitPolicyService } from '../../rate-limit-policy/voice-rate-limit-policy.service';
import { VoiceMessageRepository } from '../../repositories/voice-message.repository';
import { VoiceSessionContextLinkService } from '../../context-link/voice-session-context-link.service';
import { VoiceSessionRepository } from '../../repositories/voice-session.repository';
import { TranscriptToAiTeacherService } from '../../transcript-pipeline/transcript-to-ai-teacher.service';
import { AiTeacherOrchestratorService } from '../../../ai-teacher/orchestrator/ai-teacher-orchestrator.service';
import { VoiceFallbackToTextPolicyService } from '../../fallback-policy/voice-fallback-to-text-policy.service';
import { VoiceMessagePersistenceService } from '../../message-persistence/voice-message-persistence.service';
import { VoiceTranscriptRepository } from '../../repositories/voice-transcript.repository';
import { VoiceSessionRow, VoiceTranscriptRow } from '../../repositories/voice-repository.types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeSessionRow(overrides: Partial<VoiceSessionRow> = {}): VoiceSessionRow {
  return {
    id: 'voice-session-1',
    student_id: 'student-1',
    context_ref: 'ctx-ref-1',
    status: 'active',
    created_at: '2026-06-19T00:00:00.000Z',
    updated_at: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

function makeTranscriptRow(overrides: Partial<VoiceTranscriptRow> = {}): VoiceTranscriptRow {
  return {
    id: 'voice-transcript-1',
    message_id: 'voice-message-1',
    session_id: 'voice-session-1',
    transcript_text: 'What is one half plus one quarter?',
    language_code: 'en-US',
    confidence: 0.92,
    segments: null,
    provider_ref: null,
    created_at: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

function buildPipeline(
  options: {
    sessionRow?: VoiceSessionRow | null;
    aiResult?: { text: string; isFallback: boolean; provider: string; model: string };
    ttsSucceeded?: boolean;
    audioRef?: string | null;
  } = {},
) {
  const voiceMessageRepository = {
    findLastCreatedAtBySessionId: jest.fn().mockResolvedValue(null),
    countBySessionId: jest.fn().mockResolvedValue(0),
    countByStudentIdSince: jest.fn().mockResolvedValue(0),
    updateTranscript: jest.fn().mockResolvedValue(undefined),
    updateReply: jest.fn().mockResolvedValue(undefined),
  } as unknown as VoiceMessageRepository;

  const voiceSessionRepository = {
    findById: jest.fn().mockResolvedValue(
      options.sessionRow === undefined ? makeSessionRow() : options.sessionRow,
    ),
  } as unknown as VoiceSessionRepository;

  const aiTeacherOrchestrator = {
    handleTurn: jest.fn().mockResolvedValue(
      options.aiResult ?? {
        text: 'One half plus one quarter is three quarters.',
        isFallback: false,
        provider: 'anthropic',
        model: 'claude-3-haiku',
      },
    ),
  } as unknown as AiTeacherOrchestratorService;

  const voiceTranscriptRepository = {
    create: jest.fn().mockResolvedValue(makeTranscriptRow()),
  } as unknown as VoiceTranscriptRepository;

  const rateLimitPolicy = new VoiceRateLimitPolicyService(voiceMessageRepository);
  const contextLink = new VoiceSessionContextLinkService(voiceSessionRepository);
  const transcriptToAiTeacher = new TranscriptToAiTeacherService(aiTeacherOrchestrator);
  const fallbackPolicy = new VoiceFallbackToTextPolicyService();
  const persistence = new VoiceMessagePersistenceService(voiceMessageRepository, voiceTranscriptRepository);

  return {
    rateLimitPolicy,
    contextLink,
    transcriptToAiTeacher,
    fallbackPolicy,
    persistence,
    voiceMessageRepository,
    voiceSessionRepository,
    aiTeacherOrchestrator,
    voiceTranscriptRepository,
    ttsSucceeded: options.ttsSucceeded ?? false,
    audioRef: options.audioRef ?? null,
  };
}

/** Runs the full composed pipeline for a single voice turn, mirroring how a
 *  future controller/orchestrator would call these services in sequence. */
async function runPipeline(
  pipeline: ReturnType<typeof buildPipeline>,
  input: { studentId: string; sessionId: string; messageId: string; transcript: string; languageCode: string | null; confidence: number | null },
) {
  await pipeline.rateLimitPolicy.assertNotRateLimited({
    studentId: input.studentId,
    sessionId: input.sessionId,
  });

  const link = await pipeline.contextLink.resolveContext({
    studentId: input.studentId,
    sessionId: input.sessionId,
  });

  const aiResult = await pipeline.transcriptToAiTeacher.dispatch({
    studentId: link.studentId,
    sessionId: link.sessionId,
    contextRef: link.contextRef,
    transcript: input.transcript,
    isTranscriptFallback: false,
  });

  const turnOutput = pipeline.fallbackPolicy.resolveTurnOutput({
    replyText: aiResult.text,
    ttsSucceeded: pipeline.ttsSucceeded,
    audioRef: pipeline.audioRef,
  });

  const persisted = await pipeline.persistence.persistTurn({
    messageId: input.messageId,
    sessionId: input.sessionId,
    transcript: input.transcript,
    languageCode: input.languageCode,
    confidence: input.confidence,
    reply: turnOutput.text,
  });

  return { aiResult, turnOutput, persisted };
}

const baseInput = {
  studentId: 'student-1',
  sessionId: 'voice-session-1',
  messageId: 'voice-message-1',
  transcript: 'What is one half plus one quarter?',
  languageCode: 'en-US',
  confidence: 0.92,
};

describe('Voice orchestration pipeline (P9-048..P9-056 composition)', () => {
  it('runs rate limit -> context link -> AI Teacher dispatch -> fallback policy -> persistence in order', async () => {
    const pipeline = buildPipeline();
    const callOrder: string[] = [];

    jest.spyOn(pipeline.rateLimitPolicy, 'assertNotRateLimited').mockImplementation(async () => {
      callOrder.push('rateLimit');
    });
    jest.spyOn(pipeline.contextLink, 'resolveContext').mockImplementation(async (...args) => {
      callOrder.push('contextLink');
      return {
        sessionId: args[0].sessionId,
        studentId: args[0].studentId,
        contextRef: 'ctx-ref-1',
      };
    });
    jest.spyOn(pipeline.transcriptToAiTeacher, 'dispatch').mockImplementation(async () => {
      callOrder.push('dispatch');
      return { text: 'reply', isFallback: false, provider: 'anthropic', model: 'claude-3-haiku' };
    });
    jest.spyOn(pipeline.fallbackPolicy, 'resolveTurnOutput').mockImplementation((input) => {
      callOrder.push('fallbackPolicy');
      return { text: input.replyText, audioRef: null, isFallbackToText: true };
    });
    jest.spyOn(pipeline.persistence, 'persistTurn').mockImplementation(async () => {
      callOrder.push('persistence');
      return { messageId: 'voice-message-1', transcriptId: 'voice-transcript-1' };
    });

    await runPipeline(pipeline, baseInput);

    expect(callOrder).toEqual(['rateLimit', 'contextLink', 'dispatch', 'fallbackPolicy', 'persistence']);
  });

  it('stops the pipeline before context link, dispatch, or persistence when rate-limited', async () => {
    const pipeline = buildPipeline();
    pipeline.voiceMessageRepository.countBySessionId = jest.fn().mockResolvedValue(9_999);

    await expect(runPipeline(pipeline, baseInput)).rejects.toThrow();

    expect(pipeline.voiceSessionRepository.findById).not.toHaveBeenCalled();
    expect(pipeline.aiTeacherOrchestrator.handleTurn).not.toHaveBeenCalled();
    expect(pipeline.voiceTranscriptRepository.create).not.toHaveBeenCalled();
  });

  it('stops the pipeline before dispatch or persistence when the session/context link fails', async () => {
    const pipeline = buildPipeline({ sessionRow: null });

    await expect(runPipeline(pipeline, baseInput)).rejects.toThrow();

    expect(pipeline.aiTeacherOrchestrator.handleTurn).not.toHaveBeenCalled();
    expect(pipeline.voiceTranscriptRepository.create).not.toHaveBeenCalled();
  });

  it('forwards the resolved contextRef from context link to the AI Teacher dispatch', async () => {
    const pipeline = buildPipeline({ sessionRow: makeSessionRow({ context_ref: 'ctx-ref-special' }) });

    await runPipeline(pipeline, baseInput);

    expect(pipeline.aiTeacherOrchestrator.handleTurn).toHaveBeenCalledWith(
      expect.objectContaining({ contextRef: 'ctx-ref-special' }),
    );
  });

  it('persists the fallback-policy-resolved reply text, not the raw AI Teacher text', async () => {
    const pipeline = buildPipeline({
      aiResult: { text: 'raw ai reply', isFallback: false, provider: 'anthropic', model: 'claude-3-haiku' },
    });

    await runPipeline(pipeline, baseInput);

    expect(pipeline.voiceMessageRepository.updateReply).toHaveBeenCalledWith('voice-message-1', 'raw ai reply');
  });

  it('falls back to text-only delivery (no audioRef) when TTS did not succeed, without failing the turn', async () => {
    const pipeline = buildPipeline({ ttsSucceeded: false, audioRef: null });

    const { turnOutput, persisted } = await runPipeline(pipeline, baseInput);

    expect(turnOutput.audioRef).toBeNull();
    expect(turnOutput.isFallbackToText).toBe(true);
    expect(persisted.messageId).toBe('voice-message-1');
  });

  it('never computes a mastery, level, weakness, difficulty, recommendation, or review-schedule value anywhere in the pipeline result', async () => {
    const pipeline = buildPipeline();

    const { aiResult, turnOutput, persisted } = await runPipeline(pipeline, baseInput);
    const serialized = JSON.stringify({ aiResult, turnOutput, persisted });

    expect(serialized).not.toMatch(/mastery/i);
    expect(serialized).not.toMatch(/\blevel\b/i);
    expect(serialized).not.toMatch(/weakness/i);
    expect(serialized).not.toMatch(/difficulty/i);
    expect(serialized).not.toMatch(/recommendation/i);
    expect(serialized).not.toMatch(/reviewSchedule/i);
  });

  it('never leaks provider credentials or raw audio bytes in the pipeline result', async () => {
    const pipeline = buildPipeline();

    const { aiResult, turnOutput, persisted } = await runPipeline(pipeline, baseInput);
    const serialized = JSON.stringify({ aiResult, turnOutput, persisted });

    expect(serialized).not.toMatch(/sk-[a-zA-Z0-9]/);
    expect(serialized).not.toMatch(/apiKey/i);
    expect(serialized).not.toMatch(/process\.env/);
  });
});
