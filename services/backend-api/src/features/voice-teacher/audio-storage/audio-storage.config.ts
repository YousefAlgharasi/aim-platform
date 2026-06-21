/**
 * P9-031: Add Audio Storage Adapter.
 * Safe-config accessor for the local-disk AudioStorageAdapter
 * implementation. Resolves only a backend-local directory path, from
 * the `VOICE_AUDIO_STORAGE_DIR` environment variable if set, otherwise
 * a default under this service (`services/backend-api/var/
 * voice-audio-storage`, excluded from version control by the root
 * `.gitignore`). This is not a provider credential: no API key,
 * secret, or external endpoint is read or stored here —
 * docs/phase-9/no-client-provider-rule.md scopes provider-credential
 * handling to STT/TTS/AI providers, not raw byte storage.
 */
import { Injectable } from '@nestjs/common';
import * as path from 'path';

const DEFAULT_STORAGE_DIR = path.resolve(
  __dirname,
  '../../../../var/voice-audio-storage',
);

@Injectable()
export class AudioStorageConfigService {
  getStorageDir(): string {
    const configured = process.env.VOICE_AUDIO_STORAGE_DIR;
    if (configured && configured.trim().length > 0) {
      return path.resolve(configured);
    }
    return DEFAULT_STORAGE_DIR;
  }
}
