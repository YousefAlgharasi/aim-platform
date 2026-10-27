import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SupportPage } from '../features/support/SupportPage';
import { TicketDetailPage } from '../features/support/TicketDetailPage';

const mockCreateTicket = jest.fn();
const mockSubmitFeedback = jest.fn();
const mockAddComment = jest.fn();

jest.mock('react-router-dom', () => ({
  Link: ({ children }: { children: unknown }) => <span>{children as never}</span>,
  useParams: () => ({ ticketId: 't1' }),
}));
// `t` must be referentially stable: TicketDetailPage lists it as an effect dependency.
const mockI18n = {
  t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])),
  formatDate: () => '',
  formatDateTime: () => '',
  plural: (_n: number, forms: Record<string, string>) => forms.other,
};
jest.mock('../i18n/I18nContext', () => ({ useI18n: () => mockI18n }));
jest.mock('../features/support/supportApi', () => ({
  ...jest.requireActual('../features/support/supportApi'),
  fetchTickets: () => Promise.resolve([]),
  fetchReleaseNotes: () => Promise.resolve([]),
  fetchOperationalStatus: () => Promise.resolve([]),
  fetchTicket: () => Promise.resolve({
    id: 't1', requesterId: 'u', category: 'general', severity: 'low', status: 'open', assignedTo: null,
    subject: 'Subj', description: 'Desc', createdAt: '2026-01-01', updatedAt: '2026-01-01',
  }),
  createTicket: (...a: unknown[]) => mockCreateTicket(...a),
  submitFeedback: (...a: unknown[]) => mockSubmitFeedback(...a),
  addTicketComment: (...a: unknown[]) => mockAddComment(...a),
}));


const type = (el: HTMLElement, value: string) => fireEvent.change(el, { target: { value } });
const byId = (id: string) => document.getElementById(id) as HTMLInputElement;

beforeEach(() => jest.clearAllMocks());

async function openPanel(name: RegExp) {
  render(<SupportPage />);
  fireEvent.click(await screen.findByRole('button', { name }));
}

describe('support ticket form', () => {
  it('rejects empty and whitespace-only subject/message and focuses the first invalid field', async () => {
    await openPanel(/submit a ticket/i);
    type(byId('ticket-subject'), '   ');
    type(byId('ticket-message'), '  ');
    fireEvent.click(screen.getByRole('button', { name: /^submit ticket$/i }));
    expect(screen.getByText('Subject is required.')).toBeTruthy();
    expect(screen.getByText('Message is required.')).toBeTruthy();
    expect(byId('ticket-message').getAttribute('aria-invalid')).toBe('true');
    expect(byId('ticket-message').getAttribute('aria-describedby')).toBe('ticket-message-error');
    expect(document.activeElement?.id).toBe('ticket-subject');
    expect(mockCreateTicket).not.toHaveBeenCalled();
  });

  it('submits trimmed values once and clears the form on success', async () => {
    mockCreateTicket.mockResolvedValue({ id: 'n', subject: 's', status: 'open', category: 'general', severity: 'medium', createdAt: '', updatedAt: '' });
    await openPanel(/submit a ticket/i);
    type(byId('ticket-subject'), '  Help  ');
    type(byId('ticket-message'), '  broken  ');
    fireEvent.click(screen.getByRole('button', { name: /^submit ticket$/i }));
    await waitFor(() => expect(screen.getByText(/Ticket submitted/)).toBeTruthy());
    expect(mockCreateTicket).toHaveBeenCalledTimes(1);
    expect(mockCreateTicket).toHaveBeenCalledWith(expect.objectContaining({ subject: 'Help', description: 'broken' }));
  });

  it('maps backend field errors to the field and keeps typed values', async () => {
    mockCreateTicket.mockRejectedValue({ message: 'Bad Request', details: ['subject must be shorter than or equal to 500 characters'] });
    await openPanel(/submit a ticket/i);
    type(byId('ticket-subject'), 'Help');
    type(byId('ticket-message'), 'broken');
    fireEvent.click(screen.getByRole('button', { name: /^submit ticket$/i }));
    await waitFor(() => expect(screen.getByText('Must be 500 characters or fewer.')).toBeTruthy());
    expect(byId('ticket-message').value).toBe('broken');
  });

  it('shows a banner on network failure', async () => {
    mockCreateTicket.mockRejectedValue(new TypeError('Failed to fetch'));
    await openPanel(/submit a ticket/i);
    type(byId('ticket-subject'), 'Help');
    type(byId('ticket-message'), 'broken');
    fireEvent.click(screen.getByRole('button', { name: /^submit ticket$/i }));
    await waitFor(() => expect(screen.getByText('Failed to fetch')).toBeTruthy());
  });

  it('ignores a second submit while the first is pending', async () => {
    mockCreateTicket.mockReturnValue(new Promise(() => undefined));
    await openPanel(/submit a ticket/i);
    type(byId('ticket-subject'), 'Help');
    type(byId('ticket-message'), 'broken');
    const form = byId('ticket-subject').closest('form') as HTMLFormElement;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(mockCreateTicket).toHaveBeenCalledTimes(1);
  });
});

describe('feedback form', () => {
  it('requires a title and body and enforces the 300 character title limit', async () => {
    await openPanel(/send feedback/i);
    type(byId('feedback-title'), '');
    fireEvent.click(screen.getAllByRole('button', { name: /^send feedback$/i }).pop() as HTMLElement);
    expect(screen.getByText('Title is required.')).toBeTruthy();
    expect(screen.getByText('Feedback is required.')).toBeTruthy();
    expect(mockSubmitFeedback).not.toHaveBeenCalled();
    expect(byId('feedback-title').maxLength).toBe(300);
  });

  it('submits a valid form with the optional rating omitted', async () => {
    mockSubmitFeedback.mockResolvedValue({});
    await openPanel(/send feedback/i);
    type(byId('feedback-title'), 'Nice');
    type(byId('feedback-body'), 'Great app');
    fireEvent.click(screen.getAllByRole('button', { name: /^send feedback$/i }).pop() as HTMLElement);
    await waitFor(() => expect(mockSubmitFeedback).toHaveBeenCalledTimes(1));
    expect(mockSubmitFeedback.mock.calls[0][0]).toMatchObject({ title: 'Nice', body: 'Great app', rating: undefined });
  });
});

describe('ticket reply form', () => {
  it('rejects an empty reply with an accessible error', async () => {
    render(<TicketDetailPage />);
    await screen.findByRole('button', { name: /send reply/i });
    type(byId('ticket-reply'), '   ');
    fireEvent.click(screen.getByRole('button', { name: /send reply/i }));
    expect(screen.getByText('Reply cannot be empty.')).toBeTruthy();
    expect(byId('ticket-reply').getAttribute('aria-describedby')).toBe('ticket-reply-error');
    expect(mockAddComment).not.toHaveBeenCalled();
  });

  it('sends a trimmed reply once', async () => {
    mockAddComment.mockResolvedValue({ id: 'c1', ticketId: 't1', authorId: 'u', body: 'hi', visibility: 'public', createdAt: '' });
    render(<TicketDetailPage />);
    await screen.findByRole('button', { name: /send reply/i });
    type(byId('ticket-reply'), '  hi  ');
    fireEvent.click(screen.getByRole('button', { name: /send reply/i }));
    await waitFor(() => expect(mockAddComment).toHaveBeenCalledWith('t1', 'hi'));
    expect(mockAddComment).toHaveBeenCalledTimes(1);
  });
});
