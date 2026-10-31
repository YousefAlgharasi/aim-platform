import {
  deleteCourseTranslation,
  fetchAdminCourses,
  fetchCourseTranslations,
  saveCourseTranslation,
  saveCourseTranslations,
} from '../../features/content/api/admin-courses-api';
import { adminApiClient } from '../../core/api';

jest.mock('../../core/api', () => ({
  adminApiClient: { get: jest.fn(), put: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

const client = adminApiClient as unknown as Record<'get' | 'put' | 'delete', jest.Mock>;

beforeEach(() => jest.clearAllMocks());

describe('course translations API client', () => {
  it('decodes availableLocales on course summaries and defaults to an empty list', async () => {
    client.get.mockImplementation(async (_path: string, decode: (v: unknown) => unknown) => ({
      data: decode({
        courses: [
          { id: 'a', title: 'A', availableLocales: ['en', 'ar', 7] },
          { id: 'b', title: 'B' },
        ],
        total: 2,
      }),
    }));
    const result = await fetchAdminCourses('tok');
    expect(result.courses[0].availableLocales).toEqual(['en', 'ar']);
    expect(result.courses[1].availableLocales).toEqual([]);
  });

  it('fetches every translation for a course', async () => {
    client.get.mockImplementation(async (_path: string, decode: (v: unknown) => unknown) => ({
      data: decode({
        courseId: 'c1',
        supportedLocales: ['en', 'ar'],
        missingLocales: ['ar'],
        translations: [{ locale: 'en', title: 'T', description: null }],
      }),
    }));
    const data = await fetchCourseTranslations('tok', 'c1');
    expect(client.get.mock.calls[0][0]).toBe('/curriculum/courses/c1/translations');
    expect(client.get.mock.calls[0][2].headers.authorization).toBe('Bearer tok');
    expect(data.missingLocales).toEqual(['ar']);
    expect(data.translations[0]).toEqual({ locale: 'en', title: 'T', description: null });
  });

  it('rejects malformed translation payloads', async () => {
    client.get.mockImplementation(async (_path: string, decode: (v: unknown) => unknown) => ({ data: decode({ nope: true }) }));
    await expect(fetchCourseTranslations('tok', 'c1')).rejects.toThrow('Invalid course translations response shape.');
  });

  it('saves with PUT to the locale path and encodes path segments', async () => {
    client.put.mockImplementation(async (_path: string, decode: (v: unknown) => unknown) => ({
      data: decode({ locale: 'ar', title: 'ع', description: 'و' }),
    }));
    await saveCourseTranslation('tok', 'c 1', 'ar', { title: 'ع', description: 'و' });
    expect(client.put.mock.calls[0][0]).toBe('/curriculum/courses/c%201/translations/ar');
    expect(client.put.mock.calls[0][2].body).toEqual({ title: 'ع', description: 'و' });
  });

  it('deletes with DELETE', async () => {
    client.delete.mockImplementation(async (_path: string, decode: (v: unknown) => unknown) => ({ data: decode({ locale: 'ar' }) }));
    await deleteCourseTranslation('tok', 'c1', 'ar');
    expect(client.delete.mock.calls[0][0]).toBe('/curriculum/courses/c1/translations/ar');
  });

  it('saves several translations and reports each failure without stopping', async () => {
    client.put
      .mockRejectedValueOnce(new Error('boom'))
      .mockImplementationOnce(async (_p: string, decode: (v: unknown) => unknown) => ({ data: decode({ locale: 'fr', title: 'F' }) }));
    const result = await saveCourseTranslations('tok', 'c1', {
      ar: { title: 'ع', description: null },
      fr: { title: 'F', description: null },
    });
    expect(result.failures).toEqual([{ locale: 'ar', message: 'boom' }]);
    expect(client.put).toHaveBeenCalledTimes(2);
  });
});
