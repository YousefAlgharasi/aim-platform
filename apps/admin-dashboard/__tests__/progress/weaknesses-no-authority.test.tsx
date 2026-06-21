import { render, screen } from '@testing-library/react';
import { WeaknessesRecommendationsClient } from '../../app/admin/students/[studentId]/progress/weaknesses/weaknesses-recommendations-client';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }),
}));

jest.mock('../../lib/api', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
  AdminApiClientError: class extends Error { status = 500; },
}));

const mockWeaknesses = [
  { skillId: 's-1', skillKey: 'grammar.past_simple', severity: 'high', detectedAt: '2026-01-10T00:00:00Z' },
];

const mockRecommendations = [
  { type: 'lesson_review', entityId: 'l-1', reason: 'Low performance on past tense exercises', generatedAt: '2026-01-10T00:00:00Z' },
];

describe('WeaknessesRecommendationsClient — no authority', () => {
  it('displays severity from backend without recalculating', () => {
    render(<WeaknessesRecommendationsClient weaknesses={mockWeaknesses} recommendations={[]} />);
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('displays recommendation reason from AIM Engine as-is', () => {
    render(<WeaknessesRecommendationsClient weaknesses={[]} recommendations={mockRecommendations} />);
    expect(screen.getByText('Low performance on past tense exercises')).toBeInTheDocument();
  });

  it('does not contain mutation buttons', () => {
    render(<WeaknessesRecommendationsClient weaknesses={mockWeaknesses} recommendations={mockRecommendations} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not contain form inputs', () => {
    render(<WeaknessesRecommendationsClient weaknesses={mockWeaknesses} recommendations={mockRecommendations} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('shows empty state for weaknesses', () => {
    render(<WeaknessesRecommendationsClient weaknesses={[]} recommendations={[]} />);
    expect(screen.getByText(/no weaknesses detected/i)).toBeInTheDocument();
  });

  it('shows empty state for recommendations', () => {
    render(<WeaknessesRecommendationsClient weaknesses={[]} recommendations={[]} />);
    expect(screen.getByText(/no recommendations generated/i)).toBeInTheDocument();
  });
});
