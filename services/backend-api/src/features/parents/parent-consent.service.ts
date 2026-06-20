// P12-022: Create Parent Consent Service
// Centralizes consent grant/revoke logic and resolves a parent's
// visibility scope for a child (which consent types are currently
// granted), derived from an active parent-child link.
//
// This service is the backend authority for consent state. It never
// trusts a client-submitted consent status, and grants/revokes only
// against an existing parent-child link. It never computes or exposes
// mastery, weakness, score, correctness, recommendations, or any
// AIM/assessment output — it only governs what a parent is permitted
// to view.

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { ParentAccessScopeEntity } from './dto/parent-access-scope.entity';
import { ParentConsentEntity } from './dto/parent-consent.entity';
import { ParentConsentType } from './dto/parent-enums';
import { ParentConsentRow } from './parent-repository.types';
import { ParentRepository } from './parent.repository';

@Injectable()
export class ParentConsentService {
  constructor(private readonly parentRepository: ParentRepository) {}

  async grantConsent(
    parentChildLinkId: string,
    consentType: ParentConsentType,
    grantedBy: string,
  ): Promise<ParentConsentEntity> {
    const link = await this.parentRepository.findLinkById(parentChildLinkId);

    if (!link) {
      throw new NotFoundException(`Parent-child link ${parentChildLinkId} not found.`);
    }

    if (link.status !== 'active') {
      throw new BadRequestException('Consent can only be granted for an active parent-child link.');
    }

    const existingConsent = await this.parentRepository.findActiveConsent(
      parentChildLinkId,
      consentType,
    );

    if (existingConsent) {
      throw new BadRequestException('This consent type is already granted for this link.');
    }

    const row = await this.parentRepository.grantConsent(parentChildLinkId, consentType, grantedBy);

    return this.toEntity(row);
  }

  async revokeConsentByType(
    parentChildLinkId: string,
    consentType: ParentConsentType,
  ): Promise<ParentConsentEntity> {
    const activeConsent = await this.parentRepository.findActiveConsent(parentChildLinkId, consentType);

    if (!activeConsent) {
      throw new NotFoundException(
        `No granted "${consentType}" consent found for this parent-child link.`,
      );
    }

    return this.revokeConsent(activeConsent.id);
  }

  async revokeConsent(consentId: string): Promise<ParentConsentEntity> {
    const row = await this.parentRepository.findConsentById(consentId);

    if (!row) {
      throw new NotFoundException(`Consent ${consentId} not found.`);
    }

    if (row.status === 'revoked') {
      throw new BadRequestException('Consent is already revoked.');
    }

    await this.parentRepository.revokeConsent(consentId);

    const updatedRow = await this.parentRepository.findConsentById(consentId);

    return this.toEntity(updatedRow as ParentConsentRow);
  }

  async listConsentsForLink(parentChildLinkId: string): Promise<ParentConsentEntity[]> {
    const rows = await this.parentRepository.findConsentsByLink(parentChildLinkId);

    return rows.map((row) => this.toEntity(row));
  }

  async hasGrantedConsent(parentChildLinkId: string, consentType: ParentConsentType): Promise<boolean> {
    const row = await this.parentRepository.findActiveConsent(parentChildLinkId, consentType);

    return row !== null;
  }

  async resolveAccessScope(parentId: string, childId: string): Promise<ParentAccessScopeEntity | null> {
    const link = await this.parentRepository.findActiveLink(parentId, childId);

    if (!link) {
      return null;
    }

    const consents = await this.parentRepository.findConsentsByLink(link.id);
    const grantedConsentTypes = consents
      .filter((consent) => consent.status === 'granted')
      .map((consent) => consent.consent_type as ParentConsentType);

    const scope = new ParentAccessScopeEntity();
    scope.parentId = link.parent_id;
    scope.childId = link.child_id;
    scope.parentChildLinkId = link.id;
    scope.linkStatus = link.status as ParentAccessScopeEntity['linkStatus'];
    scope.grantedConsentTypes = grantedConsentTypes;

    return scope;
  }

  private toEntity(row: ParentConsentRow): ParentConsentEntity {
    const entity = new ParentConsentEntity();

    entity.id = row.id;
    entity.parentChildLinkId = row.parent_child_link_id;
    entity.consentType = row.consent_type as ParentConsentType;
    entity.status = row.status as ParentConsentEntity['status'];
    entity.grantedAt = row.granted_at.toISOString();
    entity.revokedAt = row.revoked_at ? row.revoked_at.toISOString() : null;
    entity.grantedBy = row.granted_by;
    entity.createdAt = row.created_at.toISOString();
    entity.updatedAt = row.updated_at.toISOString();

    return entity;
  }
}
