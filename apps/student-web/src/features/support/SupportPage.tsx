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
  subject: string;
  status: 'open' | 'resolved' | 'closed';
  createdAt: string;
  category: string;
}

interface ReleaseNote {
  version: string;
  date: string;
  notes: string;
}

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
}

interface SupportData {
  tickets: Ticket[];
  releaseNotes: ReleaseNote[];
  serviceStatuses: ServiceStatus[];
}

export function SupportPage() {
  const [data, setData] = useState<SupportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  function fetchData() {
    setLoading(true);
    setError('');
    apiClient.get<SupportData>('/support')
      .then(setData)
      .catch((err: ApiError) => setError(err.message || 'Failed to load support'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchData(); }, []);

  function handleSubmitTicket(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    apiClient.post('/support/tickets', { category, subject, message })
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

  function handleSubmitFeedback(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    apiClient.post('/support/feedback', { message })
      .then(() => { setSuccess('Feedback sent. Thank you!'); setMessage(''); })
      .catch((err: ApiError) => setError(err.message || 'Failed to send feedback'))
      .finally(() => setSubmitting(false));
  }

  if (loading) return <LoadingSpinner />;
  if (error && !data) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return null;

  function getStatusClass(status: ServiceStatus['status']) {
    switch (status) {
      case 'operational': return styles.serviceUp;
      case 'degraded': return styles.serviceDegraded;
      case 'down': return styles.serviceDown;
    }
  }

  function getTicketStatusClass(status: Ticket['status']) {
    switch (status) {
      case 'open': return styles.statusOpen;
      case 'resolved': return styles.statusResolved;
      case 'closed': return styles.statusClosed;
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
              <select id="ticket-category" className={styles.formSelect} value={category} onChange={e => setCategory(e.target.value)}>
                <option value="general">General</option>
                <option value="bug">Bug Report</option>
                <option value="account">Account Issue</option>
                <option value="billing">Billing</option>
                <option value="feature">Feature Request</option>
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

      {data.tickets.length > 0 && (
        <section>
          <h2 className={styles.subtitle}>My Tickets</h2>
          <div className={styles.ticketList}>
            {data.tickets.map(ticket => (
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

      <section>
        <h2 className={styles.subtitle}>System Status</h2>
        <Card>
          <div className={styles.statusPage}>
            {data.serviceStatuses.map((svc, i) => (
              <div key={i} className={styles.statusItem}>
                <span className={styles.serviceName}>{svc.name}</span>
                <span className={`${styles.serviceStatus} ${getStatusClass(svc.status)}`}>
                  {svc.status === 'operational' ? 'Operational' : svc.status === 'degraded' ? 'Degraded' : 'Down'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {data.releaseNotes.length > 0 && (
        <section>
          <h2 className={styles.subtitle}>Release Notes</h2>
          <div className={styles.releaseList}>
            {data.releaseNotes.map((rn, i) => (
              <Card key={i}>
                <div className={styles.releaseCard}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-8)' }}>
                    <h3 className={styles.releaseVersion}>{rn.version}</h3>
                    <span className={styles.releaseDate}>{new Date(rn.date).toLocaleDateString()}</span>
                  </div>
                  <p className={styles.releaseNotes}>{rn.notes}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
