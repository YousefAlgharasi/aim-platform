import { checkStory, emptyScene, emptyStory, markCorrect, moveItem, orNull, removeItem } from '../../features/stories/story-form';
import type { StoryInput } from '../../features/stories/api';

const valid = (): StoryInput => ({
  courseId: 'c1', title: 'The First Day', titleAr: null, summary: 'Four friends meet.', summaryAr: null, status: 'draft',
  scenes: [{
    setting: 'At school', settingAr: null,
    lines: [{ speaker: 'narrator', text: 'The bell rang.' }, { speaker: 'sarah', text: 'Hello!' }],
    questions: [{ stem: 'Who said hello?', explanation: null, skillKey: null, options: [{ text: 'Sarah', correct: true }, { text: 'Adam', correct: false }] }],
  }],
});

describe('story form helpers', () => {
  it('moves and removes items without changing the original', () => {
    const a = ['x', 'y', 'z'];
    expect(moveItem(a, 0, 1)).toEqual(['y', 'x', 'z']);
    expect(moveItem(a, 0, -1)).toEqual(a);
    expect(moveItem(a, 2, 1)).toEqual(a);
    expect(removeItem(a, 1)).toEqual(['x', 'z']);
    expect(a).toEqual(['x', 'y', 'z']);
  });

  it('keeps exactly one correct answer', () => {
    const q = emptyScene().questions[0];
    expect(q.options.filter((o) => o.correct)).toHaveLength(1);
    const m = markCorrect(q, 2);
    expect(m.options.map((o) => o.correct)).toEqual([false, false, true]);
  });

  it('turns empty text into null', () => {
    expect(orNull('  ')).toBeNull();
    expect(orNull('hello')).toBe('hello');
  });

  it('starts a new story as a draft with one scene', () => {
    const s = emptyStory('course-1');
    expect(s.status).toBe('draft');
    expect(s.courseId).toBe('course-1');
    expect(s.scenes).toHaveLength(1);
  });
});

describe('checkStory', () => {
  it('accepts a complete story', () => {
    expect(checkStory(valid())).toEqual([]);
  });

  it('names every problem in plain words', () => {
    const s = valid();
    s.title = ''; s.summary = '';
    s.scenes[0].setting = ''; s.scenes[0].lines[1].text = '';
    s.scenes[0].questions[0].stem = 'x';
    s.scenes[0].questions[0].options = [{ text: 'a', correct: false }, { text: 'a', correct: false }];
    const all = checkStory(s).join(' | ');
    expect(all).toMatch(/needs a title/);
    expect(all).toMatch(/short summary/);
    expect(all).toMatch(/Scene 1 needs a place/);
    expect(all).toMatch(/line 2 is empty/);
    expect(all).toMatch(/write the question/);
    expect(all).toMatch(/two answers are the same/);
    expect(all).toMatch(/exactly one correct/);
  });

  it('a published story needs a question in every scene, a draft does not', () => {
    const s = valid();
    s.scenes[0].questions = [];
    expect(checkStory({ ...s, status: 'draft' })).toEqual([]);
    expect(checkStory({ ...s, status: 'published' }).join(' ')).toMatch(/needs at least one question before the story can be published/);
  });

  it('needs at least one scene', () => {
    expect(checkStory({ ...valid(), scenes: [] }).join(' ')).toMatch(/at least one scene/);
  });
});
