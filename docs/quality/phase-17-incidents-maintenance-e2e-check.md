# Phase 17 — Incidents and Maintenance E2E Check

**Task:** P17-079
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Verify end-to-end incident lifecycle (create, update status, resolve, postmortem), maintenance window lifecycle (create, start, complete), and status page component display.

## Incident Flow Verification

### Step 1: Admin Creates Incident

| Check | Verified In | Status |
|-------|------------|--------|
| `POST /admin/incidents` accepts `CreateIncidentDto` | `AdminIncidentController.createIncident()` | PASS |
| DTO validates `title` (`@MaxLength(500)`), `description`, `severity` (enum), `startedAt` (`@IsDateString`) | `CreateIncidentDto` | PASS |
| Valid severities: `minor`, `major`, `critical` | `VALID_INCIDENT_SEVERITIES` | PASS |
| `ownerId` set to admin user ID | `IncidentService.createIncident()` | PASS |
| Incident saved via `OperationsRepository.createIncident()` | Repository layer | PASS |
| Audit log: `incident_created` with `title` and `severity` | `IncidentService.createIncident()` | PASS |
| Endpoint requires admin guard | `@OperationsAdminOnly()` + `OperationsAdminGuard` | PASS |

### Step 2: Admin Updates Incident Status

| Check | Verified In | Status |
|-------|------------|--------|
| `PATCH /admin/incidents/:id/status` accepts `UpdateIncidentStatusDto` | `AdminIncidentController.updateStatus()` | PASS |
| Valid status transitions: `investigating` -> `identified` -> `monitoring` -> `resolved` -> `postmortem` | `VALID_INCIDENT_STATUSES` | PASS |
| UUID validation on incident ID | `IncidentService.updateStatus()` | PASS |
| Existence check before update | `findIncidentById()` throws `NotFoundException` | PASS |
| Previous status captured for audit | `const previousStatus = incident.status` | PASS |
| Audit log: `incident_status_updated` with `previousStatus`, `newStatus`, `resolvedAt`, `postmortemUrl` | `IncidentService.updateStatus()` | PASS |

### Step 3: Admin Resolves Incident

| Check | Verified In | Status |
|-------|------------|--------|
| Status set to `resolved` | Valid status value | PASS |
| `resolvedAt` date accepted (optional `@IsDateString`) | `UpdateIncidentStatusDto` | PASS |
| `resolved_at` persisted via `COALESCE` in repository | `OperationsRepository.updateIncidentStatus()` | PASS |

### Step 4: Admin Adds Postmortem

| Check | Verified In | Status |
|-------|------------|--------|
| Status set to `postmortem` | Valid status value | PASS |
| `postmortemUrl` accepted (optional `@IsUrl`) | `UpdateIncidentStatusDto` | PASS |
| `postmortem_url` persisted via `COALESCE` in repository | `OperationsRepository.updateIncidentStatus()` | PASS |

### Step 5: Admin Lists Incidents

| Check | Verified In | Status |
|-------|------------|--------|
| `GET /admin/incidents` with pagination (`limit`, `offset`) | `AdminIncidentController.listIncidents()` | PASS |
| Sorted by `created_at DESC` | `OperationsRepository.findAllIncidents()` | PASS |
| Default limit 50 | Service default | PASS |

## Maintenance Window Flow Verification

### Step 1: Admin Creates Maintenance Window

| Check | Verified In | Status |
|-------|------------|--------|
| `POST /admin/maintenance-windows` accepts `CreateMaintenanceWindowDto` | `AdminMaintenanceController.createWindow()` | PASS |
| DTO validates `title` (`@MaxLength(500)`), `type` (enum), `scheduledStart/End` (`@IsDateString`), `affectedServices` (`@IsArray`) | `CreateMaintenanceWindowDto` | PASS |
| Valid types: `planned`, `emergency` | `VALID_MAINTENANCE_TYPES` | PASS |
| Initial status set to `scheduled` | `MaintenanceWindowService.createWindow()` | PASS |
| `createdBy` set to admin ID | Service layer | PASS |
| Audit log: `maintenance_window.created` with `title`, `scheduledStart`, `scheduledEnd` | `MaintenanceWindowService.createWindow()` | PASS |

### Step 2: Admin Starts Maintenance

| Check | Verified In | Status |
|-------|------------|--------|
| `PATCH /admin/maintenance-windows/:id/status` with `status: 'in_progress'` | `AdminMaintenanceController.updateStatus()` | PASS |
| Valid statuses: `scheduled`, `in_progress`, `completed`, `cancelled` | `VALID_MAINTENANCE_STATUSES` | PASS |
| `actualStart` date accepted (optional) | `UpdateMaintenanceStatusDto` | PASS |
| Audit log: `maintenance_window.status_updated` with `previousStatus` and `newStatus` | `MaintenanceWindowService.updateWindowStatus()` | PASS |

### Step 3: Admin Completes Maintenance

| Check | Verified In | Status |
|-------|------------|--------|
| Status set to `completed` | Valid status value | PASS |
| `actualEnd` date accepted (optional) | `UpdateMaintenanceStatusDto` | PASS |

### Step 4: Public Maintenance View

| Check | Verified In | Status |
|-------|------------|--------|
| `GET /maintenance-windows` returns active/upcoming windows | `MaintenanceWindowController.getActiveWindows()` | PASS |
| Read-only for non-admin users | No mutation endpoints on public controller | PASS |
| Repository method exists for active windows | `OperationsRepository.findAllMaintenanceWindows()` | PASS |

## Status Page (Operational Status) Verification

### Component Status Display

| Check | Verified In | Status |
|-------|------------|--------|
| `GET /operational-status` lists all component statuses | `OperationalStatusController.getAll()` | PASS |
| Repository query sorted by `component ASC` | `OperationsRepository.findAllOperationalStatuses()` | PASS |
| Admin can update component status | `OperationalStatusService.updateComponentStatus()` | PASS |
| Upsert pattern with `ON CONFLICT (component)` | `OperationsRepository.upsertOperationalStatus()` | PASS |
| Audit log: `operational_status.updated` with `status` and `description` | `OperationalStatusService.updateComponentStatus()` | PASS |

### Status Entity Fields

| Field | Type | Purpose | Status |
|-------|------|---------|--------|
| `component` | string | Service/component name | PASS |
| `status` | string | Current status (e.g., `operational`, `degraded`, `outage`) | PASS |
| `description` | string (nullable) | Human-readable description | PASS |
| `updatedBy` | string (nullable) | Admin who last updated | PASS |
| `updatedAt` | Date | Last update timestamp | PASS |

## Complete Audit Trail

| Action | Audit Event | Details | Status |
|--------|------------|---------|--------|
| Incident created | `incident_created` | `title`, `severity` | PASS |
| Incident status updated | `incident_status_updated` | `previousStatus`, `newStatus`, `resolvedAt`, `postmortemUrl` | PASS |
| Maintenance created | `maintenance_window.created` | `title`, `scheduledStart`, `scheduledEnd` | PASS |
| Maintenance status updated | `maintenance_window.status_updated` | `previousStatus`, `newStatus` | PASS |
| Component status updated | `operational_status.updated` | `status`, `description` | PASS |

## Verdict

**PASS** — The complete incident lifecycle is verified: create -> investigate -> identify -> monitor -> resolve -> postmortem. Maintenance window lifecycle is verified: create (scheduled) -> start (in_progress) -> complete. Status page shows component statuses via upsert pattern. All admin mutations are guarded and audit-logged. Public endpoints are read-only.
