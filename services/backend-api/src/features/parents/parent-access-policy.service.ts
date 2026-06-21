// P12-023: Create Parent Access Policy Service
// Single backend authority that verifies parent access before any child
// data read. Every parent-facing endpoint that reads child data must call
// this service first — it is the source of truth for "may this parent see
// this child's data, and under what consent scope."
//
// This service never trusts client-submitted link or consent state; it
// always resolves the current link/consent state from ParentChildLinkService
// and ParentConsentService. It never computes or exposes mastery, weakness,
// score, correctness, recommendations, or any AIM/assessment output — it
// only answers an access-control question.

import { ForbiddenException, Injectable } from '@nestjs/common';

import { ParentAccessScopeEntity } from './dto/parent-access-scope.entity';
import { ParentConsentType } from './dto/parent-enums';
import { ParentChildLinkService } from './parent-child-link.service';
import { ParentConsentService } from './parent-consent.service';

@Injectable()
export class ParentAccessPolicyService {
  constructor(
    private readonly parentChildLinkService: ParentChildLinkService,
    private readonly parentConsentService: ParentConsentService,
  ) {}

  /**
   * Verifies the parent has an active link to the child. Use for
   * endpoints that don't expose consent-gated data (e.g. listing linked
   * children) but still must never leak data for an unlinked child.
   */
  async assertLinked(parentId: string, childId: string): Promise<ParentAccessScopeEntity> {
    const scope = await this.parentConsentService.resolveAccessScope(parentId, childId);

    if (!scope || scope.linkStatus !== 'active') {
      throw new ForbiddenException('Parent does not have an active link to this child.');
    }

    return scope;
  }

  /**
   * Verifies the parent has an active link to the child AND has been
   * granted the given consent type. Use for any endpoint that exposes
   * consent-gated child data (progress, assessments, reports, etc.).
   */
  async assertAccess(
    parentId: string,
    childId: string,
    requiredConsentType: ParentConsentType,
  ): Promise<ParentAccessScopeEntity> {
    const scope = await this.assertLinked(parentId, childId);

    if (!scope.grantedConsentTypes.includes(requiredConsentType) &&
        !scope.grantedConsentTypes.includes('full_access')) {
      throw new ForbiddenException(
        `Parent has not been granted "${requiredConsentType}" consent for this child.`,
      );
    }

    return scope;
  }

  /**
   * Non-throwing check, for cases that need a boolean rather than a
   * guard-style assertion (e.g. building a UI affordance flag).
   */
  async canAccess(parentId: string, childId: string, requiredConsentType: ParentConsentType): Promise<boolean> {
    const scope = await this.parentConsentService.resolveAccessScope(parentId, childId);

    if (!scope || scope.linkStatus !== 'active') {
      return false;
    }

    return (
      scope.grantedConsentTypes.includes(requiredConsentType) ||
      scope.grantedConsentTypes.includes('full_access')
    );
  }

  /**
   * Returns the active links for a parent — the basis for child-scoping
   * any list/aggregate endpoint to only the children that parent may see.
   */
  async listAccessibleChildIds(parentId: string): Promise<string[]> {
    const links = await this.parentChildLinkService.listLinksForParent(parentId);

    return links.filter((link) => link.status === 'active').map((link) => link.childId);
  }
}
