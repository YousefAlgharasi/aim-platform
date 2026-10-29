import { AudioObjectStoreError, SupabaseAudioObjectStore } from '../supabase-audio-object-store.service';

describe('SupabaseAudioObjectStore', () => {
  const SERVICE_KEY = 'service-role-secret';
  const store = new SupabaseAudioObjectStore({
    supabase: { url: 'https://abc.supabase.co/', serviceRoleKey: SERVICE_KEY },
    ttsProvider: { audioBucket: 'tts-audio' },
  } as any);
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy?.mockRestore());

  const respond = (status: number, body: BodyInit | null = null) =>
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(body, { status }));

  it('uploads privately with the service key, upserting a deterministic path', async () => {
    fetchSpy = respond(200, '{}');
    await store.put('tts/en/abc/def.wav', Buffer.from('x'), 'audio/wav');

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://abc.supabase.co/storage/v1/object/tts-audio/tts/en/abc/def.wav');
    expect(url).not.toContain('/public/'); // never the public route
    expect((init as RequestInit).method).toBe('POST');
    expect((init as any).headers['x-upsert']).toBe('true');
    expect((init as any).headers.Authorization).toBe(`Bearer ${SERVICE_KEY}`);
  });

  it('downloads through the authenticated route', async () => {
    fetchSpy = respond(200, 'bytes');
    expect((await store.get('tts/en/a/b.wav'))?.toString()).toBe('bytes');
    expect(fetchSpy.mock.calls[0][0]).toContain('/storage/v1/object/tts-audio/');
    expect(fetchSpy.mock.calls[0][0]).not.toContain('/sign/');
  });

  it('maps both forms of "not found" to null', async () => {
    fetchSpy = respond(404, '{}');
    expect(await store.get('p')).toBeNull();
    fetchSpy.mockRestore();
    fetchSpy = respond(400, JSON.stringify({ statusCode: '404', error: 'not_found' }));
    expect(await store.get('p')).toBeNull();
  });

  it('throws (rather than reporting "missing") for server errors, auth errors and network failures', async () => {
    fetchSpy = respond(500);
    await expect(store.get('p')).rejects.toBeInstanceOf(AudioObjectStoreError);
    fetchSpy.mockRestore();
    fetchSpy = respond(401);
    await expect(store.get('p')).rejects.toBeInstanceOf(AudioObjectStoreError);
    fetchSpy.mockRestore();
    fetchSpy = jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('network'));
    await expect(store.put('p', Buffer.from('x'), 'audio/wav')).rejects.toBeInstanceOf(AudioObjectStoreError);
  });

  it('never includes the service key in a thrown error', async () => {
    fetchSpy = respond(500);
    const error = await store.get('p').catch((e: Error) => e);
    expect(String(error)).not.toContain(SERVICE_KEY);
  });
});
