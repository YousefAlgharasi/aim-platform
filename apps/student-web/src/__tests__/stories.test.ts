jest.mock('../api/client', () => ({ apiClient: {} }));
import { resumeLabelKey, storyPercent, type StorySummary } from '../features/stories/storiesApi';

const base: StorySummary = {
  storyId: 's', courseTitle: 'A1.1', cefrCode: 'A1', title: 'T', titleAr: null, summary: 'S', summaryAr: null,
  scenes: 5, questions: 10, answered: 0, words: 300, minutes: 4, locked: false, completed: false,
};

describe('stories helpers', () => {
  it('labels the button from the real progress', () => {
    expect(resumeLabelKey(base)).toBe('Start reading');
    expect(resumeLabelKey({ ...base, answered: 3 })).toBe('Continue');
    expect(resumeLabelKey({ ...base, answered: 10, completed: true })).toBe('Read again');
  });
  it('turns answers into a 0 to 100 progress, safely', () => {
    expect(storyPercent({ questions: 10, answered: 0 })).toBe(0);
    expect(storyPercent({ questions: 10, answered: 5 })).toBe(50);
    expect(storyPercent({ questions: 10, answered: 12 })).toBe(100);
    expect(storyPercent({ questions: 0, answered: 0 })).toBe(0);
  });
});
