import { SkillTitlesService } from './skill-titles.service';

describe('SkillTitlesService', () => {
  it('returns the published skills as key + title only', async () => {
    const rows = [
      { key: 'en.a1.pho.short_vowels', title: 'Short Vowel Sounds' },
      { key: 'en.a1.spe.introduce_self', title: 'Introduce Yourself' },
    ];
    const db = { query: jest.fn().mockResolvedValue({ rows }) };

    const result = await new SkillTitlesService(db as never).list();

    expect(result).toEqual(rows);
    expect(db.query.mock.calls[0][0]).toContain("status = 'published'");
  });
});
