export interface RoleRow {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly description: string | null;
  readonly is_system: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface PermissionRow {
  readonly id: string;
  readonly key: string;
  readonly scope: string;
  readonly description: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface RoleRecord {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly description: string | null;
  readonly isSystem: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PermissionRecord {
  readonly id: string;
  readonly key: string;
  readonly scope: string;
  readonly description: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RoleWithPermissions {
  readonly role: RoleRecord;
  readonly permissions: PermissionRecord[];
}
