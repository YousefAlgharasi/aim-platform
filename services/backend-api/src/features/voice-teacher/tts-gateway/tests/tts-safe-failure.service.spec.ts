import { TtsSafeFailureService } from '../tts-safe-failure.service';
import { TTS_SAFE_FALLBACK_MESSAGE } from '../tts-safe-failure.constants';
import { TtsProviderResponse } from '../tts-gateway.types';

describe('TtsSafeFailureService', () => {
  let service: TtsSafeFailureService;

  beforeEach(() => {
    service = new TtsSafeFailureService();
  });

  it('should return audioRef on success', () => {
    const response: TtsProviderResponse = {
      status: 'success',
      audioRef: 'tts_ref_123',
      durationMs: 2000,
      contentType: 'audio/mpeg',
    };
    const outcome = service.toSafeOutcome(response);
    expect(outcome.audioRef).toBe('tts_ref_123');
    expect(outcome.isFallback).toBe(false);
    expect(outcome.message).toBeNull();
  });

  it('should return fallback on error status', () => {
    const response: TtsProviderResponse = {
      status: 'error',
      audioRef: null,
      durationMs: null,
      contentType: null,
      errorCategory: 'TTS_PROVIDER_ERROR',
    };
    const outcome = service.toSafeOutcome(response);
    expect(outcome.audioRef).toBeNull();
    expect(outcome.isFallback).toBe(true);
    expect(outcome.message).toBe(TTS_SAFE_FALLBACK_MESSAGE);
  });

  it('should return fallback on timeout status', () => {
    const response: TtsProviderResponse = {
      status: 'timeout',
      audioRef: null,
      durationMs: null,
      contentType: null,
    };
    const outcome = service.toSafeOutcome(response);
    expect(outcome.isFallback).toBe(true);
  });

  it('should return fallback when success but audioRef is null', () => {
    const response: TtsProviderResponse = {
      status: 'success',
      audioRef: null,
      durationMs: null,
      contentType: null,
    };
    const outcome = service.toSafeOutcome(response);
    expect(outcome.isFallback).toBe(true);
    expect(outcome.message).toBe(TTS_SAFE_FALLBACK_MESSAGE);
  });

  it('should never expose provider error details in message', () => {
    const response: TtsProviderResponse = {
      status: 'error',
      audioRef: null,
      durationMs: null,
      contentType: null,
      errorCategory: 'SOME_INTERNAL_ERROR',
    };
    const outcome = service.toSafeOutcome(response);
    expect(outcome.message).not.toContain('SOME_INTERNAL_ERROR');
  });
});
