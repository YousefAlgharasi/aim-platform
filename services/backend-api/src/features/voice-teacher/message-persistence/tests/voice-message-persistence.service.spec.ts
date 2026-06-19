// P9-054: Persist Voice Conversation Messages tests.

import { VoiceMessagePersistenceService } from '../voice-message-persistence.service';
import { VoiceMessageRepository } from '../../repositories/voice-message.repository';
import { VoiceTranscriptRepository } from '../../repositories/voice-transcript.repository';
import { VoiceTranscriptRow } from '../../repositories/voice-repository.types';

function makeInput(overrides = {}) {
  return {
    messageId: 'voice-message-1',
    sessionId: 'voice-session-1',
    transcript: 'What is one half plus one quarter?',
    languageCode: 'en-US',
    confidence: 0.92,
    reply: 'One half plus one quarter is three quarters.',
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

function makeRepositories(transcriptRow: VoiceTranscriptRow = makeTranscriptRow()) {
  const voiceMessageRepository = {
    updateTranscript: jest.fn().mockResolvedValue(undefined),
    updateReply: jest.fn().mockResolvedValue(undefined),
  } as unknown as VoiceMessageRepository;

  const voiceTranscriptRepository = {
    create: jest.fn().mockResolvedValue(transcriptRow),
  } as unknown as VoiceTranscriptRepository;

  return { voiceMessageRepository, voiceTranscriptRepository };
}

describe('VoiceMessagePersistenceService', () => {
  it('persists the transcript onto the voice message before creating the transcript row', async () => {
    const { voiceMessageRepository, voiceTranscriptRepository } = makeRepositories();
    const service = new VoiceMessagePersistenceService(voiceMessageRepository, voiceTranscriptRepository);

    await service.persistTurn(makeInput());

    expect(voiceMessageRepository.updateTranscript).toHaveBeenCalledWith(
      'voice-message-1',
      'What is one half plus one quarter?',
    );
  });

  it('creates a voice_transcripts row with the message/session/transcript/language/confidence', async () => {
    const { voiceMessageRepository, voiceTranscriptRepository } = makeRepositories();
    const service = new VoiceMessagePersistenceService(voiceMessageRepository, voiceTranscriptRepository);

    await service.persistTurn(makeInput());

    expect(voiceTranscriptRepository.create).toHaveBeenCalledWith(
      'voice-message-1',
      'voice-session-1',
      'What is one half plus one quarter?',
      'en-US',
      0.92,
      null,
      null,
    );
  });

  it('persists the AI reply onto the voice message', async () => {
    const { voiceMessageRepository, voiceTranscriptRepository } = makeRepositories();
    const service = new VoiceMessagePersistenceService(voiceMessageRepository, voiceTranscriptRepository);

    await service.persistTurn(makeInput());

    expect(voiceMessageRepository.updateReply).toHaveBeenCalledWith(
      'voice-message-1',
      'One half plus one quarter is three quarters.',
    );
  });

  it('returns the messageId and the created transcriptId', async () => {
    const { voiceMessageRepository, voiceTranscriptRepository } = makeRepositories(
      makeTranscriptRow({ id: 'voice-transcript-9' }),
    );
    const service = new VoiceMessagePersistenceService(voiceMessageRepository, voiceTranscriptRepository);

    const result = await service.persistTurn(makeInput());

    expect(result).toEqual({ messageId: 'voice-message-1', transcriptId: 'voice-transcript-9' });
  });

  it('throws and never calls the repositories when messageId is missing', async () => {
    const { voiceMessageRepository, voiceTranscriptRepository } = makeRepositories();
    const service = new VoiceMessagePersistenceService(voiceMessageRepository, voiceTranscriptRepository);

    await expect(service.persistTurn(makeInput({ messageId: '' }))).rejects.toThrow(/messageId is missing/);
    expect(voiceMessageRepository.updateTranscript).not.toHaveBeenCalled();
    expect(voiceTranscriptRepository.create).not.toHaveBeenCalled();
  });

  it('throws and never calls the repositories when sessionId is missing', async () => {
    const { voiceMessageRepository, voiceTranscriptRepository } = makeRepositories();
    const service = new VoiceMessagePersistenceService(voiceMessageRepository, voiceTranscriptRepository);

    await expect(service.persistTurn(makeInput({ sessionId: '' }))).rejects.toThrow(/sessionId is missing/);
    expect(voiceMessageRepository.updateTranscript).not.toHaveBeenCalled();
    expect(voiceTranscriptRepository.create).not.toHaveBeenCalled();
  });

  it('never computes a mastery, level, weakness, difficulty, recommendation, or review-schedule value', async () => {
    const { voiceMessageRepository, voiceTranscriptRepository } = makeRepositories();
    const service = new VoiceMessagePersistenceService(voiceMessageRepository, voiceTranscriptRepository);

    const result = await service.persistTurn(makeInput());
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
      require.resolve('../voice-message-persistence.service'),
      'utf8',
    ) as string;
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(codeOnly).not.toMatch(/process\.env/);
    expect(codeOnly).not.toMatch(/sk-[a-zA-Z0-9]/);
  });
});
