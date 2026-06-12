export type SessionInvalidReason = 'USER_NOT_FOUND' | 'USER_INACTIVE';

export interface ValidSession {
  readonly valid: true;
  readonly internalUserId: string;
  readonly userStatus: string;
}

export interface InvalidSession {
  readonly valid: false;
  readonly reason: SessionInvalidReason;
}

export type SessionValidationResult = ValidSession | InvalidSession;
