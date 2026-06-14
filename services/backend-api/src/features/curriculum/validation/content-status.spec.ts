import { isAllowedStatusTransition } from './content-status';

describe('isAllowedStatusTransition', () => {
  it('allows draft -> published', () => {
    expect(isAllowedStatusTransition('draft', 'published')).toBe(true);
  });

  it('allows draft -> archived', () => {
    expect(isAllowedStatusTransition('draft', 'archived')).toBe(true);
  });

  it('allows published -> archived', () => {
    expect(isAllowedStatusTransition('published', 'archived')).toBe(true);
  });

  it('allows archived -> draft (restore, role-checked by caller)', () => {
    expect(isAllowedStatusTransition('archived', 'draft')).toBe(true);
  });

  it('forbids published -> draft', () => {
    expect(isAllowedStatusTransition('published', 'draft')).toBe(false);
  });

  it('forbids archived -> published', () => {
    expect(isAllowedStatusTransition('archived', 'published')).toBe(false);
  });

  it('forbids a no-op transition to the same status', () => {
    expect(isAllowedStatusTransition('draft', 'draft')).toBe(false);
    expect(isAllowedStatusTransition('published', 'published')).toBe(false);
    expect(isAllowedStatusTransition('archived', 'archived')).toBe(false);
  });
});
