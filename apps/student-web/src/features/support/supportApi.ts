import { apiClient } from '../../api/client';

// Backend: services/backend-api/src/features/operations/
//   support-ticket.controller.ts, feedback.controller.ts, release-notes.controller.ts,
//   operational-status.controller.ts, operations.dtos.ts, operations.entities.ts
// Flutter: apps/mobile/lib/features/support/data/datasources/support_remote_datasource_impl.dart

export type TicketCategory = 'bug_report' | 'account_issue' | 'learning_issue' | 'billing_issue' | 'general' | 'other';
export type TicketSeverity = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_on_user' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  requesterId: string;
  category: TicketCategory;
  severity: TicketSeverity;
  status: TicketStatus;
  assignedTo: string | null;
  subject: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  visibility: 'public' | 'internal';
  createdAt: string;
}

export type FeedbackCategory = 'bug_report' | 'suggestion' | 'compliment' | 'complaint' | 'other';

export interface UserFeedback {
  id: string;
  category: FeedbackCategory;
  rating: number | null;
  title: string;
  body: string;
  status: string;
  createdAt: string;
}

export interface ReleaseNote {
  id: string;
  version: string;
  title: string;
  body: string | null;
  audience: 'all' | 'students' | 'parents' | 'admins' | 'internal';
  status: string;
  publishedAt: string | null;
  createdAt: string;
}

export interface OperationalStatus {
  id: string;
  component: string;
  status: string;
  description: string | null;
  updatedAt: string;
}

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  general: 'General',
  bug_report: 'Bug report',
  account_issue: 'Account issue',
  billing_issue: 'Billing',
  learning_issue: 'Learning issue',
  other: 'Other',
};

export const TICKET_SEVERITY_LABELS: Record<TicketSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  waiting_on_user: 'Waiting on you',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  suggestion: 'Suggestion',
  bug_report: 'Bug report',
  compliment: 'Compliment',
  complaint: 'Complaint',
  other: 'Other',
};

export const SERVICE_STATUS_LABELS: Record<string, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  partial_outage: 'Partial outage',
  major_outage: 'Major outage',
  maintenance: 'Maintenance',
};

export const SUBJECT_MAX = 500;
export const FEEDBACK_TITLE_MAX = 300;

export function fetchTickets(): Promise<SupportTicket[]> {
  return apiClient.get<SupportTicket[]>('/support-tickets');
}

export function fetchTicket(id: string): Promise<SupportTicket> {
  return apiClient.get<SupportTicket>(`/support-tickets/${encodeURIComponent(id)}`);
}

export function createTicket(input: {
  category: TicketCategory;
  severity: TicketSeverity;
  subject: string;
  description: string;
}): Promise<SupportTicket> {
  return apiClient.post<SupportTicket>('/support-tickets', input);
}

export function addTicketComment(ticketId: string, body: string): Promise<SupportTicketComment> {
  // visibility omitted → backend defaults to 'public'.
  return apiClient.post<SupportTicketComment>(`/support-tickets/${encodeURIComponent(ticketId)}/comments`, { body });
}

export function submitFeedback(input: {
  category: FeedbackCategory;
  rating?: number;
  title: string;
  body: string;
}): Promise<UserFeedback> {
  const payload: Record<string, unknown> = {
    category: input.category,
    title: input.title,
    body: input.body,
    // CreateFeedbackDto.sourceSurface has no web value
    // ('mobile_app' | 'admin_dashboard' | 'parent_dashboard' | 'api');
    // 'api' is the closest truthful option for the student web client.
    sourceSurface: 'api',
  };
  if (input.rating) payload.rating = input.rating;
  return apiClient.post<UserFeedback>('/feedback', payload);
}

export function fetchReleaseNotes(): Promise<ReleaseNote[]> {
  return apiClient.get<ReleaseNote[]>('/release-notes');
}

export function fetchOperationalStatus(): Promise<OperationalStatus[]> {
  return apiClient.get<OperationalStatus[]>('/operational-status');
}
