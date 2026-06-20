import { render, screen } from '@testing-library/react';
import { SkillStateClient } from '../../app/admin/students/[studentId]/progress/skills/skill-state-client';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }),
}));

jest.mock('../../lib/api', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
  AdminApiClientError: class extends Error { status = 500; },
}));

const mockSkills = [
  { skillId: 's-1', skillKey: 'grammar.past_simple', masteryLevel: 75, state: 'learning', lastUpdatedAt: '2026-01-10T00:00:00Z' },
  { skillId: 's-2', skillKey: 'reading.main_idea', masteryLevel: 90, state: 'mastered', lastUpdatedAt: '2026-01-11T00:00:00Z' },
];

describe('SkillStateClient — no authority', () => {
  it('displays mastery level from backend without recalculating', () => {
    render(<SkillStateClient skills={mockSkills} />);
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('90')).toBeInTheDocument();
  });

  it('displays state from backend without recalculating', () => {
    render(<SkillStateClient skills={mockSkills} />);
    expect(screen.getByText('learning')).toBeInTheDocument();
    expect(screen.getByText('mastered')).toBeInTheDocument();
  });

  it('does not contain any mutation buttons', () => {
    render(<SkillStateClient skills={mockSkills} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not contain any form inputs', () => {
    render(<SkillStateClient skills={mockSkills} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('shows empty state when no skills', () => {
    render(<SkillStateClient skills={[]} />);
    expect(screen.getByText(/no skill states/i)).toBeInTheDocument();
  });
});
