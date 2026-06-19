/**
 * P9-031: Add Audio Storage Adapter.
 * Local-disk implementation of `AudioStorageAdapter`, used for
 * development and single-instance deployment. Writes raw audio bytes
 * only under the configured storage directory (default
 * `services/backend-api/var/voice-audio-storage`, gitignored — see
 * root `.gitignore`) and returns an opaque, randomly generated
 * `storageKey` — never a filesystem path — so callers can persist it
 * in `voice_audio_assets.storage_key` without ever exposing a path to
 * the client (docs/phase-9/voice-privacy-policy.md "Raw Audio
 * Handling Rules").
 *
 * Every `storageKey` passed into `read`/`delete` is validated against
 * the expected UUID shape and resolved path is checked to stay inside
 * the storage directory before any filesystem call, so a malformed or
 * malicious key can never escape the storage directory (path
 * traversal). No generated audio file is ever written inside a
 * git-tracked path, so nothing here is committed to the repository.
 *
 * A future object-storage adapter (e.g. S3-compatible) can implement
 * the same `AudioStorageAdapter` contract and be bound to
 * `AUDIO_STORAGE_ADAPTER` in `audio-storage.module.ts` instead, with
 * no change required in any caller.
 */
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

import { AudioStorageAdapter } from './audio-storage.adapter';
import { AudioStorageConfigService } from './audio-storage.config';
import {
  AudioStorageReadResult,
  AudioStorageWriteInput,
  AudioStorageWriteResult,
} from './audio-storage.types';

const STORAGE_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

@Injectable()
export class LocalAudioStorageAdapter implements AudioStorageAdapter {
  constructor(private readonly config: AudioStorageConfigService) {}

  async write(
    input: AudioStorageWriteInput,
  ): Promise<AudioStorageWriteResult> {
    const dir = this.config.getStorageDir();
    await fs.mkdir(dir, { recursive: true });

    const storageKey = randomUUID();
    const filePath = this.resolveSafePath(dir, storageKey);

    await fs.writeFile(filePath, input.data, { mode: 0o600 });
    await fs.writeFile(
      this.metaPath(filePath),
      JSON.stringify({ contentType: input.contentType }),
      { mode: 0o600 },
    );

    return { storageKey, byteLength: input.data.length };
  }

  async read(storageKey: string): Promise<AudioStorageReadResult | null> {
    const dir = this.config.getStorageDir();
    const filePath = this.resolveSafePath(dir, storageKey);

    try {
      const [data, metaRaw] = await Promise.all([
        fs.readFile(filePath),
        fs.readFile(this.metaPath(filePath), 'utf8'),
      ]);
      const meta = JSON.parse(metaRaw) as { contentType: string };
      return { data, contentType: meta.contentType };
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw err;
    }
  }

  async delete(storageKey: string): Promise<void> {
    const dir = this.config.getStorageDir();
    const filePath = this.resolveSafePath(dir, storageKey);

    await Promise.allSettled([
      fs.unlink(filePath),
      fs.unlink(this.metaPath(filePath)),
    ]);
  }

  private metaPath(filePath: string): string {
    return `${filePath}.meta.json`;
  }

  private resolveSafePath(dir: string, storageKey: string): string {
    if (!STORAGE_KEY_PATTERN.test(storageKey)) {
      throw new Error('Invalid storage key');
    }

    const resolvedDir = path.resolve(dir);
    const resolvedFile = path.resolve(resolvedDir, storageKey);

    if (!resolvedFile.startsWith(resolvedDir + path.sep)) {
      throw new Error('Invalid storage key');
    }

    return resolvedFile;
  }
}
