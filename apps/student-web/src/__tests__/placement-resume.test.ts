import { clearPlacementProgress, isPlacementLive, markPlacementLive } from '../features/placement/placementApi';

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

describe('interrupted placement attempts', () => {
  it('a running attempt is live', () => {
    markPlacementLive('a1');
    expect(isPlacementLive('a1')).toBe(true);
  });
  it('after the tab/app closes the attempt is no longer live, so it restarts from question 1', () => {
    markPlacementLive('a1');
    sessionStorage.clear();
    expect(isPlacementLive('a1')).toBe(false);
  });
  it('finishing clears the markers', () => {
    markPlacementLive('a1');
    clearPlacementProgress('a1');
    expect(isPlacementLive('a1')).toBe(false);
  });
});
