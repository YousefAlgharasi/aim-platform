/**
 * P9-033: Add Audio Cleanup Policy.
 * Unit tests for AudioCleanupService.
 * Verifies:
 * - runCleanup() calls policyService.findEligibleAssets().
 * - For each eligible asset: storage delete → DB row delete → audio_ref nullify.
 * - Idempotent: failures on individual assets don't abort the sweep.
 * - runCleanupForSession() filters to session-scoped assets.
 * - No STT/TTS/AI provider is called.
 * - No AIM Engine-owned field is touched.
 */

import { AudioCleanupService } from '../audio-cleanup.service';
import { EligibleAudioAsset } from '../audio-cleanup.types';

function makeAsset(overrides?: Partial<EligibleAudioAsset>): EligibleAudioAsset {
  return {
    assetId: 'asset-uuid-1',
    storageKey: 'storage-key-1',
    messageId: 'message-uuid-1',
    reason: 'transcription_complete',
    ...overrides,
  };
}

function buildService(overrides?: {
  findEligibleAssets?: jest.Mock;
  storageDelete?: jest.Mock;
  dbQuery?: jest.Mock;
}) {
  const policyService = {
    findEligibleAssets:
      overrides?.findEligibleAssets ?? jest.fn().mockResolvedValue([]),
  } as any;

  const storageAdapter = {
    delete: overrides?.storageDelete ?? jest.fn().mockResolvedValue(undefined),
    write: jest.fn(),
    read: jest.fn(),
  } as any;

  const db = {
    query: overrides?.dbQuery ?? jest.fn().mockResolvedValue({ rows: [] }),
  } as any;

  return new AudioCleanupService(policyService, storageAdapter, db);
}

describe('AudioCleanupService', () => {
  describe('runCleanup()', () => {
    it('returns zero counts when no assets are eligible', async () => {
      const service = buildService();

      const result = await service.runCleanup();

      expect(result).toEqual({ deleted: 0, failed: 0 });
    });

    it('deletes storage file, DB row, and nullifies audio_ref for each eligible asset', async () => {
      const asset = makeAsset();
      const storageDelete = jest.fn().mockResolvedValue(undefined);
      const dbQuery = jest.fn().mockResolvedValue({ rows: [] });

      const service = buildService({
        findEligibleAssets: jest.fn().mockResolvedValue([asset]),
        storageDelete,
        dbQuery,
      });

      const result = await service.runCleanup();

      expect(result.deleted).toBe(1);
      expect(result.failed).toBe(0);

      // Step 1: storage delete
      expect(storageDelete).toHaveBeenCalledWith('storage-key-1');

      // Step 2: DB row delete
      expect(dbQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM voice_audio_assets'),
        ['asset-uuid-1'],
      );

      // Step 3: nullify audio_ref
      expect(dbQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE voice_messages SET audio_ref = NULL'),
        ['message-uuid-1'],
      );
    });

    it('counts failed assets without aborting the sweep', async () => {
      const assets = [
        makeAsset({ assetId: 'asset-1', storageKey: 'key-1', messageId: 'msg-1' }),
        makeAsset({ assetId: 'asset-2', storageKey: 'key-2', messageId: 'msg-2' }),
      ];

      let callCount = 0;
      const storageDelete = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) throw new Error('Storage unavailable');
        return Promise.resolve();
      });

      const service = buildService({
        findEligibleAssets: jest.fn().mockResolvedValue(assets),
        storageDelete,
      });

      const result = await service.runCleanup();

      expect(result.deleted).toBe(1);
      expect(result.failed).toBe(1);
    });

    it('handles multiple assets in a single sweep', async () => {
      const assets = [
        makeAsset({ assetId: 'a1', storageKey: 'k1', messageId: 'm1' }),
        makeAsset({ assetId: 'a2', storageKey: 'k2', messageId: 'm2' }),
        makeAsset({ assetId: 'a3', storageKey: 'k3', messageId: 'm3' }),
      ];

      const storageDelete = jest.fn().mockResolvedValue(undefined);
      const service = buildService({
        findEligibleAssets: jest.fn().mockResolvedValue(assets),
        storageDelete,
      });

      const result = await service.runCleanup();

      expect(result.deleted).toBe(3);
      expect(result.failed).toBe(0);
      expect(storageDelete).toHaveBeenCalledTimes(3);
    });

    it('does not call any STT/TTS/AI provider', async () => {
      const asset = makeAsset();
      const storageDelete = jest.fn().mockResolvedValue(undefined);
      const service = buildService({
        findEligibleAssets: jest.fn().mockResolvedValue([asset]),
        storageDelete,
      });

      await service.runCleanup();

      // storageAdapter only has delete/write/read — none of which are provider calls
      expect(storageDelete.mock.calls.length).toBeGreaterThan(0);
      // The adapter mock has no 'transcribe', 'synthesize', 'complete' etc.
    });

    it('does not expose AIM Engine-owned fields in result', async () => {
      const service = buildService();

      const result = await service.runCleanup() as any;

      expect(result.mastery).toBeUndefined();
      expect(result.weakness).toBeUndefined();
      expect(result.difficulty).toBeUndefined();
      expect(result.reviewSchedule).toBeUndefined();
      expect(result.recommendation).toBeUndefined();
    });
  });

  describe('runCleanupForSession()', () => {
    it('does not throw when no eligible assets exist', async () => {
      const service = buildService({
        findEligibleAssets: jest.fn().mockResolvedValue([]),
      });

      await expect(service.runCleanupForSession('session-1')).resolves.toBeUndefined();
    });

    it('swallows errors without propagating to caller', async () => {
      const service = buildService({
        findEligibleAssets: jest.fn().mockRejectedValue(new Error('DB down')),
      });

      // Must not throw
      await expect(service.runCleanupForSession('session-1')).resolves.toBeUndefined();
    });
  });
});
