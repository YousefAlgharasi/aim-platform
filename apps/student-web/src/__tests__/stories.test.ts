jest.mock('../api/client', () => ({ apiClient: {} }));
import { nextPartToRead, storyPartPath, type StoryPart } from '../features/stories/storiesApi';

const part = (index: number, o: Partial<StoryPart> = {}): StoryPart => ({
  index, chapterId: `c${index}`, chapterTitle: `Chapter ${index + 1}`, scenes: 1, questions: 2, answered: 0, unlocked: false, done: false, ...o,
});

describe('story parts', () => {
  it('opens the first part that is unlocked and not finished', () => {
    expect(nextPartToRead([part(0, { unlocked: true, done: true }), part(1, { unlocked: true }), part(2)])?.index).toBe(1);
  });
  it('has nothing to open while every part is locked or already read', () => {
    expect(nextPartToRead([part(0), part(1)])).toBeNull();
    expect(nextPartToRead([part(0, { unlocked: true, done: true })])).toBeNull();
    expect(nextPartToRead([])).toBeNull();
  });
  it('links a part by its index', () => {
    expect(storyPartPath('abc', 2)).toBe('/stories/abc?part=2');
  });
});
