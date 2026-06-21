import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';

export class InvalidDeviceTokenError extends AppError {
  constructor() {
    super({
      message: 'Invalid or expired device token',
      statusCode: HttpStatus.BAD_REQUEST,
      code: ApiErrorCode.VALIDATION_ERROR,
    });
  }

  getStatus(): number {
    return this.statusCode;
  }
}

export class DisabledChannelError extends AppError {
  constructor(channel: string) {
    super({
      message: `Notification channel '${channel}' is disabled`,
      statusCode: HttpStatus.BAD_REQUEST,
      code: ApiErrorCode.VALIDATION_ERROR,
    });
  }

  getStatus(): number {
    return this.statusCode;
  }
}

export class NotificationForbiddenError extends AppError {
  constructor() {
    super({
      message: 'Not authorized to access this notification resource',
      statusCode: HttpStatus.FORBIDDEN,
      code: ApiErrorCode.FORBIDDEN,
    });
  }

  getStatus(): number {
    return this.statusCode;
  }
}

export class QuietHoursActiveError extends AppError {
  constructor() {
    super({
      message: 'Notification suppressed — quiet hours active',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      code: ApiErrorCode.VALIDATION_ERROR,
    });
  }

  getStatus(): number {
    return this.statusCode;
  }
}

export class ProviderDeliveryError extends AppError {
  constructor(providerError: string) {
    super({
      message: `Notification delivery failed: ${providerError}`,
      statusCode: HttpStatus.BAD_GATEWAY,
      code: ApiErrorCode.EXTERNAL_SERVICE_ERROR,
    });
  }

  getStatus(): number {
    return this.statusCode;
  }
}

export class NotificationRateLimitedError extends AppError {
  constructor() {
    super({
      message: 'Notification rate limit exceeded',
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      code: ApiErrorCode.RATE_LIMITED,
    });
  }

  getStatus(): number {
    return this.statusCode;
  }
}

export class NotificationNotFoundError extends AppError {
  constructor(resourceType: string) {
    super({
      message: `${resourceType} not found`,
      statusCode: HttpStatus.NOT_FOUND,
      code: ApiErrorCode.NOT_FOUND,
    });
  }

  getStatus(): number {
    return this.statusCode;
  }
}
