import { apiClient } from '../api/client';
import { setCurrentLocale } from '../i18n';

function okResponse(data: unknown) {
  return { ok: true, status: 200, statusText: 'OK', json: async () => ({ success: true, data }) } as Response;
}

describe('apiClient locale header', () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue(okResponse({}));
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    setCurrentLocale('en');
  });

  function sentHeaders(): Record<string, string> {
    return fetchMock.mock.calls[0][1].headers;
  }

  it('sends the active Arabic locale on every request', async () => {
    setCurrentLocale('ar');
    await apiClient.get('/student/courses');
    expect(sentHeaders()['Accept-Language']).toBe('ar');
  });

  it('sends English when the active locale is English', async () => {
    setCurrentLocale('en');
    await apiClient.get('/enrollment/current');
    expect(sentHeaders()['Accept-Language']).toBe('en');
  });

  it('follows a language switch without recreating the client', async () => {
    setCurrentLocale('en');
    await apiClient.get('/student/courses');
    setCurrentLocale('ar');
    await apiClient.get('/student/courses');
    expect(fetchMock.mock.calls[0][1].headers['Accept-Language']).toBe('en');
    expect(fetchMock.mock.calls[1][1].headers['Accept-Language']).toBe('ar');
  });

  it('also sends it on writes and unauthenticated calls, without changing the URL', async () => {
    setCurrentLocale('ar');
    await apiClient.post('/courses/abc/enroll', {});
    await apiClient.get('/certificates/abc/verify', { auth: false });
    for (const call of fetchMock.mock.calls) {
      expect(call[1].headers['Accept-Language']).toBe('ar');
      expect(String(call[0])).not.toContain('locale=');
    }
  });
});
