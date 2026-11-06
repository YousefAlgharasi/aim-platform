import { isFlagOn } from '../features/operations/featureFlags';

describe('isFlagOn', () => {
  it('is on unless an admin-defined flag evaluates to false', () => {
    expect(isFlagOn(null, 'dark_mode')).toBe(true);
    expect(isFlagOn({}, 'dark_mode')).toBe(true);
    expect(isFlagOn({ dark_mode: true }, 'dark_mode')).toBe(true);
    expect(isFlagOn({ dark_mode: false }, 'dark_mode')).toBe(false);
  });
});
