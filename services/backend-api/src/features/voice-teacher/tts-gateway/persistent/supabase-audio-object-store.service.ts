import { Injectable, Logger } from '@nestjs/common';

import { BackendConfigService } from '../../../../config/backend-config.service';

const REQUEST_TIMEOUT_MS = 15_000;

export class AudioObjectStoreError extends Error {
  constructor(
    readonly operation: 'upload' | 'download',
    readonly status: number | null,
  ) {
    super(`Audio object store ${operation} failed${status === null ? '' : ` (HTTP ${status})`}`);
    this.name = 'AudioObjectStoreError';
  }
}

/**
 * Private Supabase Storage access over its REST API, using the service-role key. The key stays in the
 * backend; objects are only ever read here and streamed to students by the already-authorized
 * endpoint, so a Storage path is never a credential and no public or signed URL is handed out.
 * Uses the platform fetch, so no extra dependency is needed.
 */
@Injectable()
export class SupabaseAudioObjectStore {
  private readonly logger = new Logger(SupabaseAudioObjectStore.name);

  constructor(private readonly backendConfig: BackendConfigService) {}

  async put(path: string, data: Buffer, contentType: string): Promise<void> {
    const response = await this.request('upload', path, {
      method: 'POST',
      // Deterministic path + upsert makes retries idempotent.
      headers: { 'Content-Type': contentType, 'x-upsert': 'true' },
      body: data,
    });
    if (!response.ok) {
      throw new AudioObjectStoreError('upload', response.status);
    }
  }

  /** Returns null when the object does not exist; throws for any other failure so it is not mistaken for "missing". */
  async get(path: string): Promise<Buffer | null> {
    const response = await this.request('download', path, { method: 'GET' });
    if (response.ok) {
      return Buffer.from(await response.arrayBuffer());
    }
    // Storage reports a missing object as 404, or as 400 with a 404 statusCode in the body.
    if (response.status === 404 || (response.status === 400 && (await this.bodyStatus(response)) === '404')) {
      return null;
    }
    throw new AudioObjectStoreError('download', response.status);
  }

  private async request(
    operation: 'upload' | 'download',
    path: string,
    init: { method: string; headers?: Record<string, string>; body?: Buffer },
  ): Promise<Response> {
    const { url, serviceRoleKey } = this.backendConfig.supabase;
    const bucket = this.backendConfig.ttsProvider.audioBucket;
    const objectPath = path.split('/').map(encodeURIComponent).join('/');
    const endpoint = `${url.replace(/\/+$/, '')}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      return await fetch(endpoint, {
        method: init.method,
        headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey, ...init.headers },
        body: init.body ? new Uint8Array(init.body) : undefined,
        signal: controller.signal,
      });
    } catch {
      // Never log the URL, headers or key.
      this.logger.warn(`SupabaseAudioObjectStore.${operation}: network error or timeout`);
      throw new AudioObjectStoreError(operation, null);
    } finally {
      clearTimeout(timer);
    }
  }

  private async bodyStatus(response: Response): Promise<string | null> {
    try {
      const body = (await response.json()) as { statusCode?: string | number };
      return body.statusCode === undefined ? null : String(body.statusCode);
    } catch {
      return null;
    }
  }
}
