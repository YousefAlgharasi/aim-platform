import { assignCharacters, genderOf, parseDialogue, uniqueSpeakers } from '../features/lessons/dialogue/dialogue';

describe('parseDialogue', () => {
  it('splits a two-person conversation into lines', () => {
    const lines = parseDialogue('Man: Hello! My name is Tom. Woman: Hi Tom, I am Lucy. Nice to meet you. Man: Nice to meet you too, Lucy.');
    expect(lines).toEqual([
      { speaker: 'Man', text: 'Hello! My name is Tom.' },
      { speaker: 'Woman', text: 'Hi Tom, I am Lucy. Nice to meet you.' },
      { speaker: 'Man', text: 'Nice to meet you too, Lucy.' },
    ]);
  });

  it('handles questions and role names', () => {
    const lines = parseDialogue('Waiter: Are you ready to order? Patient: Yes, please.');
    expect(lines?.map((l) => l.speaker)).toEqual(['Waiter', 'Patient']);
  });

  it('reads Speaker A / Speaker B debates', () => {
    const lines = parseDialogue('Speaker A: I think homework should be shorter. Speaker B: I disagree.');
    expect(lines?.map((l) => l.speaker)).toEqual(['Speaker A', 'Speaker B']);
  });

  it('is not a dialogue when the text does not start with a speaker or has one voice', () => {
    expect(parseDialogue('Listen carefully. Pat. Bat. Now: Fan. Van.')).toBeNull();
    expect(parseDialogue('Man: Hello. Man: Hello again.')).toBeNull();
    expect(parseDialogue('Zero. One. Two.')).toBeNull();
    expect(parseDialogue('')).toBeNull();
    expect(parseDialogue(null)).toBeNull();
  });
});

describe('assignCharacters', () => {
  it('matches the gender in the label and never reuses a character', () => {
    const cast = assignCharacters(['Boy', 'Girl'], 'lesson-1');
    expect(cast[0].gender).toBe('male');
    expect(cast[1].gender).toBe('female');
    expect(new Set(cast.map((c) => c.id)).size).toBe(2);
  });

  it('gives two men two different men', () => {
    const cast = assignCharacters(['Man', 'Boy'], 'x');
    expect(cast.map((c) => c.gender)).toEqual(['male', 'male']);
    expect(cast[0].id).not.toBe(cast[1].id);
  });

  it('mixes neutral roles and is stable for the same lesson', () => {
    const a = assignCharacters(['Doctor', 'Patient'], 'abc');
    const b = assignCharacters(['Doctor', 'Patient'], 'abc');
    expect(a.map((c) => c.id)).toEqual(b.map((c) => c.id));
    expect(a[0].gender).not.toBe(a[1].gender);
  });

  it('supports four speakers with four different characters', () => {
    const cast = assignCharacters(['Man', 'Woman', 'Boy', 'Girl'], 'q');
    expect(new Set(cast.map((c) => c.id)).size).toBe(4);
  });
});

describe('helpers', () => {
  it('reads gender words and lists speakers once', () => {
    expect(genderOf('Girl')).toBe('female');
    expect(genderOf('man')).toBe('male');
    expect(genderOf('Doctor')).toBeNull();
    expect(uniqueSpeakers([{ speaker: 'A', text: '1' }, { speaker: 'B', text: '2' }, { speaker: 'A', text: '3' }])).toEqual(['A', 'B']);
  });
});
