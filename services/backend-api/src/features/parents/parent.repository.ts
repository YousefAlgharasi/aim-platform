// P12-019: Create Parent Repository Layer
// Backend-only persistence abstraction for parent_child_links,
// parent_invitations, parent_consents, and parent_access_audit_logs.
//
// This repository never validates relationship, consent, or child-scope
// authorization itself — callers (guards/services) must resolve and check
// authorization before calling these methods. It only persists and reads
// what it is given, and never computes mastery, weakness, score,
// correctness, recommendations, or any AIM/assessment output.

import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../database/database.service';
import {
  ParentAccessAuditLogRow,
  ParentChildLinkRow,
  ParentConsentRow,
  ParentInvitationRow,
} from './parent-repository.types';

const PARENT_CHILD_LINK_COLUMNS = `id, parent_id, child_id, relationship_type, status,
       linked_at, revoked_at, created_at, updated_at`;

const PARENT_INVITATION_COLUMNS = `id, parent_id, child_email, child_id, invitation_code,
       relationship_type, status, expires_at, accepted_at, created_at, updated_at`;

const PARENT_CONSENT_COLUMNS = `id, parent_child_link_id, consent_type, status,
       granted_at, revoked_at, granted_by, created_at, updated_at`;

const PARENT_ACCESS_AUDIT_LOG_COLUMNS = `id, parent_id, child_id, action, resource_type,
       ip_address, user_agent, created_at`;

@Injectable()
export class ParentRepository {
  constructor(private readonly db: DatabaseService) {}

  // ---------------------------------------------------------------------
  // Parent-child links
  // ---------------------------------------------------------------------

  async createLink(
    parentId: string,
    childId: string,
    relationshipType: string,
  ): Promise<ParentChildLinkRow> {
    const result = await this.db.query<ParentChildLinkRow>(
      `INSERT INTO parent_child_links (parent_id, child_id, relationship_type)
       VALUES ($1, $2, $3)
       RETURNING ${PARENT_CHILD_LINK_COLUMNS}`,
      [parentId, childId, relationshipType],
    );

    return result.rows[0];
  }

  async findLinkById(linkId: string): Promise<ParentChildLinkRow | null> {
    const result = await this.db.query<ParentChildLinkRow>(
      `SELECT ${PARENT_CHILD_LINK_COLUMNS}
       FROM parent_child_links
       WHERE id = $1
       LIMIT 1`,
      [linkId],
    );

    return result.rows[0] ?? null;
  }

  async findActiveLink(parentId: string, childId: string): Promise<ParentChildLinkRow | null> {
    const result = await this.db.query<ParentChildLinkRow>(
      `SELECT ${PARENT_CHILD_LINK_COLUMNS}
       FROM parent_child_links
       WHERE parent_id = $1 AND child_id = $2 AND status = 'active'
       LIMIT 1`,
      [parentId, childId],
    );

    return result.rows[0] ?? null;
  }

  async findLinksByParent(parentId: string): Promise<ParentChildLinkRow[]> {
    const result = await this.db.query<ParentChildLinkRow>(
      `SELECT ${PARENT_CHILD_LINK_COLUMNS}
       FROM parent_child_links
       WHERE parent_id = $1
       ORDER BY created_at DESC`,
      [parentId],
    );

    return result.rows;
  }

  async findLinksByChild(childId: string): Promise<ParentChildLinkRow[]> {
    const result = await this.db.query<ParentChildLinkRow>(
      `SELECT ${PARENT_CHILD_LINK_COLUMNS}
       FROM parent_child_links
       WHERE child_id = $1
       ORDER BY created_at DESC`,
      [childId],
    );

    return result.rows;
  }

  async activateLink(linkId: string): Promise<void> {
    await this.db.query(
      `UPDATE parent_child_links
       SET status = 'active', linked_at = now()
       WHERE id = $1`,
      [linkId],
    );
  }

  async revokeLink(linkId: string): Promise<void> {
    await this.db.query(
      `UPDATE parent_child_links
       SET status = 'revoked', revoked_at = now()
       WHERE id = $1`,
      [linkId],
    );
  }

  // ---------------------------------------------------------------------
  // Parent invitations
  // ---------------------------------------------------------------------

  async createInvitation(
    parentId: string,
    relationshipType: string,
    invitationCode: string,
    expiresAt: Date,
    childEmail: string | null,
    childId: string | null,
  ): Promise<ParentInvitationRow> {
    const result = await this.db.query<ParentInvitationRow>(
      `INSERT INTO parent_invitations
         (parent_id, child_email, child_id, invitation_code, relationship_type, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${PARENT_INVITATION_COLUMNS}`,
      [parentId, childEmail, childId, invitationCode, relationshipType, expiresAt],
    );

    return result.rows[0];
  }

  async findInvitationById(invitationId: string): Promise<ParentInvitationRow | null> {
    const result = await this.db.query<ParentInvitationRow>(
      `SELECT ${PARENT_INVITATION_COLUMNS}
       FROM parent_invitations
       WHERE id = $1
       LIMIT 1`,
      [invitationId],
    );

    return result.rows[0] ?? null;
  }

  async findInvitationByCode(invitationCode: string): Promise<ParentInvitationRow | null> {
    const result = await this.db.query<ParentInvitationRow>(
      `SELECT ${PARENT_INVITATION_COLUMNS}
       FROM parent_invitations
       WHERE invitation_code = $1 AND status = 'pending'
       LIMIT 1`,
      [invitationCode],
    );

    return result.rows[0] ?? null;
  }

  async findInvitationsByParent(parentId: string): Promise<ParentInvitationRow[]> {
    const result = await this.db.query<ParentInvitationRow>(
      `SELECT ${PARENT_INVITATION_COLUMNS}
       FROM parent_invitations
       WHERE parent_id = $1
       ORDER BY created_at DESC`,
      [parentId],
    );

    return result.rows;
  }

  async markInvitationAccepted(invitationId: string, childId: string): Promise<void> {
    await this.db.query(
      `UPDATE parent_invitations
       SET status = 'accepted', accepted_at = now(), child_id = $2
       WHERE id = $1`,
      [invitationId, childId],
    );
  }

  async markInvitationStatus(
    invitationId: string,
    status: 'rejected' | 'expired' | 'cancelled',
  ): Promise<void> {
    await this.db.query(
      `UPDATE parent_invitations
       SET status = $2
       WHERE id = $1`,
      [invitationId, status],
    );
  }

  // ---------------------------------------------------------------------
  // Parent consents
  // ---------------------------------------------------------------------

  async grantConsent(
    parentChildLinkId: string,
    consentType: string,
    grantedBy: string,
  ): Promise<ParentConsentRow> {
    const result = await this.db.query<ParentConsentRow>(
      `INSERT INTO parent_consents (parent_child_link_id, consent_type, granted_by)
       VALUES ($1, $2, $3)
       RETURNING ${PARENT_CONSENT_COLUMNS}`,
      [parentChildLinkId, consentType, grantedBy],
    );

    return result.rows[0];
  }

  async findConsentById(consentId: string): Promise<ParentConsentRow | null> {
    const result = await this.db.query<ParentConsentRow>(
      `SELECT ${PARENT_CONSENT_COLUMNS}
       FROM parent_consents
       WHERE id = $1
       LIMIT 1`,
      [consentId],
    );

    return result.rows[0] ?? null;
  }

  async findActiveConsent(
    parentChildLinkId: string,
    consentType: string,
  ): Promise<ParentConsentRow | null> {
    const result = await this.db.query<ParentConsentRow>(
      `SELECT ${PARENT_CONSENT_COLUMNS}
       FROM parent_consents
       WHERE parent_child_link_id = $1 AND consent_type = $2 AND status = 'granted'
       LIMIT 1`,
      [parentChildLinkId, consentType],
    );

    return result.rows[0] ?? null;
  }

  async findConsentsByLink(parentChildLinkId: string): Promise<ParentConsentRow[]> {
    const result = await this.db.query<ParentConsentRow>(
      `SELECT ${PARENT_CONSENT_COLUMNS}
       FROM parent_consents
       WHERE parent_child_link_id = $1
       ORDER BY created_at DESC`,
      [parentChildLinkId],
    );

    return result.rows;
  }

  async revokeConsent(consentId: string): Promise<void> {
    await this.db.query(
      `UPDATE parent_consents
       SET status = 'revoked', revoked_at = now()
       WHERE id = $1`,
      [consentId],
    );
  }

  // ---------------------------------------------------------------------
  // Parent access audit logs (append-only)
  // ---------------------------------------------------------------------

  async recordAccess(
    parentId: string,
    childId: string,
    action: string,
    resourceType: string,
    ipAddress: string | null,
    userAgent: string | null,
  ): Promise<ParentAccessAuditLogRow> {
    const result = await this.db.query<ParentAccessAuditLogRow>(
      `INSERT INTO parent_access_audit_logs
         (parent_id, child_id, action, resource_type, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${PARENT_ACCESS_AUDIT_LOG_COLUMNS}`,
      [parentId, childId, action, resourceType, ipAddress, userAgent],
    );

    return result.rows[0];
  }

  async findAuditLogsByParent(parentId: string): Promise<ParentAccessAuditLogRow[]> {
    const result = await this.db.query<ParentAccessAuditLogRow>(
      `SELECT ${PARENT_ACCESS_AUDIT_LOG_COLUMNS}
       FROM parent_access_audit_logs
       WHERE parent_id = $1
       ORDER BY created_at DESC`,
      [parentId],
    );

    return result.rows;
  }

  async findAuditLogsByChild(childId: string): Promise<ParentAccessAuditLogRow[]> {
    const result = await this.db.query<ParentAccessAuditLogRow>(
      `SELECT ${PARENT_ACCESS_AUDIT_LOG_COLUMNS}
       FROM parent_access_audit_logs
       WHERE child_id = $1
       ORDER BY created_at DESC`,
      [childId],
    );

    return result.rows;
  }
}
