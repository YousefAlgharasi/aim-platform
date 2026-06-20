import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';

export class InvalidDeviceTokenError extends AppError {
  constructor() {
    super('Invalid or expired device token', HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR);
  }
}

export class DisabledChannelError extends AppError {
  constructor(channel: string) {
    super(`Notification channel '${channel}' is disabled`, HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR);
  }
}

export class NotificationForbiddenError extends AppError {
  constructor() {
    super('Not authorized to access this notification resource', HttpStatus.FORBIDDEN, ApiErrorCode.FORBIDDEN);
  }
}

export class QuietHoursActiveError extends AppError {
  constructor() {
    super('Notification suppressed — quiet hours active', HttpStatus.UNPROCESSABLE_ENTITY, ApiErrorCode.VALIDATION_ERROR);
  }
}

export class ProviderDeliveryError extends AppError {
  constructor(providerError: string) {
    super(
      `Notification delivery failed: ${providerError}`,
      HttpStatus.BAD_GATEWAY,
      ApiErrorCode.EXTERNAL_SERVICE_ERROR,
    );
  }
}

export class NotificationRateLimitedError extends AppError {
  constructor() {
    super('Notification rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS, ApiErrorCode.RATE_LIMITED);
  }
}

export class NotificationNotFoundError extends AppError {
  constructor(resourceType: string) {
    super(`${resourceType} not found`, HttpStatus.NOT_FOUND, ApiErrorCode.NOT_FOUND);
  }
}
