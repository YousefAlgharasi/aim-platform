// P12-025: Add Parent Permission Guards
// Decorator that marks a parent-facing handler as requiring an active
// parent-child link (and, optionally, a specific granted consent type)
// before child data may be read. Paired with ParentChildAccessGuard.

import { SetMetadata } from '@nestjs/common';

import { ParentConsentType } from '../dto/parent-enums';
import {
  DEFAULT_CHILD_ID_PARAM,
  PARENT_CHILD_ACCESS_KEY,
} from './parent-child-access.constants';
import { ParentChildAccessRequirement } from './parent-child-access-requirement';

export interface RequireParentChildAccessOptions {
  readonly paramName?: string;
  readonly consentType?: ParentConsentType;
}

export const RequireParentChildAccess = (
  options: RequireParentChildAccessOptions = {},
): MethodDecorator & ClassDecorator => {
  const requirement: ParentChildAccessRequirement = {
    paramName: options.paramName ?? DEFAULT_CHILD_ID_PARAM,
    consentType: options.consentType,
  };

  return SetMetadata(PARENT_CHILD_ACCESS_KEY, requirement);
};
