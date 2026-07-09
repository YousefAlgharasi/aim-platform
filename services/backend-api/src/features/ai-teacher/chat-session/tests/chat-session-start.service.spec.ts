// P8-063: Build Chat Session Start Service
// P21-007/P21-008/P21-009: get-or-create by (studentId, contextRef), plus
// opening-greeting generation + eager TTS synthesis on genuinely new
// sessions.

import { ChatSessionStartService } from '../chat-session-start.service';
import { AiChatSessionRepository } from '../../repositories/ai-chat-session.repository';
import { AiChatMessageRepository } from '../../repositories/ai-chat-message.repository';
import { AiChatSessionRow, AiChatMessageRow } from '../../repositories/ai-chat-repository.types';
import { AiTeacherOrchestratorService } from '../../orchestrator/ai-teacher-orchestrator.service';
import { GenerateGreetingResult } from '../../orchestrator/ai-teacher-orchestrator.types';
import { ContextBuilderService } from '../../context-builder/context-builder.service';
import { TtsGateway } from '../../../voice-teacher/tts-gateway/tts-gateway.interface';
import { TtsProviderResponse } from '../../../voice-teacher/tts-gateway/tts-gateway.types';

function makeSessionRow(overrides: Partial<AiChatSessionRow> = {}): AiChatSessionRow {
  return {
    id: 'session-1',
    student_id: 'student-1',
    context_ref: 'lesson:fractions',
    status: 'active',
    lesson_teaching_stage: 'greeting',
    resolved_lesson_id: null,
    created_at: '2026-06-19T00:00:00.000Z',
    updated_at: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

function makeGreetingMessageRow(overrides: Partial<AiChatMessageRow> = {}): AiChatMessageRow {
  return {
    id: 'greeting-message-1',
    session_id: 'session-1',
    student_id: 'student-1',
    role: 'ai_teacher',
    text: 'Welcome! Today we will practice fractions.',
    created_at: '2026-06-19T00:00:00.000Z',
    channel: 'text',
    audio_ref: null,
    audio_duration_ms: null,
    is_greeting: true,
    ...overrides,
  };
}

function makeGreetingResult(overrides: Partial<GenerateGreetingResult> = {}): GenerateGreetingResult {
  return {
    text: 'Welcome! Today we will practice fractions.',
    isFallback: false,
    provider: 'fake-provider',
    model: 'fake-model',
    latencyMs: 20,
    context: {
      studentId: 'student-1',
      sessionId: 'session-1',
      studentProfile: null,
      currentLesson: null,
      curriculumSkill: null,
      focusDirective: null,
      difficultyDecision: null,
      emotionalState: null,
    },
    ...overrides,
  };
}

function makeDeps(options: {
  created?: boolean;
  sessionRow?: AiChatSessionRow;
  greetingResult?: GenerateGreetingResult;
  greetingMessageRow?: AiChatMessageRow;
  ttsResponse?: TtsProviderResponse;
  ttsGateway?: TtsGateway | null;
} = {}) {
  const created = options.created ?? true;
  const sessionRow = options.sessionRow ?? makeSessionRow();
  const greetingResult = options.greetingResult ?? makeGreetingResult();
  const greetingMessageRow = options.greetingMessageRow ?? makeGreetingMessageRow();

  const chatSessionRepository = {
    getOrCreateForContext: jest.fn().mockResolvedValue({ session: sessionRow, created }),
  } as unknown as AiChatSessionRepository;

  const chatMessageRepository = {
    create: jest.fn().mockResolvedValue(greetingMessageRow),
    updateAudio: jest.fn().mockResolvedValue({ ...greetingMessageRow, audio_ref: 'audio-ref-1' }),
  } as unknown as AiChatMessageRepository;

  const aiTeacherOrchestrator = {
    generateGreeting: jest.fn().mockResolvedValue(greetingResult),
  } as unknown as AiTeacherOrchestratorService;

  const contextBuilder = {
    persistSnapshot: jest.fn().mockResolvedValue(undefined),
  } as unknown as ContextBuilderService;

  const ttsResponse: TtsProviderResponse =
    options.ttsResponse ?? {
      status: 'success',
      audioRef: 'audio-ref-1',
      durationMs: 1200,
      contentType: 'audio/mpeg',
    };

  const ttsGateway =
    options.ttsGateway === undefined
      ? ({ synthesize: jest.fn().mockResolvedValue(ttsResponse) } as unknown as TtsGateway)
      : options.ttsGateway;

  const focusRecapService = {
    getFocusRecap: jest.fn().mockResolvedValue(null),
  } as unknown as import('../focus-recap.service').FocusRecapService;

  const lastSessionRecapService = {
    getRecapForNewSession: jest.fn().mockResolvedValue(null),
  } as unknown as import('../last-session-recap.service').LastSessionRecapService;

  const service = new ChatSessionStartService(
    chatSessionRepository,
    chatMessageRepository,
    aiTeacherOrchestrator,
    contextBuilder,
    ttsGateway,
    focusRecapService,
    lastSessionRecapService,
  );

  return {
    service,
    chatSessionRepository,
    chatMessageRepository,
    aiTeacherOrchestrator,
    contextBuilder,
    ttsGateway,
    lastSessionRecapService,
  };
}

// Flush the fire-and-continue greeting microtask chain kicked off inside
// startSession before assertions run.
async function flush() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe('ChatSessionStartService', () => {
  it('resolves via getOrCreateForContext with the given studentId and contextRef', async () => {
    const { service, chatSessionRepository } = makeDeps();

    await service.startSession({ studentId: 'student-1', contextRef: 'lesson:fractions' });
    await flush();

    expect(chatSessionRepository.getOrCreateForContext).toHaveBeenCalledWith(
      'student-1',
      'lesson:fractions',
    );
  });

  it('returns the resolved session mapped from the repository row', async () => {
    const { service } = makeDeps();

    const result = await service.startSession({
      studentId: 'student-1',
      contextRef: 'lesson:fractions',
    });

    expect(result).toEqual({
      sessionId: 'session-1',
      studentId: 'student-1',
      contextRef: 'lesson:fractions',
      status: 'active',
      createdAt: '2026-06-19T00:00:00.000Z',
      focusRecap: null,
      lastSessionRecap: null,
    });
  });

  it('throws and never resolves a session when studentId is missing', async () => {
    const { service, chatSessionRepository } = makeDeps();

    await expect(
      service.startSession({ studentId: '', contextRef: 'lesson:fractions' }),
    ).rejects.toThrow(/studentId is missing/);
    expect(chatSessionRepository.getOrCreateForContext).not.toHaveBeenCalled();
  });

  it('throws when contextRef is missing', async () => {
    const { service, chatSessionRepository } = makeDeps();

    await expect(
      service.startSession({ studentId: 'student-1', contextRef: '' }),
    ).rejects.toThrow(/contextRef is missing/);
    expect(chatSessionRepository.getOrCreateForContext).not.toHaveBeenCalled();
  });

  describe('P21-008: opening greeting generation', () => {
    it('generates and persists exactly one greeting message when a new session is created', async () => {
      const { service, aiTeacherOrchestrator, chatMessageRepository } = makeDeps({ created: true });

      await service.startSession({ studentId: 'student-1', contextRef: 'lesson:fractions' });
      await flush();

      expect(aiTeacherOrchestrator.generateGreeting).toHaveBeenCalledWith({
        studentId: 'student-1',
        sessionId: 'session-1',
        contextRef: 'lesson:fractions',
      });
      expect(chatMessageRepository.create).toHaveBeenCalledWith(
        'session-1',
        'student-1',
        'ai_teacher',
        'Welcome! Today we will practice fractions.',
        { channel: 'text', isGreeting: true },
      );
    });

    it('persists the context snapshot against the greeting message id', async () => {
      const { service, contextBuilder } = makeDeps({ created: true });

      await service.startSession({ studentId: 'student-1', contextRef: 'lesson:fractions' });
      await flush();

      expect(contextBuilder.persistSnapshot).toHaveBeenCalledWith(
        'greeting-message-1',
        makeGreetingResult().context,
      );
    });

    it('does not generate a second greeting when resuming an existing session', async () => {
      const { service, aiTeacherOrchestrator, chatMessageRepository } = makeDeps({ created: false });

      await service.startSession({ studentId: 'student-1', contextRef: 'lesson:fractions' });
      await flush();

      expect(aiTeacherOrchestrator.generateGreeting).not.toHaveBeenCalled();
      expect(chatMessageRepository.create).not.toHaveBeenCalled();
    });

    it('a greeting-generation failure is swallowed and never breaks session creation', async () => {
      const chatSessionRepository = {
        getOrCreateForContext: jest.fn().mockResolvedValue({ session: makeSessionRow(), created: true }),
      } as unknown as AiChatSessionRepository;
      const chatMessageRepository = { create: jest.fn(), updateAudio: jest.fn() } as unknown as AiChatMessageRepository;
      const aiTeacherOrchestrator = {
        generateGreeting: jest.fn().mockRejectedValue(new Error('provider exploded')),
      } as unknown as AiTeacherOrchestratorService;
      const contextBuilder = { persistSnapshot: jest.fn() } as unknown as ContextBuilderService;
      const ttsGateway = { synthesize: jest.fn() } as unknown as TtsGateway;
      const focusRecapService = {
        getFocusRecap: jest.fn().mockResolvedValue(null),
      } as unknown as import('../focus-recap.service').FocusRecapService;
      const lastSessionRecapService = {
        getRecapForNewSession: jest.fn().mockResolvedValue(null),
      } as unknown as import('../last-session-recap.service').LastSessionRecapService;

      const service = new ChatSessionStartService(
        chatSessionRepository,
        chatMessageRepository,
        aiTeacherOrchestrator,
        contextBuilder,
        ttsGateway,
        focusRecapService,
        lastSessionRecapService,
      );

      await expect(
        service.startSession({ studentId: 'student-1', contextRef: 'lesson:fractions' }),
      ).resolves.toEqual({
        sessionId: 'session-1',
        studentId: 'student-1',
        contextRef: 'lesson:fractions',
        status: 'active',
        createdAt: '2026-06-19T00:00:00.000Z',
        focusRecap: null,
        lastSessionRecap: null,
      });
      await flush();

      expect(chatMessageRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('P21-009: eager TTS synthesis of the greeting', () => {
    it('synthesizes the greeting audio and attaches it to the greeting message row', async () => {
      const { service, ttsGateway, chatMessageRepository } = makeDeps({ created: true });

      await service.startSession({ studentId: 'student-1', contextRef: 'lesson:fractions' });
      await flush();

      expect((ttsGateway as jest.Mocked<TtsGateway>).synthesize).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Welcome! Today we will practice fractions.',
          sessionId: 'session-1',
          studentId: 'student-1',
        }),
      );
      expect(chatMessageRepository.updateAudio).toHaveBeenCalledWith(
        'greeting-message-1',
        'audio-ref-1',
        1200,
      );
    });

    it('leaves audio_ref null and does not throw when TTS synthesis fails', async () => {
      const { service, chatMessageRepository } = makeDeps({
        created: true,
        ttsResponse: {
          status: 'error',
          audioRef: null,
          durationMs: null,
          contentType: null,
          errorCategory: 'TTS_PROVIDER_ERROR',
        },
      });

      await expect(
        service.startSession({ studentId: 'student-1', contextRef: 'lesson:fractions' }),
      ).resolves.toBeDefined();
      await flush();

      expect(chatMessageRepository.updateAudio).not.toHaveBeenCalled();
    });

    it('leaves audio_ref null and does not throw when the TTS gateway itself throws', async () => {
      const ttsGateway = {
        synthesize: jest.fn().mockRejectedValue(new Error('network down')),
      } as unknown as TtsGateway;
      const { service, chatMessageRepository } = makeDeps({ created: true, ttsGateway });

      await expect(
        service.startSession({ studentId: 'student-1', contextRef: 'lesson:fractions' }),
      ).resolves.toBeDefined();
      await flush();

      expect(chatMessageRepository.updateAudio).not.toHaveBeenCalled();
    });

    it('the text greeting is unaffected when TTS_GATEWAY is not bound (null)', async () => {
      const { service, chatMessageRepository } = makeDeps({ created: true, ttsGateway: null });

      const result = await service.startSession({
        studentId: 'student-1',
        contextRef: 'lesson:fractions',
      });
      await flush();

      expect(result.sessionId).toBe('session-1');
      expect(chatMessageRepository.updateAudio).not.toHaveBeenCalled();
    });
  });

  describe('P21-012: focusRecap field', () => {
    it('is null when no active focus directive exists', async () => {
      const { service } = makeDeps({ created: false });

      const result = await service.startSession({
        studentId: 'student-1',
        contextRef: 'lesson:fractions',
      });

      expect(result.focusRecap).toBeNull();
    });

    it('is populated from FocusRecapService when an active directive exists', async () => {
      const chatSessionRepository = {
        getOrCreateForContext: jest
          .fn()
          .mockResolvedValue({ session: makeSessionRow(), created: false }),
      } as unknown as AiChatSessionRepository;
      const chatMessageRepository = { create: jest.fn(), updateAudio: jest.fn() } as unknown as AiChatMessageRepository;
      const aiTeacherOrchestrator = { generateGreeting: jest.fn() } as unknown as AiTeacherOrchestratorService;
      const contextBuilder = { persistSnapshot: jest.fn() } as unknown as ContextBuilderService;
      const ttsGateway = { synthesize: jest.fn() } as unknown as TtsGateway;
      const focusRecapService = {
        getFocusRecap: jest.fn().mockResolvedValue("Today we're focusing on: Past tense irregular verbs"),
      } as unknown as import('../focus-recap.service').FocusRecapService;
      const lastSessionRecapService = {
        getRecapForNewSession: jest.fn().mockResolvedValue(null),
      } as unknown as import('../last-session-recap.service').LastSessionRecapService;

      const service = new ChatSessionStartService(
        chatSessionRepository,
        chatMessageRepository,
        aiTeacherOrchestrator,
        contextBuilder,
        ttsGateway,
        focusRecapService,
        lastSessionRecapService,
      );

      const result = await service.startSession({
        studentId: 'student-1',
        contextRef: 'lesson:fractions',
      });

      expect(result.focusRecap).toBe("Today we're focusing on: Past tense irregular verbs");
    });
  });

  describe('P21-013: lastSessionRecap field', () => {
    it('is null on a same-session resume (created=false), never calling LastSessionRecapService', async () => {
      const { service, lastSessionRecapService } = makeDeps({ created: false });

      const result = await service.startSession({
        studentId: 'student-1',
        contextRef: 'lesson:fractions',
      });

      expect(result.lastSessionRecap).toBeNull();
      expect((lastSessionRecapService as any).getRecapForNewSession).not.toHaveBeenCalled();
    });

    it('is populated from LastSessionRecapService when a new session is created', async () => {
      const chatSessionRepository = {
        getOrCreateForContext: jest
          .fn()
          .mockResolvedValue({ session: makeSessionRow(), created: true }),
      } as unknown as AiChatSessionRepository;
      const chatMessageRepository = {
        create: jest.fn().mockResolvedValue(makeGreetingMessageRow()),
        updateAudio: jest.fn().mockResolvedValue(makeGreetingMessageRow()),
      } as unknown as AiChatMessageRepository;
      const aiTeacherOrchestrator = {
        generateGreeting: jest.fn().mockResolvedValue(makeGreetingResult()),
      } as unknown as AiTeacherOrchestratorService;
      const contextBuilder = { persistSnapshot: jest.fn() } as unknown as ContextBuilderService;
      const ttsGateway = { synthesize: jest.fn().mockResolvedValue({ status: 'error', audioRef: null, durationMs: null, contentType: null }) } as unknown as TtsGateway;
      const focusRecapService = {
        getFocusRecap: jest.fn().mockResolvedValue(null),
      } as unknown as import('../focus-recap.service').FocusRecapService;
      const lastSessionRecapService = {
        getRecapForNewSession: jest
          .fn()
          .mockResolvedValue('Welcome back! Last time we were working on fractions.'),
      } as unknown as import('../last-session-recap.service').LastSessionRecapService;

      const service = new ChatSessionStartService(
        chatSessionRepository,
        chatMessageRepository,
        aiTeacherOrchestrator,
        contextBuilder,
        ttsGateway,
        focusRecapService,
        lastSessionRecapService,
      );

      const result = await service.startSession({
        studentId: 'student-1',
        contextRef: 'lesson:fractions',
      });

      expect(lastSessionRecapService.getRecapForNewSession).toHaveBeenCalledWith(
        'student-1',
        'lesson:fractions',
      );
      expect(result.lastSessionRecap).toBe('Welcome back! Last time we were working on fractions.');
    });

    it('a recap-generation failure is swallowed and never breaks session creation', async () => {
      const chatSessionRepository = {
        getOrCreateForContext: jest
          .fn()
          .mockResolvedValue({ session: makeSessionRow(), created: true }),
      } as unknown as AiChatSessionRepository;
      const chatMessageRepository = {
        create: jest.fn().mockResolvedValue(makeGreetingMessageRow()),
        updateAudio: jest.fn().mockResolvedValue(makeGreetingMessageRow()),
      } as unknown as AiChatMessageRepository;
      const aiTeacherOrchestrator = {
        generateGreeting: jest.fn().mockResolvedValue(makeGreetingResult()),
      } as unknown as AiTeacherOrchestratorService;
      const contextBuilder = { persistSnapshot: jest.fn() } as unknown as ContextBuilderService;
      const ttsGateway = { synthesize: jest.fn().mockResolvedValue({ status: 'error', audioRef: null, durationMs: null, contentType: null }) } as unknown as TtsGateway;
      const focusRecapService = {
        getFocusRecap: jest.fn().mockResolvedValue(null),
      } as unknown as import('../focus-recap.service').FocusRecapService;
      const lastSessionRecapService = {
        getRecapForNewSession: jest.fn().mockRejectedValue(new Error('db exploded')),
      } as unknown as import('../last-session-recap.service').LastSessionRecapService;

      const service = new ChatSessionStartService(
        chatSessionRepository,
        chatMessageRepository,
        aiTeacherOrchestrator,
        contextBuilder,
        ttsGateway,
        focusRecapService,
        lastSessionRecapService,
      );

      const result = await service.startSession({
        studentId: 'student-1',
        contextRef: 'lesson:fractions',
      });

      expect(result.lastSessionRecap).toBeNull();
      expect(result.sessionId).toBe('session-1');
    });
  });

  it('never hard-codes a provider API key or reads process.env directly', () => {
    const source = require('fs').readFileSync(
      require.resolve('../chat-session-start.service'),
      'utf8',
    ) as string;
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(codeOnly).not.toMatch(/process\.env/);
    expect(codeOnly).not.toMatch(/sk-[a-zA-Z0-9]/);
  });
});
