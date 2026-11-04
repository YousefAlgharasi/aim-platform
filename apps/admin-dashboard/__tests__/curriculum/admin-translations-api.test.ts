import {
  deleteTranslation,
  fetchTranslations,
  saveTranslation,
  saveTranslations,
  translationsPath,
} from '../../features/content/api/admin-translations-api';
import { adminApiClient } from '../../core/api';

jest.mock('../../core/api', () => ({
  adminApiClient: { get: jest.fn(), put: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

const client = adminApiClient as unknown as Record<'get' | 'put' | 'delete', jest.Mock>;

beforeEach(() => jest.clearAllMocks());

describe('generic translations API', () => {
  it.each([
    ['lessons', 'lessonId'],
    ['chapters', 'chapterId'],
    ['courses', 'courseId'],
  ] as const)('fetches %s translations from the %s response key', async (entity, idKey) => {
    client.get.mockImplementation(async (_path: string, decode: (v: unknown) => unknown) => ({
      data: decode({
        [idKey]: 'e1',
        supportedLocales: ['en', 'ar'],
        missingLocales: ['ar'],
        translations: [{ locale: 'en', title: 'T', description: null, createdAt: 'x', updatedAt: 'y' }],
      }),
    }));
    const data = await fetchTranslations(entity, 'tok', 'e1');
    expect(client.get.mock.calls[0][0]).toBe(`/curriculum/${entity}/e1/translations`);
    expect(client.get.mock.calls[0][2].headers.authorization).toBe('Bearer tok');
    expect(data.entityId).toBe('e1');
    expect(data.missingLocales).toEqual(['ar']);
    expect(data.translations[0]).toEqual({ locale: 'en', title: 'T', description: null });
  });

  it('rejects a response that uses the wrong id key for the entity', async () => {
    client.get.mockImplementation(async (_path: string, decode: (v: unknown) => unknown) => ({
      data: decode({ courseId: 'e1', translations: [] }),
    }));
    await expect(fetchTranslations('lessons', 'tok', 'e1')).rejects.toThrow(
      'Invalid lesson translations response shape.',
    );
  });

  it('builds encoded paths for each entity and locale', () => {
    expect(translationsPath('chapters', 'a b')).toBe('/curriculum/chapters/a%20b/translations');
    expect(translationsPath('lessons', 'l1', 'ar')).toBe('/curriculum/lessons/l1/translations/ar');
  });

  it('saves with PUT to the entity locale path', async () => {
    client.put.mockImplementation(async (_p: string, decode: (v: unknown) => unknown) => ({
      data: decode({ locale: 'ar', title: 'ع', description: 'و' }),
    }));
    await saveTranslation('lessons', 'tok', 'l1', 'ar', { title: 'ع', description: 'و' });
    expect(client.put.mock.calls[0][0]).toBe('/curriculum/lessons/l1/translations/ar');
    expect(client.put.mock.calls[0][2].body).toEqual({ title: 'ع', description: 'و' });
  });

  it('deletes with DELETE', async () => {
    client.delete.mockImplementation(async (_p: string, decode: (v: unknown) => unknown) => ({
      data: decode({ locale: 'ar' }),
    }));
    await deleteTranslation('chapters', 'tok', 'c1', 'ar');
    expect(client.delete.mock.calls[0][0]).toBe('/curriculum/chapters/c1/translations/ar');
  });

  it('saves several translations and reports each failure without stopping', async () => {
    client.put
      .mockRejectedValueOnce(new Error('boom'))
      .mockImplementationOnce(async (_p: string, decode: (v: unknown) => unknown) => ({
        data: decode({ locale: 'fr', title: 'F' }),
      }));
    const result = await saveTranslations('lessons', 'tok', 'l1', {
      ar: { title: 'ع', description: null },
      fr: { title: 'F', description: null },
    });
    expect(result.failures).toEqual([{ locale: 'ar', message: 'boom' }]);
    expect(client.put).toHaveBeenCalledTimes(2);
  });

  it('decodes availableLocales on chapter and lesson summaries and defaults to an empty list', async () => {
    const { fetchAdminChapters } = await import('../../features/content/api/admin-chapters-api');
    const { fetchAdminLessons } = await import('../../features/content/api/admin-lessons-api');
    client.get.mockImplementationOnce(async (_p: string, decode: (v: unknown) => unknown) => ({
      data: decode({ chapters: [{ id: 'c1', title: 'C', availableLocales: ['en', 'ar'] }, { id: 'c2', title: 'D' }], total: 2 }),
    }));
    const chapters = await fetchAdminChapters('tok', 'lv1', 1, 20);
    expect(chapters.chapters[0].availableLocales).toEqual(['en', 'ar']);
    expect(chapters.chapters[1].availableLocales).toEqual([]);

    client.get.mockImplementationOnce(async (_p: string, decode: (v: unknown) => unknown) => ({
      data: decode({ lessons: [{ id: 'l1', title: 'L', availableLocales: ['en'] }], total: 1 }),
    }));
    const lessons = await fetchAdminLessons({ token: 'tok', chapterId: 'c1' });
    expect(lessons.lessons[0].availableLocales).toEqual(['en']);
  });
});
