// P12-019: Create Parent Repository Layer
// Row shapes returned directly from Postgres for the parent dashboard
// tables. These mirror the migrations in
// prisma/migrations/20260620000000_create_parent_child_links_table and
// related parent_* migrations.

export interface ParentChildLinkRow {
  id: string;
  parent_id: string;
  child_id: string;
  relationship_type: string;
  status: string;
  linked_at: Date | null;
  revoked_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ParentInvitationRow {
  id: string;
  parent_id: string;
  child_email: string | null;
  child_id: string | null;
  invitation_code: string;
  relationship_type: string;
  status: string;
  expires_at: Date;
  accepted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ParentConsentRow {
  id: string;
  parent_child_link_id: string;
  consent_type: string;
  status: string;
  granted_at: Date;
  revoked_at: Date | null;
  granted_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface ParentAccessAuditLogRow {
  id: string;
  parent_id: string;
  child_id: string;
  action: string;
  resource_type: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}
