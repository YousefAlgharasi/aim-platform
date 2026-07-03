import { VoiceAudioSubmitController } from '../voice-audio-submit.controller';
import { VoiceSessionRepository } from '../../repositories/voice-session.repository';
import { VoiceOrchestratorService } from '../../orchestrator/voice-orchestrator.service';

describe('VoiceAudioSubmitController', () => {
  let controller: VoiceAudioSubmitController;
  let voiceSessionRepository: jest.Mocked<VoiceSessionRepository>;
  let voiceOrchestrator: jest.Mocked<VoiceOrchestratorService>;

  beforeEach(() => {
    voiceSessionRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'session-1',
        student_id: 'student-1',
        context_ref: 'lesson:abc',
        status: 'active',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      }),
    } as any;
    voiceOrchestrator = {
      handleTurn: jest.fn().mockResolvedValue({
        text: 'AI Teacher reply',
        audioRef: 'tts_ref_123',
        isFallback: false,
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        latencyMs: 250,
      }),
    } as any;
    controller = new VoiceAudioSubmitController(voiceSessionRepository, voiceOrchestrator);
  });

  const mockUser = { id: 'student-1', email: 'test@test.com' } as any;

  it('should return fallback when no file is provided', async () => {
    const result = await controller.submitAudio('session-1', mockUser, null as any);
    expect(result.isFallback).toBe(true);
    expect(result.audioRef).toBeNull();
  });

  it('should return fallback when file buffer is empty', async () => {
    const file = { buffer: Buffer.alloc(0), mimetype: 'audio/webm' } as any;
    const result = await controller.submitAudio('session-1', mockUser, file);
    expect(result.isFallback).toBe(true);
  });

  it('should return fallback for unsupported audio type', async () => {
    const file = { buffer: Buffer.from('data'), mimetype: 'text/html' } as any;
    const result = await controller.submitAudio('session-1', mockUser, file);
    expect(result.isFallback).toBe(true);
    expect(result.text).toContain('غير مدعوم');
  });

  it('should accept valid audio/webm file', async () => {
    const file = { buffer: Buffer.from('audio-data'), mimetype: 'audio/webm' } as any;
    const result = await controller.submitAudio('session-1', mockUser, file);
    expect(result).toBeDefined();
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('should never include provider credentials in response', async () => {
    const file = { buffer: Buffer.from('audio-data'), mimetype: 'audio/mpeg' } as any;
    const result = await controller.submitAudio('session-1', mockUser, file);
    const json = JSON.stringify(result);
    expect(json).not.toContain('apiKey');
    expect(json).not.toContain('provider');
  });
});
