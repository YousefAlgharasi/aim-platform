// P12-046: Add Parent API Error Handling
// Unit tests for the standardized parent-dashboard error factories.

import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import {
  expiredInvitationError,
  invalidConsentScopeError,
  parentAccessForbiddenError,
  revokedConsentError,
  unlinkedChildError,
} from './parent-errors';

describe('parent-errors', () => {
  it('parentAccessForbiddenError produces a 403 FORBIDDEN AppError', () => {
    const error = parentAccessForbiddenError();

    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(ApiErrorCode.FORBIDDEN);
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Parent does not have the required access to this child.');
  });

  it('unlinkedChildError produces a 403 FORBIDDEN AppError', () => {
    const error = unlinkedChildError();

    expect(error.code).toBe(ApiErrorCode.FORBIDDEN);
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Parent does not have an active link to this child.');
  });

  it('revokedConsentError produces a 403 FORBIDDEN AppError', () => {
    const error = revokedConsentError();

    expect(error.code).toBe(ApiErrorCode.FORBIDDEN);
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Consent for this access type has been revoked.');
  });

  it('expiredInvitationError produces a 400 BAD_REQUEST AppError', () => {
    const error = expiredInvitationError();

    expect(error.code).toBe(ApiErrorCode.BAD_REQUEST);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Invitation has expired.');
  });

  it('invalidConsentScopeError produces a 400 BAD_REQUEST AppError carrying the offending scope', () => {
    const error = invalidConsentScopeError('not_a_real_scope');

    expect(error.code).toBe(ApiErrorCode.BAD_REQUEST);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('"not_a_real_scope" is not a supported consent scope.');
    expect(error.details).toEqual({ consentType: 'not_a_real_scope' });
  });
});
