import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { Banner } from '../../components/common/Banner';
import type { ApiError } from '../../types';
import styles from './Support.module.css';

interface Ticket {
  id: string;
  requesterId: string;
  category: 'bug_report' | 'account_issue' | 'learning_issue' | 'billing_issue' | 'general' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'waiting_on_user' | 'resolved' | 'closed';
  subject: string;
  description: string;
  createdAt: string;
}

export function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<Ticket['category']>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  function fetchData() {
    setLoading(true);
    setError('');
    apiClient.get<Ticket[]>('/support-tickets')
      .then(setTickets)
      .catch((err: ApiError) => setError(err.message || 'Failed to load support'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchData(); }, []);

  function handleSubmitTicket(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    apiClient.post('/support-tickets', { category, severity: 'medium', subject, description: message })
      .then(() => {
        setSuccess('Ticket submitted successfully');
        setShowForm(false);
        setSubject('');
        setMessage('');
        fetchData();
      })
      .catch((err: ApiError) => setError(err.message || 'Failed to submit ticket'))
      .finally(() => setSubmitting(false));
  }

  if (loading) return <LoadingSpinner />;
  if (error && tickets.length === 0) return <ErrorState message={error} onRetry={fetchData} />;

  function getTicketStatusClass(status: Ticket['status']) {
    switch (status) {
      case 'open': return styles.statusOpen;
      case 'resolved': return styles.statusResolved;
      case 'closed': return styles.statusClosed;
      default: return styles.statusOpen;
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Help & Support</h1>

      {success && <Banner variant="success">{success}</Banner>}

      <div className={styles.grid}>
        <Card>
          <div className={styles.helpCard} onClick={() => setShowForm(true)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setShowForm(true)}>
            <span className={styles.helpIcon} aria-hidden="true">🎫</span>
            <h2 className={styles.helpTitle}>Submit a Ticket</h2>
            <span className={styles.helpDesc}>Report an issue or ask for help</span>
          </div>
        </Card>
        <Card>
          <Link to="/support/feedback" className={styles.helpCard}>
            <span className={styles.helpIcon} aria-hidden="true">💬</span>
            <h2 className={styles.helpTitle}>Send Feedback</h2>
            <span className={styles.helpDesc}>Share your thoughts and suggestions</span>
          </Link>
        </Card>
      </div>

      {showForm && (
        <Card>
          <form className={styles.formContent} onSubmit={handleSubmitTicket}>
            <h2 className={styles.subtitle}>New Support Ticket</h2>
            <div className={styles.formField}>
              <label className={styles.formLabel} htmlFor="ticket-category">Category</label>
              <select id="ticket-category" className={styles.formSelect} value={category} onChange={e => setCategory(e.target.value as Ticket['category'])}>
                <option value="general">General</option>
                <option value="bug_report">Bug Report</option>
                <option value="account_issue">Account Issue</option>
                <option value="billing_issue">Billing</option>
                <option value="learning_issue">Learning Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Input label="Subject" value={subject} onChange={e => setSubject(e.target.value)} required />
            <div className={styles.formField}>
              <label className={styles.formLabel} htmlFor="ticket-message">Message</label>
              <textarea id="ticket-message" className={styles.formTextarea} value={message} onChange={e => setMessage(e.target.value)} required />
            </div>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Ticket'}
            </Button>
          </form>
        </Card>
      )}

      {tickets.length > 0 && (
        <section>
          <h2 className={styles.subtitle}>My Tickets</h2>
          <div className={styles.ticketList}>
            {tickets.map(ticket => (
              <Card key={ticket.id}>
                <div className={styles.ticketCard}>
                  <span className={styles.ticketTitle}>{ticket.subject}</span>
                  <div className={styles.ticketMeta}>
                    <span>{ticket.category}</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <span className={`${styles.ticketStatus} ${getTicketStatusClass(ticket.status)}`}>{ticket.status}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {tickets.length === 0 && (
        <EmptyState title="No tickets yet" message="Submit a ticket above if you need help." />
      )}
    </div>
  );
}
