import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface AdminParentChildLink {
  id: string;
  parentId: string;
  parentEmail: string | null;
  childId: string;
  childEmail: string | null;
  relationshipType: string;
  status: string;
  linkedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface AdminParentInvitation {
  id: string;
  parentId: string;
  parentEmail: string | null;
  childEmail: string | null;
  childId: string | null;
  relationshipType: string;
  status: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

export interface AdminParentConsent {
  id: string;
  parentChildLinkId: string;
  parentEmail: string | null;
  childEmail: string | null;
  consentType: string;
  status: string;
  grantedAt: string;
  revokedAt: string | null;
}

export interface AdminParentStats {
  totalLinks: number;
  activeLinks: number;
  pendingLinks: number;
  revokedLinks: number;
  totalInvitations: number;
  pendingInvitations: number;
  acceptedInvitations: number;
  expiredInvitations: number;
  totalConsents: number;
  grantedConsents: number;
  revokedConsents: number;
}

@Injectable()
export class AdminParentsService {
  private readonly logger = new Logger(AdminParentsService.name);

  constructor(private readonly db: DatabaseService) {}

  async getStats(): Promise<AdminParentStats> {
    const [linkRes, invRes, conRes] = await Promise.all([
      this.db.query<{ status: string; count: string }>(
        `SELECT status, COUNT(*)::text as count FROM parent_child_links GROUP BY status`,
      ).catch(() => ({ rows: [] as { status: string; count: string }[] })),
      this.db.query<{ status: string; count: string }>(
        `SELECT status, COUNT(*)::text as count FROM parent_invitations GROUP BY status`,
      ).catch(() => ({ rows: [] as { status: string; count: string }[] })),
      this.db.query<{ status: string; count: string }>(
        `SELECT status, COUNT(*)::text as count FROM parent_consents GROUP BY status`,
      ).catch(() => ({ rows: [] as { status: string; count: string }[] })),
    ]);

    const linkMap = Object.fromEntries(linkRes.rows.map((r) => [r.status, parseInt(r.count, 10)]));
    const invMap = Object.fromEntries(invRes.rows.map((r) => [r.status, parseInt(r.count, 10)]));
    const conMap = Object.fromEntries(conRes.rows.map((r) => [r.status, parseInt(r.count, 10)]));

    return {
      totalLinks: Object.values(linkMap).reduce((a, b) => a + b, 0),
      activeLinks: linkMap['active'] ?? 0,
      pendingLinks: linkMap['pending'] ?? 0,
      revokedLinks: linkMap['revoked'] ?? 0,
      totalInvitations: Object.values(invMap).reduce((a, b) => a + b, 0),
      pendingInvitations: invMap['pending'] ?? 0,
      acceptedInvitations: invMap['accepted'] ?? 0,
      expiredInvitations: invMap['expired'] ?? 0,
      totalConsents: Object.values(conMap).reduce((a, b) => a + b, 0),
      grantedConsents: conMap['granted'] ?? 0,
      revokedConsents: conMap['revoked'] ?? 0,
    };
  }

  async listLinks(opts: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }): Promise<{ links: AdminParentChildLink[]; total: number }> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (opts.status) {
      conditions.push(`pcl.status = $${idx++}`);
      params.push(opts.status);
    }
    if (opts.search) {
      conditions.push(`(pu.email ILIKE $${idx} OR cu.email ILIKE $${idx})`);
      params.push(`%${opts.search}%`);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (opts.page - 1) * opts.limit;

    const [result, countResult] = await Promise.all([
      this.db.query<{
        id: string;
        parent_id: string;
        parent_email: string | null;
        child_id: string;
        child_email: string | null;
        relationship_type: string;
        status: string;
        linked_at: string | null;
        revoked_at: string | null;
        created_at: string;
      }>(
        `SELECT pcl.id, pcl.parent_id, pu.email as parent_email,
                pcl.child_id, cu.email as child_email,
                pcl.relationship_type, pcl.status,
                pcl.linked_at, pcl.revoked_at, pcl.created_at
         FROM parent_child_links pcl
         LEFT JOIN users pu ON pu.id = pcl.parent_id
         LEFT JOIN users cu ON cu.id = pcl.child_id
         ${where}
         ORDER BY pcl.created_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...params, opts.limit, offset],
      ),
      this.db.query<{ count: string }>(
        `SELECT COUNT(*)::text as count FROM parent_child_links pcl
         LEFT JOIN users pu ON pu.id = pcl.parent_id
         LEFT JOIN users cu ON cu.id = pcl.child_id
         ${where}`,
        params,
      ),
    ]);

    return {
      links: result.rows.map((r) => ({
        id: r.id,
        parentId: r.parent_id,
        parentEmail: r.parent_email,
        childId: r.child_id,
        childEmail: r.child_email,
        relationshipType: r.relationship_type,
        status: r.status,
        linkedAt: r.linked_at,
        revokedAt: r.revoked_at,
        createdAt: r.created_at,
      })),
      total: parseInt(countResult.rows[0]?.count ?? '0', 10),
    };
  }

  async listInvitations(opts: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }): Promise<{ invitations: AdminParentInvitation[]; total: number }> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (opts.status) {
      conditions.push(`pi.status = $${idx++}`);
      params.push(opts.status);
    }
    if (opts.search) {
      conditions.push(`(pu.email ILIKE $${idx} OR pi.child_email ILIKE $${idx})`);
      params.push(`%${opts.search}%`);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (opts.page - 1) * opts.limit;

    const [result, countResult] = await Promise.all([
      this.db.query<{
        id: string;
        parent_id: string;
        parent_email: string | null;
        child_email: string | null;
        child_id: string | null;
        relationship_type: string;
        status: string;
        expires_at: string;
        accepted_at: string | null;
        created_at: string;
      }>(
        `SELECT pi.id, pi.parent_id, pu.email as parent_email,
                pi.child_email, pi.child_id,
                pi.relationship_type, pi.status,
                pi.expires_at, pi.accepted_at, pi.created_at
         FROM parent_invitations pi
         LEFT JOIN users pu ON pu.id = pi.parent_id
         ${where}
         ORDER BY pi.created_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...params, opts.limit, offset],
      ),
      this.db.query<{ count: string }>(
        `SELECT COUNT(*)::text as count FROM parent_invitations pi
         LEFT JOIN users pu ON pu.id = pi.parent_id
         ${where}`,
        params,
      ),
    ]);

    return {
      invitations: result.rows.map((r) => ({
        id: r.id,
        parentId: r.parent_id,
        parentEmail: r.parent_email,
        childEmail: r.child_email,
        childId: r.child_id,
        relationshipType: r.relationship_type,
        status: r.status,
        expiresAt: r.expires_at,
        acceptedAt: r.accepted_at,
        createdAt: r.created_at,
      })),
      total: parseInt(countResult.rows[0]?.count ?? '0', 10),
    };
  }

  async listConsents(opts: {
    page: number;
    limit: number;
    status?: string;
    consentType?: string;
  }): Promise<{ consents: AdminParentConsent[]; total: number }> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (opts.status) {
      conditions.push(`pc.status = $${idx++}`);
      params.push(opts.status);
    }
    if (opts.consentType) {
      conditions.push(`pc.consent_type = $${idx++}`);
      params.push(opts.consentType);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (opts.page - 1) * opts.limit;

    const [result, countResult] = await Promise.all([
      this.db.query<{
        id: string;
        parent_child_link_id: string;
        parent_email: string | null;
        child_email: string | null;
        consent_type: string;
        status: string;
        granted_at: string;
        revoked_at: string | null;
      }>(
        `SELECT pc.id, pc.parent_child_link_id,
                pu.email as parent_email, cu.email as child_email,
                pc.consent_type, pc.status,
                pc.granted_at, pc.revoked_at
         FROM parent_consents pc
         LEFT JOIN parent_child_links pcl ON pcl.id = pc.parent_child_link_id
         LEFT JOIN users pu ON pu.id = pcl.parent_id
         LEFT JOIN users cu ON cu.id = pcl.child_id
         ${where}
         ORDER BY pc.granted_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        [...params, opts.limit, offset],
      ),
      this.db.query<{ count: string }>(
        `SELECT COUNT(*)::text as count FROM parent_consents pc ${where}`,
        params,
      ),
    ]);

    return {
      consents: result.rows.map((r) => ({
        id: r.id,
        parentChildLinkId: r.parent_child_link_id,
        parentEmail: r.parent_email,
        childEmail: r.child_email,
        consentType: r.consent_type,
        status: r.status,
        grantedAt: r.granted_at,
        revokedAt: r.revoked_at,
      })),
      total: parseInt(countResult.rows[0]?.count ?? '0', 10),
    };
  }
}
