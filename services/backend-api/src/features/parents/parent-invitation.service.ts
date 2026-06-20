// P12-021: Create Parent Invitation Service
// Secure invitation creation, acceptance, and expiry logic for parent
// onboarding and child linking.
//
// This service is the backend authority for invitation lifecycle. It
// never trusts a client-submitted invitation status or expiry, generates
// invitation codes itself, and only activates a parent-child link via
// ParentChildLinkService once an invitation has been validated as
// pending and unexpired. It never computes or exposes mastery, weakness,
// score, correctness, recommendations, or any AIM/assessment output.

import { randomBytes } from 'crypto';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { ParentInvitationEntity } from './dto/parent-invitation.entity';
import { ParentRelationshipType } from './dto/parent-enums';
import { ParentChildLinkService } from './parent-child-link.service';
import { ParentInvitationRow } from './parent-repository.types';
import { ParentRepository } from './parent.repository';

const INVITATION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
const INVITATION_CODE_BYTES = 24;

@Injectable()
export class ParentInvitationService {
  constructor(
    private readonly parentRepository: ParentRepository,
    private readonly parentChildLinkService: ParentChildLinkService,
  ) {}

  async createInvitation(
    parentId: string,
    relationshipType: ParentRelationshipType,
    childEmail: string | null,
    childId: string | null,
  ): Promise<ParentInvitationEntity> {
    if (!childEmail && !childId) {
      throw new BadRequestException('An invitation requires either a childEmail or a childId.');
    }

    const invitationCode = this.generateInvitationCode();
    const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_MS);

    const row = await this.parentRepository.createInvitation(
      parentId,
      relationshipType,
      invitationCode,
      expiresAt,
      childEmail,
      childId,
    );

    return this.toEntity(row);
  }

  async acceptInvitation(invitationCode: string, childId: string): Promise<ParentInvitationEntity> {
    const row = await this.parentRepository.findInvitationByCode(invitationCode);

    if (!row) {
      throw new NotFoundException('Invitation not found or no longer pending.');
    }

    if (this.isExpired(row)) {
      await this.parentRepository.markInvitationStatus(row.id, 'expired');
      throw new BadRequestException('This invitation has expired.');
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

  async cancelInvitation(invitationId: string): Promise<ParentInvitationEntity> {
    const row = await this.parentRepository.findInvitationById(invitationId);

    if (!row) {
      throw new NotFoundException(`Invitation ${invitationId} not found.`);
    }

    if (row.status !== 'pending') {
      throw new BadRequestException('Only a pending invitation can be cancelled.');
    }

    await this.parentRepository.markInvitationStatus(invitationId, 'cancelled');

    const updatedRow = await this.parentRepository.findInvitationById(invitationId);

    return this.toEntity(updatedRow as ParentInvitationRow);
  }

  async expireStaleInvitation(invitationId: string): Promise<ParentInvitationEntity> {
    const row = await this.parentRepository.findInvitationById(invitationId);

    if (!row) {
      throw new NotFoundException(`Invitation ${invitationId} not found.`);
    }

    if (row.status !== 'pending' || !this.isExpired(row)) {
      throw new BadRequestException('Only a pending, time-expired invitation can be expired.');
    }

    await this.parentRepository.markInvitationStatus(invitationId, 'expired');

    const updatedRow = await this.parentRepository.findInvitationById(invitationId);

    return this.toEntity(updatedRow as ParentInvitationRow);
  }

  async listInvitationsForParent(parentId: string): Promise<ParentInvitationEntity[]> {
    const rows = await this.parentRepository.findInvitationsByParent(parentId);

    return rows.map((row) => this.toEntity(row));
  }

  private isExpired(row: ParentInvitationRow): boolean {
    return row.expires_at.getTime() <= Date.now();
  }

  private generateInvitationCode(): string {
    return randomBytes(INVITATION_CODE_BYTES).toString('hex');
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
