/**
 * P9-031: Add Audio Storage Adapter.
 * Abstract backend audio storage contract. Callers (Group D audio
 * upload persistence, Group G TTS reply persistence) depend only on
 * this abstract class and the `AUDIO_STORAGE_ADAPTER` injection token,
 * never on a concrete storage implementation, so the backing store
 * (local disk now; an object-storage provider later) can change
 * without any caller-side change.
 *
 * `write` returns only an opaque `storageKey` — the same internal
 * reference persisted in `voice_audio_assets.storage_key`
 * (prisma/migrations/20260619002000_create_voice_audio_assets_table)
 * — never a raw filesystem path or a public/signed URL, per
 * docs/phase-9/voice-privacy-policy.md "Raw Audio Handling Rules".
 * Implementations must never log raw audio bytes (Phase 9 Logging
 * Rules) and must never accept or expose STT/TTS/AI provider
 * credentials — this adapter is a plain byte store, not a provider
 * call, so it is unaffected by docs/phase-9/no-client-provider-rule.md.
 */
import {
  AudioStorageReadResult,
  AudioStorageWriteInput,
  AudioStorageWriteResult,
} from './audio-storage.types';

export const AUDIO_STORAGE_ADAPTER = Symbol('AUDIO_STORAGE_ADAPTER');

export abstract class AudioStorageAdapter {
  abstract write(
    input: AudioStorageWriteInput,
  ): Promise<AudioStorageWriteResult>;

  abstract read(storageKey: string): Promise<AudioStorageReadResult | null>;

  abstract delete(storageKey: string): Promise<void>;
}
