// P9-056: Add Voice Fallback to Text Policy tests.

import { VoiceFallbackToTextPolicyService } from '../voice-fallback-to-text-policy.service';

describe('VoiceFallbackToTextPolicyService', () => {
  it('returns the audioRef and isFallbackToText=false when TTS succeeded with a usable audioRef', () => {
    const service = new VoiceFallbackToTextPolicyService();

    const result = service.resolveTurnOutput({
      replyText: 'One half plus one quarter is three quarters.',
      ttsSucceeded: true,
      audioRef: 'voice-audio-ref-1',
    });

    expect(result).toEqual({
      text: 'One half plus one quarter is three quarters.',
      audioRef: 'voice-audio-ref-1',
      isFallbackToText: false,
    });
  });

  it('falls back to text-only when ttsSucceeded is false', () => {
    const service = new VoiceFallbackToTextPolicyService();

    const result = service.resolveTurnOutput({
      replyText: 'One half plus one quarter is three quarters.',
      ttsSucceeded: false,
      audioRef: null,
    });

    expect(result).toEqual({
      text: 'One half plus one quarter is three quarters.',
      audioRef: null,
      isFallbackToText: true,
    });
  });

  it('falls back to text-only when ttsSucceeded is true but no audioRef is present', () => {
    const service = new VoiceFallbackToTextPolicyService();

    const result = service.resolveTurnOutput({
      replyText: 'One half plus one quarter is three quarters.',
      ttsSucceeded: true,
      audioRef: null,
    });

    expect(result.audioRef).toBeNull();
    expect(result.isFallbackToText).toBe(true);
  });

  it('falls back to text-only when audioRef is an empty/whitespace string', () => {
    const service = new VoiceFallbackToTextPolicyService();

    const result = service.resolveTurnOutput({
      replyText: 'One half plus one quarter is three quarters.',
      ttsSucceeded: true,
      audioRef: '   ',
    });

    expect(result.audioRef).toBeNull();
    expect(result.isFallbackToText).toBe(true);
  });

  it('falls back to text-only when audioRef is omitted entirely', () => {
    const service = new VoiceFallbackToTextPolicyService();

    const result = service.resolveTurnOutput({
      replyText: 'One half plus one quarter is three quarters.',
      ttsSucceeded: true,
    });

    expect(result.audioRef).toBeNull();
    expect(result.isFallbackToText).toBe(true);
  });

  it('never returns a broken/placeholder audioRef on fallback', () => {
    const service = new VoiceFallbackToTextPolicyService();

    const result = service.resolveTurnOutput({
      replyText: 'Safe reply text.',
      ttsSucceeded: false,
      audioRef: 'should-be-ignored',
    });

    expect(result.audioRef).toBeNull();
  });

  it('throws and never returns a result when replyText is missing', () => {
    const service = new VoiceFallbackToTextPolicyService();

    expect(() =>
      service.resolveTurnOutput({ replyText: '', ttsSucceeded: true, audioRef: 'ref-1' }),
    ).toThrow(/replyText is missing/);
  });

  it('throws when replyText is only whitespace', () => {
    const service = new VoiceFallbackToTextPolicyService();

    expect(() =>
      service.resolveTurnOutput({ replyText: '   ', ttsSucceeded: false, audioRef: null }),
    ).toThrow(/replyText is missing/);
  });

  it('never computes a mastery, level, weakness, difficulty, recommendation, or review-schedule value', () => {
    const service = new VoiceFallbackToTextPolicyService();

    const result = service.resolveTurnOutput({
      replyText: 'Safe reply text.',
      ttsSucceeded: false,
      audioRef: null,
    });
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
      require.resolve('../voice-fallback-to-text-policy.service'),
      'utf8',
    ) as string;
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(codeOnly).not.toMatch(/process\.env/);
    expect(codeOnly).not.toMatch(/sk-[a-zA-Z0-9]/);
  });
});
