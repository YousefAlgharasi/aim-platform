// P12-046: Add Parent API Error Handling
// Standardized AppError factories for the parent-dashboard error scenarios
// that recur across the access policy, consent, and invitation flows:
// forbidden access, an unlinked child, a revoked consent, an expired
// invitation, and an invalid/unsupported consent scope. Centralizing the
// status code, ApiErrorCode, and message wording here means every
// call site produces the same wire-level shape via GlobalExceptionFilter.

import { ApiErrorCode } from '../../common/errors/api-error-code';
import { AppError } from '../../common/errors/app-error';

export function parentAccessForbiddenError(): AppError {
  return new AppError({
    code: ApiErrorCode.FORBIDDEN,
    statusCode: 403,
    message: 'Parent does not have the required access to this child.',
  });
}

export function unlinkedChildError(): AppError {
  return new AppError({
    code: ApiErrorCode.FORBIDDEN,
    statusCode: 403,
    message: 'Parent does not have an active link to this child.',
  });
}

export function revokedConsentError(): AppError {
  return new AppError({
    code: ApiErrorCode.FORBIDDEN,
    statusCode: 403,
    message: 'Consent for this access type has been revoked.',
  });
}

export function expiredInvitationError(): AppError {
  return new AppError({
    code: ApiErrorCode.BAD_REQUEST,
    statusCode: 400,
    message: 'Invitation has expired.',
  });
}

export function invalidConsentScopeError(consentType: string): AppError {
  return new AppError({
    code: ApiErrorCode.BAD_REQUEST,
    statusCode: 400,
    message: `"${consentType}" is not a supported consent scope.`,
    details: { consentType },
  });
}
