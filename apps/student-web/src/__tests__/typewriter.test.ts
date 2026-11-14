import { balanceMarkdown } from '../features/voice-teacher/useTypewriter';

describe('balanceMarkdown', () => {
  it('closes a bold or code span that is still being typed', () => {
    expect(balanceMarkdown('We use **the pre')).toBe('We use **the pre**');
    expect(balanceMarkdown('Say `hel')).toBe('Say `hel`');
  });
  it('leaves finished markdown alone', () => {
    expect(balanceMarkdown('A **bold** word and `code`.')).toBe('A **bold** word and `code`.');
    expect(balanceMarkdown('Plain text')).toBe('Plain text');
  });
});
