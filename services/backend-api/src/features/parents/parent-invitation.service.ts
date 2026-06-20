// P12-037: Create Parent Invitation APIs
// Backend authority for the parent invitation lifecycle: creating a
// pending invitation, accepting it (which establishes an active
// parent-child link), revoking it, and listing a parent's invitations.
//
// This service never trusts a client-submitted invitation status,
// expiry, or child id — it always generates the invitation code and
// expiry itself, and resolves current state from ParentRepository before
// any transition.

import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';

import { ParentInvitationEntity } from './dto/parent-invitation.entity';
import { ParentRelationshipType } from './dto/parent-enums';
import { ParentInvitationRow } from './parent-repository.types';
import { ParentRepository } from './parent.repository';
import { ParentChildLinkService } from './parent-child-link.service';

const INVITATION_VALIDITY_DAYS = 7;

@Injectable()
export class ParentInvitationService {
  constructor(
    private readonly parentRepository: ParentRepository,
    private readonly parentChildLinkService: ParentChildLinkService,
  ) {}

  async createInvitation(
    parentId: string,
    relationshipType: ParentRelationshipType,
    childEmail?: string,
    childId?: string,
  ): Promise<ParentInvitationEntity> {
    if (!childEmail && !childId) {
      throw new BadRequestException('Either childEmail or childId is required.');
    }

    const invitationCode = this.generateInvitationCode();
    const expiresAt = new Date(Date.now() + INVITATION_VALIDITY_DAYS * 24 * 60 * 60 * 1000);

    const row = await this.parentRepository.createInvitation(
      parentId,
      relationshipType,
      invitationCode,
      expiresAt,
      childEmail ?? null,
      childId ?? null,
    );

    return this.toEntity(row);
  }

  async acceptInvitation(childId: string, invitationCode: string): Promise<ParentInvitationEntity> {
    const row = await this.parentRepository.findInvitationByCode(invitationCode);

    if (!row) {
      throw new NotFoundException('Invitation not found or already used.');
    }

    if (row.expires_at.getTime() < Date.now()) {
      await this.parentRepository.markInvitationStatus(row.id, 'expired');
      throw new BadRequestException('Invitation has expired.');
    }

    await this.parentRepository.markInvitationAccepted(row.id, childId);

    const link = await this.parentChildLinkService.createLink(
      row.parent_id,
      childId,
      row.relationship_type as ParentRelationshipType,
    );
    await this.parentChildLinkService.acceptLink(link.id);

    const updatedRow = await this.parentRepository.findInvitationById(row.id);

    return this.toEntity(updatedRow as ParentInvitationRow);
  }

  async revokeInvitation(parentId: string, invitationId: string): Promise<ParentInvitationEntity> {
    const row = await this.parentRepository.findInvitationById(invitationId);

    if (!row) {
      throw new NotFoundException(`Invitation ${invitationId} not found.`);
    }

    if (row.parent_id !== parentId) {
      throw new ForbiddenException('Invitation does not belong to this parent.');
    }

    if (row.status !== 'pending') {
      throw new BadRequestException('Only a pending invitation can be revoked.');
    }

    await this.parentRepository.markInvitationStatus(invitationId, 'cancelled');

    const updatedRow = await this.parentRepository.findInvitationById(invitationId);

    return this.toEntity(updatedRow as ParentInvitationRow);
  }

  async listInvitationsForParent(parentId: string): Promise<ParentInvitationEntity[]> {
    const rows = await this.parentRepository.findInvitationsByParent(parentId);

    return rows.map((row) => this.toEntity(row));
  }

  private generateInvitationCode(): string {
    return randomBytes(16).toString('hex');
  }

  private toEntity(row: ParentInvitationRow): ParentInvitationEntity {
    const entity = new ParentInvitationEntity();

    entity.id = row.id;
    entity.parentId = row.parent_id;
    entity.childEmail = row.child_email;
    entity.childId = row.child_id;
    entity.invitationCode = row.invitation_code;
    entity.relationshipType = row.relationship_type as ParentRelationshipType;
    entity.status = row.status as ParentInvitationEntity['status'];
    entity.expiresAt = row.expires_at.toISOString();
    entity.acceptedAt = row.accepted_at ? row.accepted_at.toISOString() : null;
    entity.createdAt = row.created_at.toISOString();
    entity.updatedAt = row.updated_at.toISOString();

    return entity;
  }
}
