import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  SupportTicket,
  SupportTicketComment,
  UserFeedback,
  FeatureRequest,
  IncidentRecord,
  MaintenanceWindow,
  ReleaseNote,
  OperationalStatus,
  FeatureFlag,
  OperationsAuditLog,
} from './operations.entities';

@Injectable()
export class OperationsRepository {
  constructor(private readonly db: DatabaseService) {}

  // --- Support Tickets ---

  async findTicketsByRequester(requesterId: string): Promise<SupportTicket[]> {
    return (await this.db.query<SupportTicket>(
      `SELECT * FROM support_tickets WHERE requester_id = $1 ORDER BY created_at DESC`,
      [requesterId],
    )).rows;
  }

  async findTicketById(id: string): Promise<SupportTicket | null> {
    const result = await this.db.query<SupportTicket>(
      `SELECT * FROM support_tickets WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async createTicket(data: Partial<SupportTicket>): Promise<SupportTicket> {
    const result = await this.db.query<SupportTicket>(
      `INSERT INTO support_tickets (requester_id, category, severity, subject, description, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.requesterId, data.category, data.severity, data.subject, data.description, data.metadata || {}],
    );
    return result.rows[0];
  }

  async updateTicketStatus(id: string, status: string): Promise<SupportTicket | null> {
    const result = await this.db.query<SupportTicket>(
      `UPDATE support_tickets SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id],
    );
    return result.rows[0] || null;
  }

  async assignTicketTo(id: string, assigneeId: string): Promise<SupportTicket | null> {
    const result = await this.db.query<SupportTicket>(
      `UPDATE support_tickets SET assigned_to = $1 WHERE id = $2 RETURNING *`,
      [assigneeId, id],
    );
    return result.rows[0] || null;
  }

  // --- Support Ticket Comments ---

  async findCommentsByTicket(ticketId: string): Promise<SupportTicketComment[]> {
    return (await this.db.query<SupportTicketComment>(
      `SELECT * FROM support_ticket_comments WHERE ticket_id = $1 ORDER BY created_at ASC`,
      [ticketId],
    )).rows;
  }

  async createComment(data: Partial<SupportTicketComment>): Promise<SupportTicketComment> {
    const result = await this.db.query<SupportTicketComment>(
      `INSERT INTO support_ticket_comments (ticket_id, author_id, body, visibility)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.ticketId, data.authorId, data.body, data.visibility || 'public'],
    );
    return result.rows[0];
  }

  // --- User Feedback ---

  async findFeedbackByUser(userId: string): Promise<UserFeedback[]> {
    return (await this.db.query<UserFeedback>(
      `SELECT * FROM user_feedback WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    )).rows;
  }

  async findFeedbackById(id: string): Promise<UserFeedback | null> {
    const result = await this.db.query<UserFeedback>(
      `SELECT * FROM user_feedback WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async createFeedback(data: Partial<UserFeedback>): Promise<UserFeedback> {
    const result = await this.db.query<UserFeedback>(
      `INSERT INTO user_feedback (user_id, category, rating, title, body, source_surface, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [data.userId, data.category, data.rating || null, data.title, data.body, data.sourceSurface, data.metadata || {}],
    );
    return result.rows[0];
  }

  async updateFeedbackStatus(id: string, status: string): Promise<UserFeedback | null> {
    const result = await this.db.query<UserFeedback>(
      `UPDATE user_feedback SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id],
    );
    return result.rows[0] || null;
  }

  // --- Feature Requests ---

  async findAllFeatureRequests(limit: number = 50, offset: number = 0): Promise<FeatureRequest[]> {
    return (await this.db.query<FeatureRequest>(
      `SELECT * FROM feature_requests ORDER BY vote_count DESC, created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    )).rows;
  }

  async findFeatureRequestById(id: string): Promise<FeatureRequest | null> {
    const result = await this.db.query<FeatureRequest>(
      `SELECT * FROM feature_requests WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async createFeatureRequest(data: Partial<FeatureRequest>): Promise<FeatureRequest> {
    const result = await this.db.query<FeatureRequest>(
      `INSERT INTO feature_requests (submitted_by, title, description, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.submittedBy, data.title, data.description, data.metadata || {}],
    );
    return result.rows[0];
  }

  async updateFeatureRequestStatus(
    id: string,
    status: string,
    priority?: string | null,
    triageNotes?: string | null,
    triagedBy?: string | null,
  ): Promise<FeatureRequest | null> {
    const result = await this.db.query<FeatureRequest>(
      `UPDATE feature_requests
       SET status = $1,
           priority = COALESCE($2, priority),
           triage_notes = COALESCE($3, triage_notes),
           triaged_by = COALESCE($4, triaged_by),
           triaged_at = CASE WHEN $4 IS NOT NULL THEN now() ELSE triaged_at END
       WHERE id = $5
       RETURNING *`,
      [status, priority || null, triageNotes || null, triagedBy || null, id],
    );
    return result.rows[0] || null;
  }

  async incrementFeatureRequestVote(id: string): Promise<FeatureRequest | null> {
    const result = await this.db.query<FeatureRequest>(
      `UPDATE feature_requests SET vote_count = vote_count + 1 WHERE id = $1 RETURNING *`,
      [id],
    );
    return result.rows[0] || null;
  }

  // --- Incident Records ---

  async findAllIncidents(limit: number = 50, offset: number = 0): Promise<IncidentRecord[]> {
    return (await this.db.query<IncidentRecord>(
      `SELECT * FROM incident_records ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    )).rows;
  }

  async findIncidentById(id: string): Promise<IncidentRecord | null> {
    const result = await this.db.query<IncidentRecord>(
      `SELECT * FROM incident_records WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async createIncident(data: Partial<IncidentRecord>): Promise<IncidentRecord> {
    const result = await this.db.query<IncidentRecord>(
      `INSERT INTO incident_records (title, description, severity, started_at, owner_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.title, data.description, data.severity, data.startedAt, data.ownerId || null, data.metadata || {}],
    );
    return result.rows[0];
  }

  async updateIncidentStatus(
    id: string,
    status: string,
    resolvedAt?: Date | null,
    postmortemUrl?: string | null,
  ): Promise<IncidentRecord | null> {
    const result = await this.db.query<IncidentRecord>(
      `UPDATE incident_records
       SET status = $1,
           resolved_at = COALESCE($2, resolved_at),
           postmortem_url = COALESCE($3, postmortem_url)
       WHERE id = $4
       RETURNING *`,
      [status, resolvedAt || null, postmortemUrl || null, id],
    );
    return result.rows[0] || null;
  }

  // --- Maintenance Windows ---

  async findAllMaintenanceWindows(limit: number = 50, offset: number = 0): Promise<MaintenanceWindow[]> {
    return (await this.db.query<MaintenanceWindow>(
      `SELECT * FROM maintenance_windows ORDER BY scheduled_start DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    )).rows;
  }

  async findMaintenanceWindowById(id: string): Promise<MaintenanceWindow | null> {
    const result = await this.db.query<MaintenanceWindow>(
      `SELECT * FROM maintenance_windows WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async createMaintenanceWindow(data: Partial<MaintenanceWindow>): Promise<MaintenanceWindow> {
    const result = await this.db.query<MaintenanceWindow>(
      `INSERT INTO maintenance_windows (title, description, type, affected_services, scheduled_start, scheduled_end, user_message, created_by, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [data.title, data.description || null, data.type, data.affectedServices || [], data.scheduledStart, data.scheduledEnd, data.userMessage || null, data.createdBy, data.metadata || {}],
    );
    return result.rows[0];
  }

  async updateMaintenanceWindowStatus(
    id: string,
    status: string,
    actualStart?: Date | null,
    actualEnd?: Date | null,
  ): Promise<MaintenanceWindow | null> {
    const result = await this.db.query<MaintenanceWindow>(
      `UPDATE maintenance_windows
       SET status = $1,
           actual_start = COALESCE($2, actual_start),
           actual_end = COALESCE($3, actual_end)
       WHERE id = $4
       RETURNING *`,
      [status, actualStart || null, actualEnd || null, id],
    );
    return result.rows[0] || null;
  }

  // --- Release Notes ---

  async findAllReleaseNotes(limit: number = 50, offset: number = 0): Promise<ReleaseNote[]> {
    return (await this.db.query<ReleaseNote>(
      `SELECT * FROM release_notes ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    )).rows;
  }

  async findPublishedReleaseNotes(limit: number = 50, offset: number = 0): Promise<ReleaseNote[]> {
    return (await this.db.query<ReleaseNote>(
      `SELECT * FROM release_notes WHERE status = 'published' ORDER BY published_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    )).rows;
  }

  async findReleaseNoteById(id: string): Promise<ReleaseNote | null> {
    const result = await this.db.query<ReleaseNote>(
      `SELECT * FROM release_notes WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async createReleaseNote(data: Partial<ReleaseNote>): Promise<ReleaseNote> {
    const result = await this.db.query<ReleaseNote>(
      `INSERT INTO release_notes (version, title, body, audience, created_by, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.version, data.title, data.body || null, data.audience || 'all', data.createdBy, data.metadata || {}],
    );
    return result.rows[0];
  }

  async publishReleaseNote(id: string, publishedBy: string): Promise<ReleaseNote | null> {
    const result = await this.db.query<ReleaseNote>(
      `UPDATE release_notes SET status = 'published', published_at = now(), published_by = $1 WHERE id = $2 RETURNING *`,
      [publishedBy, id],
    );
    return result.rows[0] || null;
  }

  // --- Operational Status ---

  async findAllOperationalStatuses(): Promise<OperationalStatus[]> {
    return (await this.db.query<OperationalStatus>(
      `SELECT * FROM operational_status ORDER BY component ASC`,
    )).rows;
  }

  async findOperationalStatusByComponent(component: string): Promise<OperationalStatus | null> {
    const result = await this.db.query<OperationalStatus>(
      `SELECT * FROM operational_status WHERE component = $1`,
      [component],
    );
    return result.rows[0] || null;
  }

  async upsertOperationalStatus(
    component: string,
    status: string,
    description: string | null,
    updatedBy: string,
  ): Promise<OperationalStatus> {
    const result = await this.db.query<OperationalStatus>(
      `INSERT INTO operational_status (component, status, description, updated_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (component)
       DO UPDATE SET status = $2, description = $3, updated_by = $4, updated_at = now()
       RETURNING *`,
      [component, status, description, updatedBy],
    );
    return result.rows[0];
  }

  // --- Feature Flags ---

  async findAllFeatureFlags(): Promise<FeatureFlag[]> {
    return (await this.db.query<FeatureFlag>(
      `SELECT * FROM feature_flags ORDER BY flag_key ASC`,
    )).rows;
  }

  async findFeatureFlagByKey(flagKey: string): Promise<FeatureFlag | null> {
    const result = await this.db.query<FeatureFlag>(
      `SELECT * FROM feature_flags WHERE flag_key = $1`,
      [flagKey],
    );
    return result.rows[0] || null;
  }

  async createFeatureFlag(data: Partial<FeatureFlag>): Promise<FeatureFlag> {
    const result = await this.db.query<FeatureFlag>(
      `INSERT INTO feature_flags (flag_key, name, description, owner_id, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.flagKey, data.name, data.description || null, data.ownerId || null, data.metadata || {}],
    );
    return result.rows[0];
  }

  async updateFeatureFlag(
    id: string,
    data: { enabled?: boolean; rolloutPercentage?: number; audience?: Record<string, unknown> },
  ): Promise<FeatureFlag | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.enabled !== undefined) { sets.push(`enabled = $${idx++}`); values.push(data.enabled); }
    if (data.rolloutPercentage !== undefined) { sets.push(`rollout_percentage = $${idx++}`); values.push(data.rolloutPercentage); }
    if (data.audience !== undefined) { sets.push(`audience = $${idx++}`); values.push(data.audience); }

    if (sets.length === 0) {
      return this.findFeatureFlagById(id);
    }

    values.push(id);

    const result = await this.db.query<FeatureFlag>(
      `UPDATE feature_flags SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return result.rows[0] || null;
  }

  private async findFeatureFlagById(id: string): Promise<FeatureFlag | null> {
    const result = await this.db.query<FeatureFlag>(
      `SELECT * FROM feature_flags WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  // --- Operations Audit Logs ---

  async createAuditLog(data: Partial<OperationsAuditLog>): Promise<OperationsAuditLog> {
    const result = await this.db.query<OperationsAuditLog>(
      `INSERT INTO operations_audit_logs (actor_id, action, resource_type, resource_id, details)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.actorId, data.action, data.resourceType, data.resourceId, data.details || {}],
    );
    return result.rows[0];
  }

  async findAuditLogsByResource(resourceType: string, resourceId: string): Promise<OperationsAuditLog[]> {
    return (await this.db.query<OperationsAuditLog>(
      `SELECT * FROM operations_audit_logs WHERE resource_type = $1 AND resource_id = $2 ORDER BY created_at DESC`,
      [resourceType, resourceId],
    )).rows;
  }

  async findAuditLogsByActor(actorId: string, limit: number = 50, offset: number = 0): Promise<OperationsAuditLog[]> {
    return (await this.db.query<OperationsAuditLog>(
      `SELECT * FROM operations_audit_logs WHERE actor_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [actorId, limit, offset],
    )).rows;
  }
}
