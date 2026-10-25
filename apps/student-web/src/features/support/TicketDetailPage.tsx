import { useState, useEffect, useCallback, FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import {
  fetchTicket,
  addTicketComment,
  TICKET_CATEGORY_LABELS,
  TICKET_SEVERITY_LABELS,
  TICKET_STATUS_LABELS,
  type SupportTicket,
  type SupportTicketComment,
} from './supportApi';
import styles from './Support.module.css';

function statusClass(status: SupportTicket['status']): string {
  switch (status) {
    case 'resolved': return styles.statusResolved;
    case 'closed': return styles.statusClosed;
    default: return styles.statusOpen;
  }
}

// GET /support-tickets/:id + POST /support-tickets/:id/comments.
// The backend has no endpoint to list a ticket's existing comments, so only
// replies sent from this page during this visit can be shown.
export function TicketDetailPage() {
  const { ticketId = '' } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [sentComments, setSentComments] = useState<SupportTicketComment[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchTicket(ticketId)
      .then(setTicket)
      .catch(err => setError(getErrorMessage(err, 'Failed to load ticket')))
      .finally(() => setLoading(false));
  }, [ticketId]);

  useEffect(() => { load(); }, [load]);

  async function handleReply(e: FormEvent) {
    e.preventDefault();
    const body = reply.trim();
    if (!body) return;
    setSending(true);
    setReplyError('');
    try {
      const comment = await addTicketComment(ticketId, body);
      setSentComments(prev => [...prev, comment]);
      setReply('');
    } catch (err) {
      setReplyError(getErrorMessage(err, 'Failed to send reply'));
    } finally {
      setSending(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error || !ticket) return <ErrorState message={error || 'Ticket not found'} onRetry={load} />;

  const closed = ticket.status === 'closed';

  return (
    <div className={styles.container}>
      <Link to="/support" className={styles.backLink}>← Back to support</Link>
      <h1 className={styles.heading}>{ticket.subject}</h1>

      <Card>
        <div className={styles.releaseCard}>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Status</span>
              <span>
                <span className={`${styles.ticketStatus} ${statusClass(ticket.status)}`}>
                  {TICKET_STATUS_LABELS[ticket.status] ?? ticket.status}
                </span>
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Category</span>
              <span className={styles.detailValue}>{TICKET_CATEGORY_LABELS[ticket.category] ?? ticket.category}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Severity</span>
              <span className={styles.detailValue}>{TICKET_SEVERITY_LABELS[ticket.severity] ?? ticket.severity}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Opened</span>
              <span className={styles.detailValue}>{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Last updated</span>
              <span className={styles.detailValue}>{new Date(ticket.updatedAt).toLocaleString()}</span>
            </div>
          </div>
          <p className={styles.releaseNotes}>{ticket.description}</p>
        </div>
      </Card>

      {ticket.status === 'waiting_on_user' && (
        <Banner variant="warning">Our support team is waiting for your reply.</Banner>
      )}

      <Card>
        <form className={styles.formContent} onSubmit={handleReply}>
          <h2 className={styles.subtitle}>Add a reply</h2>
          <p className={styles.description}>
            Earlier replies on this ticket can't be shown here yet; only messages you send now appear below.
          </p>
          {sentComments.length > 0 && (
            <ul className={styles.commentList}>
              {sentComments.map(c => (
                <li key={c.id} className={styles.comment}>
                  <span className={styles.releaseNotes}>{c.body}</span>
                  <span className={styles.releaseDate}>You · {new Date(c.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
          {replyError && <Banner variant="error">{replyError}</Banner>}
          {closed ? (
            <Banner variant="info">This ticket is closed. Open a new ticket if you still need help.</Banner>
          ) : (
            <>
              <div className={styles.formField}>
                <label className={styles.formLabel} htmlFor="ticket-reply">Message</label>
                <textarea
                  id="ticket-reply"
                  className={styles.formTextarea}
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formActions}>
                <Button variant="primary" type="submit" disabled={sending || !reply.trim()}>
                  {sending ? 'Sending…' : 'Send reply'}
                </Button>
              </div>
            </>
          )}
        </form>
      </Card>
    </div>
  );
}
