import { clampPanelWidth, PANEL_DEFAULT, PANEL_MAX, PANEL_MIN } from '../features/voice-teacher/useResizablePanel';

describe('clampPanelWidth', () => {
  it('keeps a width inside the allowed range', () => {
    expect(clampPanelWidth(500, 1600)).toBe(500);
    expect(clampPanelWidth(10, 1600)).toBe(PANEL_MIN);
    expect(clampPanelWidth(5000, 2400)).toBe(PANEL_MAX);
  });

  it('never lets the panel take more than 60% of a smaller window', () => {
    expect(clampPanelWidth(900, 1100)).toBe(660);
    // ...but it never goes below the minimum even in a small window.
    expect(clampPanelWidth(900, 400)).toBe(PANEL_MIN);
  });

  it('has a sensible default', () => {
    expect(PANEL_DEFAULT).toBeGreaterThanOrEqual(PANEL_MIN);
    expect(PANEL_DEFAULT).toBeLessThanOrEqual(PANEL_MAX);
  });
});
