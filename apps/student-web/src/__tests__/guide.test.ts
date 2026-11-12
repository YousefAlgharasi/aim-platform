import { pickGuide } from '../features/lessons/dialogue/guide';

describe('guide casting', () => {
  it('gives a lesson the same presenter every time', () => {
    expect(pickGuide('lesson-1').id).toBe(pickGuide('lesson-1').id);
  });
  it('rotates through the four students', () => {
    const ids = new Set(Array.from({ length: 40 }, (_, i) => pickGuide(`lesson-${i}`).id));
    expect(ids.size).toBe(4);
  });
});
