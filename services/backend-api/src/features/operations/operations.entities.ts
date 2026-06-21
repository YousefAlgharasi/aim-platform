export interface SupportTicket {
  id: string;
  requesterId: string;
  category: 'bug_report' | 'account_issue' | 'learning_issue' | 'billing_issue' | 'general' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'waiting_on_user' | 'resolved' | 'closed';
  assignedTo: string | null;
  subject: string;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  visibility: 'public' | 'internal';
  createdAt: Date;
}

export interface UserFeedback {
  id: string;
  userId: string;
  category: 'bug_report' | 'suggestion' | 'compliment' | 'complaint' | 'other';
  rating: number | null;
  title: string;
  body: string;
  sourceSurface: 'mobile_app' | 'admin_dashboard' | 'parent_dashboard' | 'api';
  status: 'new' | 'under_review' | 'accepted' | 'declined' | 'implemented';
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface FeatureRequest {
  id: string;
  submittedBy: string;
  title: string;
  description: string;
  status: 'new' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined';
  priority: 'low' | 'medium' | 'high' | 'critical' | null;
  voteCount: number;
  triageNotes: string | null;
  triagedBy: string | null;
  triagedAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncidentRecord {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'postmortem';
  impact: string | null;
  startedAt: Date;
  resolvedAt: Date | null;
  ownerId: string | null;
  postmortemUrl: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceWindow {
  id: string;
  title: string;
  description: string | null;
  type: 'planned' | 'emergency';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  affectedServices: string[];
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart: Date | null;
  actualEnd: Date | null;
  userMessage: string | null;
  createdBy: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReleaseNote {
  id: string;
  version: string;
  title: string;
  body: string | null;
  audience: 'all' | 'students' | 'parents' | 'admins' | 'internal';
  status: 'draft' | 'published' | 'archived';
  publishedAt: Date | null;
  publishedBy: string | null;
  createdBy: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperationalStatus {
  id: string;
  component: string;
  status: string;
  description: string | null;
  updatedBy: string | null;
  metadata: Record<string, unknown>;
  updatedAt: Date;
}

export interface FeatureFlag {
  id: string;
  flagKey: string;
  name: string;
  description: string | null;
  enabled: boolean;
  rolloutPercentage: number;
  audience: Record<string, unknown>;
  ownerId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperationsAuditLog {
  id: string;
  actorId: string;
  action: string;
  resourceType:
    | 'support_ticket'
    | 'feedback'
    | 'feature_request'
    | 'incident'
    | 'maintenance_window'
    | 'release_note'
    | 'operational_status'
    | 'feature_flag';
  resourceId: string;
  details: Record<string, unknown>;
  createdAt: Date;
}
