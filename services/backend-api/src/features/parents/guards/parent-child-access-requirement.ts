// P12-025: Add Parent Permission Guards
// Requirement shape read by ParentChildAccessGuard via Reflector metadata.

import { ParentConsentType } from '../dto/parent-enums';

export interface ParentChildAccessRequirement {
  /**
   * Route parameter containing the target child id.
   */
  readonly paramName: string;

  /**
   * Consent type the parent must have been granted for the child. When
   * omitted, the guard only verifies an active parent-child link
   * (no consent-gated data is exposed by the endpoint).
   */
  readonly consentType?: ParentConsentType;
}
