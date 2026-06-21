// P9-031: Add Audio Storage Adapter.
// Verifies LocalAudioStorageAdapter round-trips audio bytes via an
// opaque storageKey only (never a path), isolates every write under
// the configured directory, rejects path-traversal/malformed storage
// keys before touching the filesystem, and supports delete. Uses an
// os.tmpdir() directory so no generated audio file is ever written
// inside the repo working tree.

import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

import { AudioStorageConfigService } from '../audio-storage.config';
import { LocalAudioStorageAdapter } from '../local-audio-storage.adapter';

describe('LocalAudioStorageAdapter', () => {
  let tmpDir: string;
  let adapter: LocalAudioStorageAdapter;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'voice-audio-storage-spec-'),
    );
    const config = {
      getStorageDir: () => tmpDir,
    } as AudioStorageConfigService;
    adapter = new LocalAudioStorageAdapter(config);
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('writes audio bytes and returns an opaque storage key, not a path', async () => {
    const data = Buffer.from('fake-audio-bytes');

    const result = await adapter.write({
      studentId: 'student-1',
      contentType: 'audio/mpeg',
      data,
    });

    expect(result.byteLength).toBe(data.length);
    expect(result.storageKey).not.toContain('/');
    expect(result.storageKey).not.toContain(tmpDir);
  });

  it('reads back exactly what was written, with content type', async () => {
    const data = Buffer.from('round-trip-bytes');
    const { storageKey } = await adapter.write({
      studentId: 'student-1',
      contentType: 'audio/mpeg',
      data,
    });

    const result = await adapter.read(storageKey);

    expect(result?.data.equals(data)).toBe(true);
    expect(result?.contentType).toBe('audio/mpeg');
  });

  it('returns null when reading an unknown storage key', async () => {
    const result = await adapter.read('11111111-1111-1111-1111-111111111111');
    expect(result).toBeNull();
  });

  it('deletes a stored asset so it can no longer be read', async () => {
    const { storageKey } = await adapter.write({
      studentId: 'student-1',
      contentType: 'audio/wav',
      data: Buffer.from('to-delete'),
    });

    await adapter.delete(storageKey);

    expect(await adapter.read(storageKey)).toBeNull();
  });

  it('rejects a storage key containing path traversal characters', async () => {
    await expect(adapter.read('../../etc/passwd')).rejects.toThrow(
      'Invalid storage key',
    );
    await expect(adapter.delete('../../etc/passwd')).rejects.toThrow(
      'Invalid storage key',
    );
  });

  it('rejects a malformed (non-UUID) storage key', async () => {
    await expect(adapter.read('not-a-uuid')).rejects.toThrow(
      'Invalid storage key',
    );
  });

  it('writes every file as a direct child of the storage directory only', async () => {
    await adapter.write({
      studentId: 'student-1',
      contentType: 'audio/wav',
      data: Buffer.from('contain-me'),
    });

    const entries = await fs.readdir(tmpDir);
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(entry).not.toContain('/');
      expect(entry).not.toContain('..');
    }
  });
});
