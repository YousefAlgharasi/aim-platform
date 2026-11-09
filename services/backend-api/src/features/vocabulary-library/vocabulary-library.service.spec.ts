import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VocabularyLibraryService, paging } from './vocabulary-library.service';

function make(handlers: Array<[string, unknown[]]> = [], tts: Partial<{ getStudentAudioRef: jest.Mock }> = {}) {
  const query: jest.Mock = jest.fn(async (sql: string, _values?: unknown[]) => {
    for (const [needle, rows] of handlers) if (sql.includes(needle)) return { rows, rowCount: rows.length };
    return { rows: [], rowCount: 0 };
  });
  const service = new VocabularyLibraryService({ query } as any, { getStudentAudioRef: jest.fn(), ...tts } as any);
  return { service, query };
}

describe('paging', () => {
  it('clamps and defaults', () => {
    expect(paging(undefined, undefined)).toEqual({ limit: 30, offset: 0 });
    expect(paging('500', '-4')).toEqual({ limit: 100, offset: 0 });
    expect(paging('24', '48')).toEqual({ limit: 24, offset: 48 });
    expect(paging('abc', 'x', 10)).toEqual({ limit: 10, offset: 0 });
  });
});

describe('VocabularyLibraryService (student)', () => {
  it('lists words with the saved flag and total', async () => {
    const { service } = make([
      ['FROM vocabulary_words w\n          WHERE', [{ id: 'w1', word: 'borrow', translation_ar: 'يستعير', example_sentence: 'Can I borrow your pen?', part_of_speech: 'verb', level: 'intermediate', saved: true }]],
      ['count(*)', [{ n: '148' }]],
    ]);
    const r = await service.list('stu', { level: 'intermediate', limit: '24' });
    expect(r.total).toBe(148);
    expect(r.words[0]).toEqual({ id: 'w1', word: 'borrow', translationAr: 'يستعير', exampleSentence: 'Can I borrow your pen?', partOfSpeech: 'verb', level: 'intermediate', saved: true });
  });

  it('rejects an unknown level', async () => {
    await expect(make().service.list('stu', { level: 'expert' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('save writes the Arabic translation as the meaning and the sentence as the context, tagged "library"', async () => {
    const { service, query } = make([['FROM vocabulary_words WHERE id', [{ word: 'borrow', translation_ar: 'يستعير', example_sentence: 'Can I borrow your pen?' }]]]);
    await expect(service.save('stu', 'w1')).resolves.toEqual({ saved: true });
    const call = query.mock.calls.find(([sql]) => String(sql).includes('INSERT INTO saved_words'))!;
    expect(call[1]).toEqual(['stu', 'borrow', 'يستعير', 'Can I borrow your pen?']);
    expect(String(call[0])).toContain("'library'");
  });

  it('save / unsave / audio of a missing or hidden word is a 404', async () => {
    const { service } = make();
    await expect(service.save('stu', 'x')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.unsave('stu', 'x')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.audioRef('stu', 'x')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('unsave removes only this student\'s saved copy', async () => {
    const { service, query } = make([['FROM vocabulary_words WHERE id', [{ word: 'borrow', translation_ar: 'x', example_sentence: 'y' }]]]);
    await expect(service.unsave('stu', 'w1')).resolves.toEqual({ saved: false });
    const call = query.mock.calls.find(([sql]) => String(sql).includes('DELETE FROM saved_words'))!;
    expect(call[1]).toEqual(['stu', 'borrow']);
  });

  it('audio speaks the English word', async () => {
    const getStudentAudioRef = jest.fn().mockResolvedValue('ref-1');
    const { service } = make([['FROM vocabulary_words WHERE id', [{ word: 'borrow', translation_ar: 'x', example_sentence: 'y' }]]], { getStudentAudioRef });
    await expect(service.audioRef('stu', 'w1')).resolves.toBe('ref-1');
    expect(getStudentAudioRef).toHaveBeenCalledWith(expect.objectContaining({ script: 'borrow', languageCode: 'en', studentId: 'stu', subjectId: 'w1' }));
  });
});

describe('VocabularyLibraryService (admin)', () => {
  const valid = { word: ' borrow ', translationAr: 'يستعير', exampleSentence: 'Can I borrow  your pen?', level: 'intermediate', partOfSpeech: 'verb' };

  it('creates with trimmed, single-spaced text', async () => {
    const { service, query } = make([['INSERT INTO vocabulary_words', [{ id: 'n', word: 'borrow', translation_ar: 'يستعير', example_sentence: 'Can I borrow your pen?', part_of_speech: 'verb', level: 'intermediate', sort_order: 0, is_active: true }]]]);
    const w = await service.create(valid);
    expect(w.word).toBe('borrow');
    expect(query.mock.calls[0][1]).toEqual(['borrow', 'يستعير', 'Can I borrow your pen?', 'verb', 'intermediate', 0, true]);
  });

  const invalid: Array<Record<string, unknown>> = [
    { ...valid, word: '' },
    { ...valid, translationAr: '  ' },
    { ...valid, exampleSentence: undefined },
    { ...valid, level: 'expert' },
    { ...valid, partOfSpeech: 'slang' },
  ];
  it.each(invalid.map((b, i) => [i, b] as const))('rejects invalid input #%i', async (_i, body) => {
    await expect(make().service.create(body)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('reports a duplicate word as a 400', async () => {
    const query = jest.fn().mockRejectedValue(Object.assign(new Error('dup'), { code: '23505' }));
    const service = new VocabularyLibraryService({ query } as any, {} as any);
    await expect(service.create(valid)).rejects.toThrow('already exists');
  });

  it('update changes only the sent fields and 404s on a missing id; remove 404s too', async () => {
    const { service, query } = make();
    await expect(service.update('id', {})).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.update('id', { isActive: false })).rejects.toBeInstanceOf(NotFoundException);
    expect(String(query.mock.calls[0][0])).toContain('is_active = $2');
    await expect(service.remove('id')).rejects.toBeInstanceOf(NotFoundException);
  });
});
