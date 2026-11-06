import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AttemptScreen } from '../features/assessments/AttemptScreen';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...rest }: { children: unknown; to: string }) => <a href={String(to)} {...rest}>{children as never}</a>,
  useNavigate: () => jest.fn(),
  useParams: () => ({ assessmentId: 'as1', attemptId: 'at1' }),
}));
jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
const mockI18n = {
  t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])),
  formatNumber: (n: number) => String(n),
};
jest.mock('../i18n/I18nContext', () => ({ useI18n: () => mockI18n }));

const mockResume = jest.fn();
const mockQuestions = jest.fn();
const mockSaveAnswer = jest.fn();
const mockSubmit = jest.fn();
jest.mock('../features/assessments/assessmentsApi', () => ({
  resumeAssessmentAttempt: (...a: unknown[]) => mockResume(...a),
  fetchAttemptQuestions: (...a: unknown[]) => mockQuestions(...a),
  submitAssessmentAnswer: (...a: unknown[]) => mockSaveAnswer(...a),
  submitAssessmentAttempt: (...a: unknown[]) => mockSubmit(...a),
  fetchAssessmentQuestionAudio: jest.fn(),
}));

const question = (n: number) => ({
  id: `q${n}`, assessmentQuestionLinkId: `link${n}`, sectionId: null, order: n, type: 'multiple_choice', prompt: `Prompt ${n}`,
  options: [{ id: `a${n}`, label: 'A', text: 'first' }, { id: `b${n}`, label: 'B', text: 'second' }],
});

beforeEach(() => {
  mockResume.mockResolvedValue({ attemptId: 'at1', status: 'in_progress', expiresAt: null });
  mockQuestions.mockResolvedValue([question(1), question(2)]);
  mockSubmit.mockResolvedValue({});
});

describe('AttemptScreen — saving answers', () => {
  it('sends quick successive changes to the same question in order, never overlapping', async () => {
    const order: string[] = [];
    const resolvers: Array<() => void> = [];
    mockSaveAnswer.mockImplementation((_attempt: string, _link: string, value: string) => {
      order.push(`start:${value}`);
      return new Promise<void>((resolve) => resolvers.push(() => { order.push(`end:${value}`); resolve(); }));
    });
    render(<AttemptScreen />);
    fireEvent.click(await screen.findByLabelText(/first/));
    fireEvent.click(screen.getByLabelText(/second/));

    // The second save must not start until the first one has finished.
    await waitFor(() => expect(order).toEqual(['start:a1']));
    resolvers[0]();
    await waitFor(() => expect(order).toEqual(['start:a1', 'end:a1', 'start:b1']));
    resolvers[1]();
    await waitFor(() => expect(order[order.length - 1]).toBe('end:b1'));
    // the last tap is what is on screen, and it is what was saved last
    expect(screen.getByLabelText(/second/)).toBeChecked();
  });

  it('lets different questions save at the same time', async () => {
    const started: string[] = [];
    mockSaveAnswer.mockImplementation((_a: string, link: string) => { started.push(link); return new Promise(() => undefined); });
    render(<AttemptScreen />);
    fireEvent.click(await screen.findByLabelText(/first/));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(await screen.findByLabelText(/second/));
    await waitFor(() => expect(started).toEqual(['link1', 'link2']));
  });

  it('keeps the student on the same question if the attempt reloads', async () => {
    mockSaveAnswer.mockResolvedValue({});
    const view = render(<AttemptScreen />);
    await screen.findByRole('heading', { name: 'Prompt 1' });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByRole('heading', { name: 'Prompt 2' })).toBeInTheDocument();
    // A reload of the attempt (what a language switch triggers) must not send the student back to question 1.
    mockI18n.t = (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k]));
    const callsBefore = mockQuestions.mock.calls.length;
    view.rerender(<AttemptScreen />);
    await waitFor(() => expect(mockQuestions.mock.calls.length).toBeGreaterThan(callsBefore));
    expect(await screen.findByRole('heading', { name: 'Prompt 2' })).toBeInTheDocument();
  });
});
