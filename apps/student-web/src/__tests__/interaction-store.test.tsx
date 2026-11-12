import '@testing-library/jest-dom';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { StreakCelebrationHost } from '../interaction/StreakCelebration';
import {
  __resetEngagementForTests,
  getEngagementState,
  refreshEngagement,
  reportLearningCompleted,
  setEngagementUser,
} from '../interaction/engagementStore';
import { I18nProvider } from '../i18n/I18nContext';
import type { EngagementSummary } from '../features/dashboard/dashboardApi';

const mockFetch = jest.fn<Promise<EngagementSummary | null>, []>();
jest.mock('../features/dashboard/dashboardApi', () => ({
  fetchEngagementSummary: () => mockFetch(),
}));
jest.mock('../hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }));

const summary = (streakDays: number, completedToday: number): EngagementSummary => ({
  goal: { targetLessons: 1, completedToday, streakDays },
  challenge: null,
  challenges: [],
});

beforeEach(() => {
  localStorage.clear();
  mockFetch.mockReset();
  __resetEngagementForTests();
  setEngagementUser('u1');
});

describe('engagement store', () => {
  test('first completion today raises one celebration; later completions and refreshes do not', async () => {
    mockFetch.mockResolvedValueOnce(summary(2, 0));
    await refreshEngagement();
    expect(getEngagementState().celebration).toBeNull(); // visiting the site never celebrates

    mockFetch.mockResolvedValueOnce(summary(3, 1));
    await reportLearningCompleted();
    expect(getEngagementState().celebration).toMatchObject({ previous: 2, current: 3 });
    expect(getEngagementState().summary?.goal.streakDays).toBe(3);

    // Second lesson the same day.
    mockFetch.mockResolvedValueOnce(summary(3, 2));
    await act(async () => { await reportLearningCompleted(); });
    expect(mockFetch).toHaveBeenCalledTimes(3);

    // "Refresh": a new page load only has localStorage.
    __resetEngagementForTests();
    setEngagementUser('u1');
    mockFetch.mockResolvedValueOnce(summary(3, 2));
    await reportLearningCompleted();
    expect(getEngagementState().celebration).toBeNull();
  });

  test('duplicate completion events share one request', async () => {
    let resolve: (s: EngagementSummary) => void = () => undefined;
    mockFetch.mockReturnValueOnce(new Promise((r) => { resolve = r; }));
    const a = reportLearningCompleted();
    const b = reportLearningCompleted();
    resolve(summary(1, 1));
    await Promise.all([a, b]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(getEngagementState().celebration?.current).toBe(1);
  });

  test('a failed summary request never celebrates or throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('offline'));
    await expect(reportLearningCompleted()).resolves.toBeUndefined();
    expect(getEngagementState().celebration).toBeNull();
  });
});

describe('StreakCelebrationHost', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => { jest.runOnlyPendingTimers(); jest.useRealTimers(); });

  test('shows a readable message, dismisses with the button, and stays out of the way', async () => {
    render(<I18nProvider><StreakCelebrationHost /></I18nProvider>);
    expect(screen.queryByTestId('streak-celebration')).toBeNull();

    mockFetch.mockResolvedValueOnce(summary(7, 1));
    await act(async () => { await reportLearningCompleted(); });
    act(() => { jest.advanceTimersByTime(700); });

    const toast = screen.getByTestId('streak-celebration');
    expect(screen.getByRole('status')).toHaveTextContent('7-day streak. One full week. Well done!');
    expect(toast).toHaveTextContent('Milestone');
    // It must not trap focus or act as a dialog.
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(document.body);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss streak message' }));
    act(() => { jest.advanceTimersByTime(200); });
    expect(screen.queryByTestId('streak-celebration')).toBeNull();
  });

  test('dismisses itself and with Escape', async () => {
    render(<I18nProvider><StreakCelebrationHost /></I18nProvider>);
    mockFetch.mockResolvedValueOnce(summary(1, 1));
    await act(async () => { await reportLearningCompleted(); });
    act(() => { jest.advanceTimersByTime(700); });
    expect(screen.getByRole('status')).toHaveTextContent('1-day streak. A great start!');
    fireEvent.keyDown(window, { key: 'Escape' });
    act(() => { jest.advanceTimersByTime(200); });
    expect(screen.queryByTestId('streak-celebration')).toBeNull();
  });
});
