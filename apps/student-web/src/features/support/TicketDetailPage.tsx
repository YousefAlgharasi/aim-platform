import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { useI18n } from '../../i18n/I18nContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import {
  fetchTicket,
  addTicketComment,
  ticketCategoryLabel,
  ticketSeverityLabel,
  ticketStatusLabel,
  type SupportTicket,
  type SupportTicketComment,
} from './supportApi';
import { PageHeader, BackLink, SectionTitle, Field, StatusPill, labelCls, bodyCls, textareaCls } from '../profile/ui';

function statusTone(status: SupportTicket['status']): 'success' | 'neutral' | 'indigo' {
  switch (status) {
    case 'resolved': return 'success';
    case 'closed': return 'neutral';
    default: return 'indigo';
  }
}

// GET /support-tickets/:id + POST /support-tickets/:id/comments.
// The backend has no endpoint to list a ticket's existing comments, so only
// replies sent from this page during this visit can be shown.
export function TicketDetailPage() {
  const { ticketId = '' } = useParams<{ ticketId: string }>();
  const { t, formatDateTime } = useI18n();
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
      .catch(err => setError(getErrorMessage(err, t('Failed to load ticket'))))
      .finally(() => setLoading(false));
  }, [ticketId, t]);

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
      setReplyError(getErrorMessage(err, t('Failed to send reply')));
    } finally {
      setSending(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error || !ticket) return <ErrorState message={error || t('Ticket not found')} onRetry={load} />;

  const closed = ticket.status === 'closed';

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow={t('Support ticket')} title={ticket.subject} back={<BackLink to="/support" label="Back to support" />} />

      <div className="grid gap-5 lg:grid-cols-3 items-start">
        <div className="lg:col-span-1">
          <Card>
            <div className="flex flex-col gap-3.5">
              <dl className="m-0 grid grid-cols-2 lg:grid-cols-1 gap-3.5">
                <div className="flex flex-col gap-1">
                  <dt className={labelCls}>{t('Status')}</dt>
                  <dd className="m-0">
                    <StatusPill tone={statusTone(ticket.status)}>
                      {ticketStatusLabel(ticket.status)}
                    </StatusPill>
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className={labelCls}>{t('Category')}</dt>
                  <dd className={bodyCls}>{ticketCategoryLabel(ticket.category)}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className={labelCls}>{t('Severity')}</dt>
                  <dd className={bodyCls}>{ticketSeverityLabel(ticket.severity)}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className={labelCls}>{t('Opened')}</dt>
                  <dd className={bodyCls}>{formatDateTime(ticket.createdAt)}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className={labelCls}>{t('Last updated')}</dt>
                  <dd className={bodyCls}>{formatDateTime(ticket.updatedAt)}</dd>
                </div>
              </dl>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-5">
          <Card>
            <p className={`${bodyCls} whitespace-pre-wrap leading-relaxed`}>{ticket.description}</p>
          </Card>

          {ticket.status === 'waiting_on_user' && (
            <Banner variant="warning">{t('Our support team is waiting for your reply.')}</Banner>
          )}

          <Card>
            <form className="flex flex-col gap-4" onSubmit={handleReply}>
              <SectionTitle hint={t("Earlier replies on this ticket can't be shown here yet; only messages you send now appear below.")}>
                {t('Add a reply')}
              </SectionTitle>
              {sentComments.length > 0 && (
                <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                  {sentComments.map(c => (
                    <li key={c.id} className="rounded-2xl rounded-ee-md bg-indigo-50 dark:bg-indigo-950/30 px-4 py-3 flex flex-col gap-1">
                      <span className={`${bodyCls} whitespace-pre-wrap`}>{c.body}</span>
                      <span className="text-[11px] font-semibold text-slate-400">{t('You')} · {formatDateTime(c.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {replyError && <Banner variant="error">{replyError}</Banner>}
              {closed ? (
                <Banner variant="info">{t('This ticket is closed. Open a new ticket if you still need help.')}</Banner>
              ) : (
                <>
                  <Field label={t('Message')} htmlFor="ticket-reply">
                    <textarea
                      id="ticket-reply"
                      className={`${textareaCls} min-h-28`}
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      required
                    />
                  </Field>
                  <div className="flex justify-end">
                    <Button variant="primary" type="submit" disabled={sending || !reply.trim()}>
                      {sending ? t('Sending…') : t('Send reply')}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
