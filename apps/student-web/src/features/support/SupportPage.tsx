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
import styles from './Support.module.css';

type Panel = 'none' | 'ticket' | 'feedback';

function ticketStatusClass(status: SupportTicket['status']): string {
  switch (status) {
    case 'resolved': return styles.statusResolved;
    case 'closed': return styles.statusClosed;
    default: return styles.statusOpen;
  }
}

function serviceStatusClass(status: string): string {
  if (status === 'operational') return styles.serviceUp;
  if (status === 'degraded' || status === 'maintenance') return styles.serviceDegraded;
  if (status === 'partial_outage' || status === 'major_outage') return styles.serviceDown;
  return '';
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
    <div className={styles.container}>
      <h1 className={styles.heading}>Help & Support</h1>

      {success && <Banner variant="success">{success}</Banner>}

      <div className={styles.grid}>
        <Card>
          <button type="button" className={styles.helpCard} onClick={() => openPanel('ticket')} aria-expanded={panel === 'ticket'}>
            <span className={styles.helpIcon} aria-hidden="true">🎫</span>
            <h2 className={styles.helpTitle}>Submit a Ticket</h2>
            <span className={styles.helpDesc}>Report an issue or ask for help</span>
          </button>
        </Card>
        <Card>
          <button type="button" className={styles.helpCard} onClick={() => openPanel('feedback')} aria-expanded={panel === 'feedback'}>
            <span className={styles.helpIcon} aria-hidden="true">💬</span>
            <h2 className={styles.helpTitle}>Send Feedback</h2>
            <span className={styles.helpDesc}>Share your thoughts and suggestions</span>
          </button>
        </Card>
      </div>

      {panel === 'ticket' && (
        <Card>
          <form className={styles.formContent} onSubmit={handleSubmitTicket}>
            <h2 className={styles.subtitle}>New Support Ticket</h2>
            {formError && <Banner variant="error">{formError}</Banner>}
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel} htmlFor="ticket-category">Category</label>
                <select id="ticket-category" className={styles.formSelect} value={category} onChange={e => setCategory(e.target.value as TicketCategory)}>
                  {(Object.keys(TICKET_CATEGORY_LABELS) as TicketCategory[]).map(c => (
                    <option key={c} value={c}>{TICKET_CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel} htmlFor="ticket-severity">Severity</label>
                <select id="ticket-severity" className={styles.formSelect} value={severity} onChange={e => setSeverity(e.target.value as TicketSeverity)}>
                  {(Object.keys(TICKET_SEVERITY_LABELS) as TicketSeverity[]).map(s => (
                    <option key={s} value={s}>{TICKET_SEVERITY_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>
            <Input label="Subject" value={subject} maxLength={SUBJECT_MAX} onChange={e => setSubject(e.target.value)} required />
            <div className={styles.formField}>
              <label className={styles.formLabel} htmlFor="ticket-message">Message</label>
              <textarea id="ticket-message" className={styles.formTextarea} value={message} onChange={e => setMessage(e.target.value)} required />
            </div>
            <div className={styles.formActions}>
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
          <form className={styles.formContent} onSubmit={handleSubmitFeedback}>
            <h2 className={styles.subtitle}>Send Feedback</h2>
            {fbError && <Banner variant="error">{fbError}</Banner>}
            <div className={styles.formField}>
              <label className={styles.formLabel} htmlFor="feedback-category">Type</label>
              <select id="feedback-category" className={styles.formSelect} value={fbCategory} onChange={e => setFbCategory(e.target.value as FeedbackCategory)}>
                {(Object.keys(FEEDBACK_CATEGORY_LABELS) as FeedbackCategory[]).map(c => (
                  <option key={c} value={c}>{FEEDBACK_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div className={styles.formField}>
              <span className={styles.formLabel} id="feedback-rating-label">Rating (optional)</span>
              <div className={styles.ratingRow} role="radiogroup" aria-labelledby="feedback-rating-label">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={fbRating === n}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    className={`${styles.ratingStar} ${n <= fbRating ? styles.ratingStarActive : ''}`}
                    onClick={() => setFbRating(prev => (prev === n ? 0 : n))}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <Input label="Title" value={fbTitle} maxLength={FEEDBACK_TITLE_MAX} onChange={e => setFbTitle(e.target.value)} required />
            <div className={styles.formField}>
              <label className={styles.formLabel} htmlFor="feedback-body">Your feedback</label>
              <textarea id="feedback-body" className={styles.formTextarea} value={fbBody} onChange={e => setFbBody(e.target.value)} required />
            </div>
            <div className={styles.formActions}>
              <Button variant="ghost" type="button" onClick={() => setPanel('none')} disabled={fbSubmitting}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={fbSubmitting}>
                {fbSubmitting ? 'Sending…' : 'Send Feedback'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <section className={styles.section}>
        <h2 className={styles.subtitle}>My Tickets</h2>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={loadTickets} />
        ) : tickets.length === 0 ? (
          <EmptyState title="No tickets yet" message="Submit a ticket above if you need help." />
        ) : (
          <div className={styles.ticketList}>
            {tickets.map(ticket => (
              <Card key={ticket.id}>
                <Link to={`/support/tickets/${ticket.id}`} className={`${styles.ticketCard} ${styles.cardLink}`}>
                  <span className={styles.ticketTitle}>{ticket.subject}</span>
                  <div className={styles.ticketMeta}>
                    <span>{TICKET_CATEGORY_LABELS[ticket.category] ?? ticket.category}</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <span className={`${styles.ticketStatus} ${ticketStatusClass(ticket.status)}`}>
                      {TICKET_STATUS_LABELS[ticket.status] ?? ticket.status}
                    </span>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>System Status</h2>
        <Card>
          {statusError ? (
            <ErrorState message={statusError} onRetry={loadStatus} />
          ) : statuses === null ? (
            <LoadingSpinner />
          ) : statuses.length === 0 ? (
            <p className={styles.description}>No status information is available right now.</p>
          ) : (
            <div className={styles.statusPage}>
              {statuses.map(s => (
                <div key={s.id} className={styles.statusItem}>
                  <div className={styles.statusText}>
                    <span className={styles.serviceName}>{s.component}</span>
                    {s.description && <span className={styles.description}>{s.description}</span>}
                  </div>
                  <span className={`${styles.serviceStatus} ${serviceStatusClass(s.status)}`}>
                    {SERVICE_STATUS_LABELS[s.status] ?? s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>What's New</h2>
        {notesError ? (
          <ErrorState message={notesError} onRetry={loadNotes} />
        ) : notes === null ? (
          <LoadingSpinner />
        ) : notes.length === 0 ? (
          <Card><p className={styles.description}>No release notes yet.</p></Card>
        ) : (
          <div className={styles.releaseList}>
            {notes.map(note => (
              <Card key={note.id}>
                <div className={styles.releaseCard}>
                  <h3 className={styles.releaseVersion}>{note.title} <span className={styles.releaseDate}>v{note.version}</span></h3>
                  {note.publishedAt && <span className={styles.releaseDate}>{new Date(note.publishedAt).toLocaleDateString()}</span>}
                  {note.body && <p className={styles.releaseNotes}>{note.body}</p>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
