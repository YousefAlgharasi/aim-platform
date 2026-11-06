import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { LeaderboardWidget } from '../features/dashboard/widgets/LeaderboardWidget';
import type { Leaderboard } from '../features/dashboard/dashboardApi';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...rest }: { children: unknown; to: string }) => <a href={String(to)} {...rest}>{children as never}</a>,
}));
jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
jest.mock('../api/client', () => ({ apiClient: { get: jest.fn() } }));
const mockI18n = {
  t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])),
  formatNumber: (n: number) => String(n),
};
jest.mock('../i18n/I18nContext', () => ({ useI18n: () => mockI18n }));

const board = (name: string): Leaderboard => ({ period: 'week', entries: [{ rank: 1, name, xp: 50, isYou: false }], you: null });

describe('LeaderboardWidget', () => {
  it('shows the top learners and links to the full list', () => {
    render(<LeaderboardWidget week={board('Sara K.')} />);
    expect(screen.getByText('Sara K.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all' })).toHaveAttribute('href', '/leaderboard');
  });

  it('shows fresh data when the dashboard reloads', () => {
    const { rerender } = render(<LeaderboardWidget week={board('Sara K.')} />);
    rerender(<LeaderboardWidget week={board('Omar T.')} />);
    expect(screen.getByText('Omar T.')).toBeInTheDocument();
    expect(screen.queryByText('Sara K.')).not.toBeInTheDocument();
  });
});
