import { normalizeLocale, parseAcceptLanguage, resolveRequestedLocale } from './locale.util';
import { courseTextSql } from './course-text.sql';
import { LocaleResolverService } from './locale-resolver.service';
import { readLocaleContext } from './request-locale.decorator';
import { DatabaseService } from '../../database/database.service';

describe('normalizeLocale', () => {
  it('accepts supported tags case-insensitively and by base language', () => {
    expect(normalizeLocale('ar')).toBe('ar');
    expect(normalizeLocale('AR')).toBe('ar');
    expect(normalizeLocale('ar-SA')).toBe('ar');
    expect(normalizeLocale('en_US')).toBe('en');
  });

  it('rejects unsupported, malformed and non-string values', () => {
    expect(normalizeLocale('fr')).toBeNull();
    expect(normalizeLocale("ar'; DROP TABLE courses;--")).toBeNull();
    expect(normalizeLocale('')).toBeNull();
    expect(normalizeLocale(undefined)).toBeNull();
    expect(normalizeLocale(['ar'])).toBeNull();
  });
});

describe('parseAcceptLanguage', () => {
  it('picks the highest-quality supported language', () => {
    expect(parseAcceptLanguage('fr-FR,ar;q=0.8,en;q=0.5')).toBe('ar');
    expect(parseAcceptLanguage('en-US,en;q=0.9,ar;q=0.8')).toBe('en');
  });

  it('ignores unsupported languages, zero quality and garbage', () => {
    expect(parseAcceptLanguage('fr,de;q=0.7')).toBeNull();
    expect(parseAcceptLanguage('ar;q=0,en;q=0.1')).toBe('en');
    expect(parseAcceptLanguage('ar;q=abc')).toBeNull();
    expect(parseAcceptLanguage('x'.repeat(300))).toBeNull();
    expect(parseAcceptLanguage(undefined)).toBeNull();
  });
});

describe('resolveRequestedLocale precedence', () => {
  it('prefers the query parameter over Accept-Language', () => {
    expect(resolveRequestedLocale('ar', 'en')).toBe('ar');
    expect(resolveRequestedLocale('fr', 'ar')).toBe('ar');
    expect(resolveRequestedLocale(undefined, undefined)).toBeNull();
  });
});

describe('readLocaleContext', () => {
  it('reads the locale and the internal user id from the request', () => {
    expect(
      readLocaleContext({ query: { locale: 'ar' }, headers: {}, user: { id: 'jwt-id' }, resolvedInternalUserId: 'internal' }),
    ).toEqual({ requested: 'ar', userId: 'internal' });
    expect(readLocaleContext({ headers: { 'accept-language': 'ar' } })).toEqual({ requested: 'ar', userId: null });
  });
});

describe('courseTextSql', () => {
  it('builds joins that cannot multiply rows and fall back to English then legacy columns', () => {
    const sql = courseTextSql('co', '$3');
    expect(sql.joins).toContain("co_ct_req.locale = $3::text");
    expect(sql.joins).toContain("co_ct_en.locale = 'en'");
    expect(sql.title).toBe('COALESCE(co_ct_req.title, co_ct_en.title, co.title)');
    expect(sql.description).toContain('co_ct_req.id IS NOT NULL');
    expect(sql.locale).toContain("ELSE 'en'");
  });
});

describe('LocaleResolverService', () => {
  const query = jest.fn();
  const resolver = new LocaleResolverService({ query } as unknown as DatabaseService);
  const uuid = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => query.mockReset());

  it('uses the requested locale without touching the database', async () => {
    await expect(resolver.resolve({ requested: 'ar', userId: uuid })).resolves.toBe('ar');
    expect(query).not.toHaveBeenCalled();
  });

  it('falls back to the stored profile preference', async () => {
    query.mockResolvedValueOnce({ rows: [{ preferred_language: 'ar' }] });
    await expect(resolver.resolve({ requested: null, userId: uuid })).resolves.toBe('ar');
  });

  it('defaults to English for missing, invalid or failing lookups', async () => {
    query.mockResolvedValueOnce({ rows: [{ preferred_language: 'fr' }] });
    await expect(resolver.resolve({ requested: null, userId: uuid })).resolves.toBe('en');
    query.mockRejectedValueOnce(new Error('db down'));
    await expect(resolver.resolve({ requested: null, userId: uuid })).resolves.toBe('en');
    await expect(resolver.resolve({ requested: null, userId: 'not-a-uuid' })).resolves.toBe('en');
    await expect(resolver.resolve({ requested: null, userId: null })).resolves.toBe('en');
  });

  it('resolveExplicit never queries and defaults to English', () => {
    expect(resolver.resolveExplicit({ requested: null, userId: uuid })).toBe('en');
    expect(resolver.resolveExplicit({ requested: 'ar', userId: null })).toBe('ar');
    expect(query).not.toHaveBeenCalled();
  });
});
