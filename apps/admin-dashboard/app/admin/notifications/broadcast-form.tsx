'use client';

import { useState, useTransition } from 'react';
import { AdminCard, AdminFormField, AdminInput, AdminTextarea, AdminButton, AdminSelect } from '../../../components/common';
import type { CreateBroadcastPayload } from '../../../lib/api/admin-notifications-api';

type Props = {
  readonly onSubmit: (payload: CreateBroadcastPayload) => Promise<{ error?: string }>;
  readonly onDone: () => void;
};

const SCHEDULE_LABELS: Record<string, string> = {
  once: 'Send immediately (one-time)',
  daily: 'Daily at 9 AM UTC',
  weekly: 'Weekly (Mondays at 9 AM UTC)',
  monthly: 'Monthly (1st of each month)',
};

export function BroadcastForm({ onSubmit, onDone }: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [channel, setChannel] = useState<'in_app' | 'push' | 'email'>('in_app');
  const [audience, setAudience] = useState<'all' | 'free' | 'students' | 'parents'>('all');
  const [schedule, setSchedule] = useState<'once' | 'daily' | 'weekly' | 'monthly'>('once');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Title is required.';
    if (!body.trim()) errors.body = 'Body is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setError(null);
    startTransition(async () => {
      const result = await onSubmit({ title: title.trim(), body: body.trim(), channel, audience, schedule });
      if (result.error) {
        setError(result.error);
      } else {
        onDone();
      }
    });
  }

  return (
    <AdminCard
      title="New Broadcast"
      description="Send a notification to a group of users. Recurring broadcasts fire automatically on schedule."
    >
      {error && <p className="admin-error-banner" role="alert">{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <AdminFormField id="bf-title" label="Title" required error={fieldErrors.title}>
          <AdminInput
            id="bf-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            maxLength={255}
            placeholder="e.g. New lesson available!"
          />
        </AdminFormField>

        <AdminFormField id="bf-body" label="Body" required error={fieldErrors.body}>
          <AdminTextarea
            id="bf-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isPending}
            rows={4}
            placeholder="Notification message body…"
          />
        </AdminFormField>

        <div style={{ display: 'flex', gap: 'var(--space-16)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <AdminFormField id="bf-channel" label="Channel">
              <AdminSelect
                id="bf-channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value as 'in_app' | 'push' | 'email')}
                disabled={isPending}
              >
                <option value="in_app">In-App</option>
                <option value="push">Push</option>
                <option value="email">Email</option>
              </AdminSelect>
            </AdminFormField>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <AdminFormField id="bf-audience" label="Audience">
              <AdminSelect
                id="bf-audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value as 'all' | 'free' | 'students' | 'parents')}
                disabled={isPending}
              >
                <option value="all">Everyone</option>
                <option value="free">Free tier users</option>
                <option value="students">Students only</option>
                <option value="parents">Parents only</option>
              </AdminSelect>
            </AdminFormField>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <AdminFormField id="bf-schedule" label="Schedule">
              <AdminSelect
                id="bf-schedule"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value as 'once' | 'daily' | 'weekly' | 'monthly')}
                disabled={isPending}
              >
                {Object.entries(SCHEDULE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </AdminSelect>
            </AdminFormField>
          </div>
        </div>

        {schedule !== 'once' && (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            This broadcast will fire automatically on its schedule. You can disable it any time from the broadcasts list.
          </p>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
          <AdminButton type="submit" variant="primary" disabled={isPending}>
            {isPending ? 'Sending…' : schedule === 'once' ? 'Send Now' : 'Create Schedule'}
          </AdminButton>
          <AdminButton type="button" variant="secondary" onClick={onDone} disabled={isPending}>
            Cancel
          </AdminButton>
        </div>
      </form>
    </AdminCard>
  );
}
