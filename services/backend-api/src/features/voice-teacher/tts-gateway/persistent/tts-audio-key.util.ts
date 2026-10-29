import { createHash } from 'crypto';

import { TtsAudioAssetKey } from './tts-audio-asset.types';

/**
 * Bump when anything about HOW audio is produced changes without changing the inputs below
 * (chunk size, chunk stitching, output format). Old assets then stop matching and are regenerated.
 */
export const TTS_PIPELINE_VERSION = 1;
export const TTS_OUTPUT_FORMAT = 'wav';

const sha256 = (value: string): string => createHash('sha256').update(value, 'utf8').digest('hex');

/**
 * Canonical form of a script: Unicode NFC, unified line endings, collapsed spaces, trimmed lines.
 * Cosmetic whitespace edits therefore reuse the asset; any wording change does not.
 */
export function normalizeScript(script: string): string {
  return script
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t ]+/g, ' ').trim())
    .join('\n')
    .trim();
}

export function normalizeLanguage(languageCode: string): string {
  return languageCode.trim().toLowerCase();
}

export interface VoiceConfigInput {
  readonly model: string;
  readonly voice: string;
  /** Only the host is hashed, so a key rotation or path tweak does not orphan every asset. */
  readonly baseUrl: string;
}

/** Everything other than script and language that changes the sound. Never includes secrets. */
export function hashVoiceConfig(config: VoiceConfigInput): string {
  let provider = config.baseUrl;
  try {
    provider = new URL(config.baseUrl).host;
  } catch {
    // Keep the raw value: still deterministic, still distinguishes providers.
  }
  return sha256(
    JSON.stringify({
      version: TTS_PIPELINE_VERSION,
      provider,
      model: config.model,
      voice: config.voice,
      format: TTS_OUTPUT_FORMAT,
    }),
  );
}

export function buildAssetKey(script: string, languageCode: string, voice: VoiceConfigInput): TtsAudioAssetKey {
  return {
    contentHash: sha256(normalizeScript(script)),
    language: normalizeLanguage(languageCode),
    voiceConfigHash: hashVoiceConfig(voice),
  };
}

export function assetKeyId(key: TtsAudioAssetKey): string {
  return `${key.language}:${key.contentHash}:${key.voiceConfigHash}`;
}

/** Deterministic and free of student data; identical inputs always map to the same object. */
export function buildStoragePath(key: TtsAudioAssetKey): string {
  return `tts/${key.language}/${key.contentHash}/${key.voiceConfigHash.slice(0, 16)}.${TTS_OUTPUT_FORMAT}`;
}
