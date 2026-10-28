import { BadRequestException } from '@nestjs/common';
import { AppVersionController } from './app-version.controller';
import { AppVersionService } from './app-version.service';

function createDb(rows: Record<string, unknown>[]) {
  return {
    query: jest.fn().mockResolvedValue({ rowCount: rows.length, rows }),
  };
}

describe('AppVersionService', () => {
  it('maps the stored policy row for the platform', async () => {
    const db = createDb([
      {
        platform: 'android',
        min_supported_version: '1.0.0',
        latest_version: '1.2.0',
        store_url: 'https://play.google.com/store/apps/details?id=en.aim.learning',
      },
    ]);
    const service = new AppVersionService(db as never);

    await expect(service.getPolicy('android')).resolves.toEqual({
      platform: 'android',
      minSupportedVersion: '1.0.0',
      latestVersion: '1.2.0',
      storeUrl: 'https://play.google.com/store/apps/details?id=en.aim.learning',
    });
    expect(db.query.mock.calls[0][1]).toEqual(['android']);
  });

  it('returns a no-update policy when the platform has no row', async () => {
    const service = new AppVersionService(createDb([]) as never);

    await expect(service.getPolicy('ios')).resolves.toEqual({
      platform: 'ios',
      minSupportedVersion: '0.0.0',
      latestVersion: '0.0.0',
      storeUrl: null,
    });
  });
});

describe('AppVersionService admin', () => {
  const androidRow = {
    platform: 'android',
    min_supported_version: '1.0.0',
    latest_version: '1.2.0',
    store_url: 'https://play.google.com/store/apps/details?id=en.aim.learning',
  };

  it('lists every platform, filling missing rows with a no-update policy', async () => {
    const service = new AppVersionService(createDb([androidRow]) as never);

    const policies = await service.listPolicies();
    expect(policies.map((p) => p.platform)).toEqual(['android', 'ios']);
    expect(policies[1]).toEqual({
      platform: 'ios',
      minSupportedVersion: '0.0.0',
      latestVersion: '0.0.0',
      storeUrl: null,
    });
  });

  it('merges a partial update over the current policy and upserts it', async () => {
    const db = {
      query: jest
        .fn()
        .mockResolvedValueOnce({ rows: [androidRow] })
        .mockResolvedValueOnce({ rows: [{ ...androidRow, latest_version: '1.3.0' }] }),
    };
    const service = new AppVersionService(db as never);

    const result = await service.updatePolicy('android', { latestVersion: '1.3.0' }, 'admin-1');

    expect(result.latestVersion).toBe('1.3.0');
    expect(db.query.mock.calls[1][1]).toEqual(['android', '1.0.0', '1.3.0', androidRow.store_url]);
  });

  it('rejects a minimum version above the latest version', async () => {
    const service = new AppVersionService(createDb([androidRow]) as never);

    await expect(
      service.updatePolicy('android', { minSupportedVersion: '2.0.0' }, 'admin-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('AppVersionController', () => {
  it('rejects a missing or unknown platform', async () => {
    const controller = new AppVersionController(new AppVersionService(createDb([]) as never));

    await expect(controller.getVersionPolicy()).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.getVersionPolicy('web')).rejects.toBeInstanceOf(BadRequestException);
  });
});
