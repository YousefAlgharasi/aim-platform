import { render, screen, fireEvent, renderWithProviders } from '../test-utils';
import { AssessmentSettings } from '../../features/assessments';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

jest.mock('../../core/api', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
  AdminApiClientError: class extends Error { status = 500; },
}));

const defaultProps = {
  assessmentId: 'a-1',
  settings: {
    timeLimitMinutes: 30,
    passMark: 70,
    shuffleQuestions: true,
  },
  onUpdateSettings: jest.fn().mockResolvedValue({}),
};

describe('AssessmentSettings', () => {
  it('shows time limit', () => {
    renderWithProviders(<AssessmentSettings {...defaultProps} />);
    expect(screen.getByText('30 minutes')).toBeInTheDocument();
  });

  it('shows pass mark', () => {
    renderWithProviders(<AssessmentSettings {...defaultProps} />);
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('shows shuffle setting', () => {
    renderWithProviders(<AssessmentSettings {...defaultProps} />);
    expect(screen.getAllByText('Yes').length).toBeGreaterThan(0);
  });

  it('shows Edit Settings button', () => {
    renderWithProviders(<AssessmentSettings {...defaultProps} />);
    expect(screen.getByText('Edit Settings')).toBeInTheDocument();
  });

  it('hides Edit Settings when disabled', () => {
    renderWithProviders(<AssessmentSettings {...defaultProps} disabled />);
    expect(screen.queryByText('Edit Settings')).not.toBeInTheDocument();
  });

  it('enters edit mode', () => {
    renderWithProviders(<AssessmentSettings {...defaultProps} />);
    fireEvent.click(screen.getByText('Edit Settings'));
    expect(screen.getByText('Save Settings')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('shows no limit when timeLimitMinutes is null', () => {
    renderWithProviders(<AssessmentSettings {...defaultProps} settings={{ ...defaultProps.settings, timeLimitMinutes: null }} />);
    expect(screen.getByText('No limit')).toBeInTheDocument();
  });
});
