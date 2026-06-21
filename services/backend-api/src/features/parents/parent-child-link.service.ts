// P12-020: Create Parent Child Link Service
// Centralizes parent-child relationship authority: creating a pending
// link, activating (accepting) it, revoking it, and resolving the
// current relationship between a parent and a child.
//
// This service is the backend authority for parent-child link state.
// It never trusts client-submitted link status/timestamps, and it never
// computes or exposes mastery, weakness, score, correctness,
// recommendations, or any AIM/assessment output. Auth, relationship,
// consent, and child-scope checks for individual endpoints remain the
// responsibility of guards/controllers calling this service.

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { ParentChildLinkEntity } from './dto/parent-child-link.entity';
import { ParentRelationshipType } from './dto/parent-enums';
import { ParentChildLinkRow } from './parent-repository.types';
import { ParentRepository } from './parent.repository';
import { AnalyticsEventIngestionService } from '../analytics/analytics-event-ingestion.service';

@Injectable()
export class ParentChildLinkService {
  constructor(
    private readonly parentRepository: ParentRepository,
    private readonly analyticsEventIngestionService: AnalyticsEventIngestionService,
  ) {}

  async createLink(
    parentId: string,
    childId: string,
    relationshipType: ParentRelationshipType,
  ): Promise<ParentChildLinkEntity> {
    const existingActiveLink = await this.parentRepository.findActiveLink(parentId, childId);

    if (existingActiveLink) {
      throw new BadRequestException('An active link already exists for this parent and child.');
    }

    const row = await this.parentRepository.createLink(parentId, childId, relationshipType);

    await this.analyticsEventIngestionService.ingest({
      eventType: 'parent.child_link_created',
      actorRole: 'parent',
      actorId: parentId,
      subjectType: 'parent_child_link',
      subjectId: row.id,
      metadata: { relationship_type: row.relationship_type },
    });

    return this.toEntity(row);
  }

  async acceptLink(linkId: string): Promise<ParentChildLinkEntity> {
    const row = await this.parentRepository.findLinkById(linkId);

    if (!row) {
      throw new NotFoundException(`Parent-child link ${linkId} not found.`);
    }

    if (row.status !== 'pending') {
      throw new BadRequestException('Only a pending link can be accepted.');
    }

    await this.parentRepository.activateLink(linkId);

    const updatedRow = await this.parentRepository.findLinkById(linkId);

    await this.analyticsEventIngestionService.ingest({
      eventType: 'parent.child_link_accepted',
      actorRole: 'parent',
      actorId: updatedRow?.parent_id ?? null,
      subjectType: 'parent_child_link',
      subjectId: linkId,
      metadata: { relationship_type: updatedRow?.relationship_type },
    });

    return this.toEntity(updatedRow as ParentChildLinkRow);
  }

  async revokeLink(linkId: string): Promise<ParentChildLinkEntity> {
    const row = await this.parentRepository.findLinkById(linkId);

    if (!row) {
      throw new NotFoundException(`Parent-child link ${linkId} not found.`);
    }

    if (row.status === 'revoked') {
      throw new BadRequestException('Link is already revoked.');
    }

    await this.parentRepository.revokeLink(linkId);

    const updatedRow = await this.parentRepository.findLinkById(linkId);

    return this.toEntity(updatedRow as ParentChildLinkRow);
  }

  async resolveActiveLink(parentId: string, childId: string): Promise<ParentChildLinkEntity | null> {
    const row = await this.parentRepository.findActiveLink(parentId, childId);

    return row ? this.toEntity(row) : null;
  }

  async listLinksForParent(parentId: string): Promise<ParentChildLinkEntity[]> {
    const rows = await this.parentRepository.findLinksByParent(parentId);

    return rows.map((row) => this.toEntity(row));
  }

  async listLinksForChild(childId: string): Promise<ParentChildLinkEntity[]> {
    const rows = await this.parentRepository.findLinksByChild(childId);

    return rows.map((row) => this.toEntity(row));
  }

  async findLinkById(linkId: string): Promise<ParentChildLinkEntity | null> {
    const row = await this.parentRepository.findLinkById(linkId);

    return row ? this.toEntity(row) : null;
  }

  private toEntity(row: ParentChildLinkRow): ParentChildLinkEntity {
    const entity = new ParentChildLinkEntity();

    entity.id = row.id;
    entity.parentId = row.parent_id;
    entity.childId = row.child_id;
    entity.relationshipType = row.relationship_type as ParentRelationshipType;
    entity.status = row.status as ParentChildLinkEntity['status'];
    entity.linkedAt = row.linked_at ? row.linked_at.toISOString() : null;
    entity.revokedAt = row.revoked_at ? row.revoked_at.toISOString() : null;
    entity.createdAt = row.created_at.toISOString();
    entity.updatedAt = row.updated_at.toISOString();

    return entity;
  }
}
