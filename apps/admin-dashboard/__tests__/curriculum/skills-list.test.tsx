import { render, screen, fireEvent } from '@testing-library/react';
import { SkillsList } from '../../app/admin/content/skills/skills-list';
import type { AdminSkillSummary } from '../../lib/api/admin-skills-api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

const NOW = '2026-01-15T12:00:00Z';

const makeSkill = (overrides: Partial<AdminSkillSummary> = {}): AdminSkillSummary => ({
  id: 'skill-1',
  key: 'grammar.past_simple',
  title: 'Past Simple',
  domain: 'grammar',
  status: 'draft',
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
});

const defaultProps = {
  skills: [makeSkill()],
  total: 1,
  page: 1,
  totalPages: 1,
  onCreateSkill: jest.fn().mockResolvedValue({}),
  onUpdateSkill: jest.fn().mockResolvedValue({}),
};

describe('SkillsList', () => {
  it('renders + New Skill button in idle mode', () => {
    render(<SkillsList {...defaultProps} />);
    expect(screen.getByText('+ New Skill')).toBeInTheDocument();
  });

  it('opens create form when + New Skill clicked', () => {
    render(<SkillsList {...defaultProps} />);
    fireEvent.click(screen.getByText('+ New Skill'));
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    expect(screen.getByText('New Skill')).toBeInTheDocument();
  });

  it('validates empty title on create form submission', () => {
    render(<SkillsList {...defaultProps} />);
    fireEvent.click(screen.getByText('+ New Skill'));
    fireEvent.click(screen.getByText(/create skill/i));
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });

  it('validates skill key format', () => {
    render(<SkillsList {...defaultProps} />);
    fireEvent.click(screen.getByText('+ New Skill'));
    const keyInput = document.getElementById('skill-key') as HTMLInputElement;
    fireEvent.change(keyInput, { target: { value: 'INVALID KEY!' } });
    const titleInput = document.getElementById('skill-title') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Test' } });
    fireEvent.click(screen.getByText(/create skill/i));
    expect(screen.getByText(/key must be lowercase/i)).toBeInTheDocument();
  });

  it('validates empty key on create form submission', () => {
    render(<SkillsList {...defaultProps} />);
    fireEvent.click(screen.getByText('+ New Skill'));
    const titleInput = document.getElementById('skill-title') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Test' } });
    fireEvent.click(screen.getByText(/create skill/i));
    expect(screen.getByText(/skill key is required/i)).toBeInTheDocument();
  });

  it('closes form when Cancel clicked', () => {
    render(<SkillsList {...defaultProps} />);
    fireEvent.click(screen.getByText('+ New Skill'));
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/cancel/i));
    expect(screen.getByText('+ New Skill')).toBeInTheDocument();
  });
});
