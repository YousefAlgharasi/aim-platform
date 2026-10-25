import { useState, useEffect, useCallback, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { Banner } from '../../components/common/Banner';
import {
  fetchTickets,
  createTicket,
  submitFeedback,
  fetchReleaseNotes,
  fetchOperationalStatus,
  TICKET_CATEGORY_LABELS,
  TICKET_SEVERITY_LABELS,
  TICKET_STATUS_LABELS,
  FEEDBACK_CATEGORY_LABELS,
  SERVICE_STATUS_LABELS,
  SUBJECT_MAX,
  FEEDBACK_TITLE_MAX,
  type SupportTicket,
  type TicketCategory,
  type TicketSeverity,
  type FeedbackCategory,
  type ReleaseNote,
  type OperationalStatus,
} from './supportApi';
import { ClipboardIcon, ChatIcon } from '../../components/common/Icons';
import { PageHeader, SectionTitle, Field, StatusPill, ChevronIcon, selectCls, textareaCls, labelCls, h2Cls, subCls, pillCls } from '../profile/ui';

type Panel = 'none' | 'ticket' | 'feedback';

function ticketTone(status: SupportTicket['status']): 'success' | 'neutral' | 'indigo' {
  switch (status) {
    case 'resolved': return 'success';
    case 'closed': return 'neutral';
    default: return 'indigo';
  }
}

function serviceTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'operational') return 'success';
  if (status === 'degraded' || status === 'maintenance') return 'warning';
  if (status === 'partial_outage' || status === 'major_outage') return 'danger';
  return 'neutral';
}

export function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [panel, setPanel] = useState<Panel>('none');
  const [success, setSuccess] = useState('');

  // Ticket form
  const [category, setCategory] = useState<TicketCategory>('general');
  const [severity, setSeverity] = useState<TicketSeverity>('medium');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Feedback form
  const [fbCategory, setFbCategory] = useState<FeedbackCategory>('suggestion');
  const [fbRating, setFbRating] = useState(0);
  const [fbTitle, setFbTitle] = useState('');
  const [fbBody, setFbBody] = useState('');
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [fbError, setFbError] = useState('');

  // Status + release notes
  const [statuses, setStatuses] = useState<OperationalStatus[] | null>(null);
  const [statusError, setStatusError] = useState('');
  const [notes, setNotes] = useState<ReleaseNote[] | null>(null);
  const [notesError, setNotesError] = useState('');

  const loadTickets = useCallback(() => {
    setLoading(true);
    setError('');
    fetchTickets()
      .then(setTickets)
      .catch(err => setError(getErrorMessage(err, 'Failed to load your support tickets')))
      .finally(() => setLoading(false));
  }, []);

  const loadStatus = useCallback(() => {
    setStatusError('');
    setStatuses(null);
    fetchOperationalStatus()
      .then(setStatuses)
      .catch(err => setStatusError(getErrorMessage(err, 'Failed to load system status')));
  }, []);

  const loadNotes = useCallback(() => {
    setNotesError('');
    setNotes(null);
    fetchReleaseNotes()
      // The endpoint ignores `audience`; only show notes meant for students.
      .then(all => setNotes(all.filter(n => n.audience === 'all' || n.audience === 'students')))
      .catch(err => setNotesError(getErrorMessage(err, 'Failed to load release notes')));
  }, []);

  useEffect(() => {
    loadTickets();
    loadStatus();
    loadNotes();
  }, [loadTickets, loadStatus, loadNotes]);

  function openPanel(next: Panel) {
    setPanel(prev => (prev === next ? 'none' : next));
    setSuccess('');
    setFormError('');
    setFbError('');
  }

  async function handleSubmitTicket(e: FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setFormError('Please fill in a subject and a message.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const created = await createTicket({
        category,
        severity,
        subject: subject.trim(),
        description: message.trim(),
      });
      setTickets(prev => [created, ...prev.filter(t => t.id !== created.id)]);
      setSuccess('Ticket submitted. Our team will get back to you.');
      setPanel('none');
      setSubject('');
      setMessage('');
      setCategory('general');
      setSeverity('medium');
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to submit ticket'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitFeedback(e: FormEvent) {
    e.preventDefault();
    if (!fbTitle.trim() || !fbBody.trim()) {
      setFbError('Please add a title and your feedback.');
      return;
    }
    setFbSubmitting(true);
    setFbError('');
    try {
      await submitFeedback({
        category: fbCategory,
        rating: fbRating || undefined,
        title: fbTitle.trim(),
        body: fbBody.trim(),
      });
      setSuccess('Thanks for your feedback!');
      setPanel('none');
      setFbTitle('');
      setFbBody('');
      setFbRating(0);
      setFbCategory('suggestion');
    } catch (err) {
      setFbError(getErrorMessage(err, 'Failed to send feedback'));
    } finally {
      setFbSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Support" title="Help & Support" subtitle="Get help, share feedback and check our status." />

      {success && <Banner variant="success">{success}</Banner>}

      <div className="grid gap-4 sm:grid-cols-2">
        {([
          { key: 'ticket' as const, icon: <ClipboardIcon className="size-5" />, title: 'Submit a Ticket', desc: 'Report an issue or ask for help' },
          { key: 'feedback' as const, icon: <ChatIcon className="size-5" />, title: 'Send Feedback', desc: 'Share your thoughts and suggestions' },
        ]).map(c => (
          <button
            key={c.key}
            type="button"
            onClick={() => openPanel(c.key)}
            aria-expanded={panel === c.key}
            className={`flex items-center gap-3.5 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm text-start cursor-pointer border-none transition-all hover:shadow-md ${
              panel === c.key ? 'ring-2 ring-[#4F46E5]' : 'ring-1 ring-[#E2E8F0] dark:ring-slate-700'
            }`}
          >
            <span className="size-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0" aria-hidden="true">{c.icon}</span>
            <span className="flex flex-col gap-0.5 min-w-0">
              <h2 className={h2Cls}>{c.title}</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">{c.desc}</span>
            </span>
          </button>
        ))}
      </div>

      {panel === 'ticket' && (
        <Card>
          <form className="flex flex-col gap-4" onSubmit={handleSubmitTicket}>
            <SectionTitle>New Support Ticket</SectionTitle>
            {formError && <Banner variant="error">{formError}</Banner>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" htmlFor="ticket-category">
                <select id="ticket-category" className={selectCls} value={category} onChange={e => setCategory(e.target.value as TicketCategory)}>
                  {(Object.keys(TICKET_CATEGORY_LABELS) as TicketCategory[]).map(c => (
                    <option key={c} value={c}>{TICKET_CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </Field>
              <Field label="Severity" htmlFor="ticket-severity">
                <select id="ticket-severity" className={selectCls} value={severity} onChange={e => setSeverity(e.target.value as TicketSeverity)}>
                  {(Object.keys(TICKET_SEVERITY_LABELS) as TicketSeverity[]).map(s => (
                    <option key={s} value={s}>{TICKET_SEVERITY_LABELS[s]}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Input label="Subject" value={subject} maxLength={SUBJECT_MAX} onChange={e => setSubject(e.target.value)} required />
            <Field label="Message" htmlFor="ticket-message">
              <textarea id="ticket-message" className={`${textareaCls} min-h-32`} value={message} onChange={e => setMessage(e.target.value)} required />
            </Field>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => setPanel('none')} disabled={submitting}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Ticket'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {panel === 'feedback' && (
        <Card>
          <form className="flex flex-col gap-4" onSubmit={handleSubmitFeedback}>
            <SectionTitle>Send Feedback</SectionTitle>
            {fbError && <Banner variant="error">{fbError}</Banner>}
            <Field label="Type" htmlFor="feedback-category">
              <select id="feedback-category" className={selectCls} value={fbCategory} onChange={e => setFbCategory(e.target.value as FeedbackCategory)}>
                {(Object.keys(FEEDBACK_CATEGORY_LABELS) as FeedbackCategory[]).map(c => (
                  <option key={c} value={c}>{FEEDBACK_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </Field>
            <div className="flex flex-col gap-1.5">
              <span className={labelCls} id="feedback-rating-label">Rating (optional)</span>
              <div className="flex gap-1" role="radiogroup" aria-labelledby="feedback-rating-label">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={fbRating === n}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    className={`size-10 rounded-xl border-none bg-transparent cursor-pointer text-2xl transition-colors hover:bg-amber-50 dark:hover:bg-slate-700 ${n <= fbRating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                    onClick={() => setFbRating(prev => (prev === n ? 0 : n))}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <Input label="Title" value={fbTitle} maxLength={FEEDBACK_TITLE_MAX} onChange={e => setFbTitle(e.target.value)} required />
            <Field label="Your feedback" htmlFor="feedback-body">
              <textarea id="feedback-body" className={`${textareaCls} min-h-32`} value={fbBody} onChange={e => setFbBody(e.target.value)} required />
            </Field>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => setPanel('none')} disabled={fbSubmitting}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={fbSubmitting}>
                {fbSubmitting ? 'Sending…' : 'Send Feedback'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <section className="flex flex-col gap-3">
        <h2 className={h2Cls}>My Tickets</h2>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={loadTickets} />
        ) : tickets.length === 0 ? (
          <EmptyState title="No tickets yet" message="Submit a ticket above if you need help." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {tickets.map(ticket => (
              <Link
                key={ticket.id}
                to={`/support/tickets/${ticket.id}`}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 ring-1 ring-[#E2E8F0] dark:ring-slate-700 shadow-sm no-underline hover:shadow-md transition-shadow"
              >
                <span className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{ticket.subject}</span>
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>{TICKET_CATEGORY_LABELS[ticket.category] ?? ticket.category}</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <StatusPill tone={ticketTone(ticket.status)}>
                      {TICKET_STATUS_LABELS[ticket.status] ?? ticket.status}
                    </StatusPill>
                  </span>
                </span>
                <ChevronIcon className="size-4 text-slate-400 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={h2Cls}>System Status</h2>
        <Card>
          {statusError ? (
            <ErrorState message={statusError} onRetry={loadStatus} />
          ) : statuses === null ? (
            <LoadingSpinner />
          ) : statuses.length === 0 ? (
            <p className={subCls}>No status information is available right now.</p>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
              {statuses.map(s => (
                <div key={s.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{s.component}</span>
                    {s.description && <span className={subCls}>{s.description}</span>}
                  </div>
                  <StatusPill tone={serviceTone(s.status)}>
                    {SERVICE_STATUS_LABELS[s.status] ?? s.status}
                  </StatusPill>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={h2Cls}>What's New</h2>
        {notesError ? (
          <ErrorState message={notesError} onRetry={loadNotes} />
        ) : notes === null ? (
          <LoadingSpinner />
        ) : notes.length === 0 ? (
          <Card><p className={subCls}>No release notes yet.</p></Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {notes.map(note => (
              <Card key={note.id}>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white m-0">{note.title}</h3>
                    <span className={pillCls}>v{note.version}</span>
                  </div>
                  {note.publishedAt && <span className="text-xs text-slate-400">{new Date(note.publishedAt).toLocaleDateString()}</span>}
                  {note.body && <p className={`${subCls} whitespace-pre-wrap`}>{note.body}</p>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
