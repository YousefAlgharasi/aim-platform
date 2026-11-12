import '@testing-library/jest-dom';
import type React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { I18nProvider } from '../i18n/I18nContext';
import { StreakBadge, weekFromActivity, weekFromSummary } from '../interaction/StreakBadge';
import type { EngagementSummary } from '../features/dashboard/dashboardApi';

const mockStats = jest.fn();
jest.mock('../hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }));
jest.mock('react-router-dom', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a>,
}));
jest.mock('../features/dashboard/dashboardApi', () => ({ fetchEngagementStats: () => mockStats() }));

const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
const base = (streakDays: number): EngagementSummary => ({ goal: { targetLessons: 1, completedToday: 0, streakDays }, challenge: null });
const show = (summary: EngagementSummary) =>
  render(<I18nProvider><StreakBadge summary={summary} /></I18nProvider>);

describe('streak week data', () => {
  test('uses the backend streak days and marks today as still open', () => {
    const week = weekFromSummary({ ...base(2), recentDays: [
      { date: '2026-11-08', status: 'none' }, { date: '2026-11-09', status: 'frozen' },
      { date: '2026-11-10', status: 'active' }, { date: '2026-11-11', status: 'none' },
    ] }, '2026-11-11');
    expect(week?.map((d) => d.state)).toEqual(['missed', 'frozen', 'active', 'today']);
    expect(weekFromSummary(base(2))).toBeNull();
  });

  test('fallback: XP days this week, with later days marked as not here yet', () => {
    const week = weekFromActivity([
      { date: '2026-11-09', xp: 20 }, { date: '2026-11-10', xp: 0 }, { date: '2026-11-11', xp: 0 }, { date: '2026-11-12', xp: 0 },
    ], '2026-11-11');
    expect(week.map((d) => d.state)).toEqual(['active', 'missed', 'today', 'future']);
  });
});

describe('StreakBadge', () => {
  beforeEach(() => mockStats.mockReset());

  test('lit flame above 0 days, unlit at 0', () => {
    const { container, unmount } = show(base(3));
    expect(container.querySelector('.ix-fire')).not.toBeNull();
    unmount();
    expect(show(base(0)).container.querySelector('.ix-fire')).toBeNull();
  });

  test('pressing it opens the week with one labelled entry per day', async () => {
    show({ ...base(2), recentDays: [-6, -5, -4, -3, -2, -1, 0].map((o) => ({ date: day(o), status: o === -1 || o === -2 ? 'active' : 'none' })) });
    const button = screen.getByRole('button', { name: /2 Day streak\. Show your week/ });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    const panel = await screen.findByRole('dialog', { name: 'Your streak' });
    const items = within(panel).getAllByRole('listitem');
    expect(items).toHaveLength(7);
    expect(items[5]).toHaveAccessibleName(/: Learned$/);
    expect(items[6]).toHaveAccessibleName(/: Today, not done yet$/);
    expect(panel).toHaveTextContent('You learned on 2 of the last 7 days.');
    expect(panel).toHaveTextContent('keep your streak');
    expect(mockStats).not.toHaveBeenCalled();

    // Escape closes it from inside the panel and hands focus back to the flame.
    fireEvent.keyDown(panel, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(button);
  });

  test('older backend: falls back to this week from the stats endpoint', async () => {
    mockStats.mockResolvedValue({ weeklyActivity: [{ date: day(-1), xp: 30 }, { date: day(0), xp: 10 }] });
    show(base(2));
    fireEvent.click(screen.getByRole('button', { name: /Show your week/ }));
    const panel = await screen.findByRole('dialog', { name: 'Your streak' });
    expect(await within(panel).findByText('Days learned this week: 2')).toBeInTheDocument();
  });
});
