import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { createApiResponseMeta, RequestLike } from '../api/api-response-meta';
import { ApiErrorResponse } from '../api/api-response.types';
import { ApiErrorCode } from './api-error-code';
import { AppError } from './app-error';

interface ResponseLike {
  status(statusCode: number): ResponseLike;
  json(body: unknown): void;
}

interface NormalizedException {
  readonly statusCode: number;
  readonly code: ApiErrorCode | string;
  readonly message: string;
  readonly details?: unknown;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<RequestLike>();
    const response = context.getResponse<ResponseLike>();
    const normalized = normalizeException(exception);

    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: normalized.code,
        message: normalized.message,
        statusCode: normalized.statusCode,
        ...(normalized.details === undefined ? {} : { details: normalized.details }),
      },
      meta: createApiResponseMeta(request),
    };

    response.status(normalized.statusCode).json(body);
  }
}

function normalizeException(exception: unknown): NormalizedException {
  if (exception instanceof AppError) {
    return {
      statusCode: exception.statusCode,
      code: exception.code,
      message: exception.message,
      ...(exception.details === undefined ? {} : { details: exception.details }),
    };
  }

  if (exception instanceof HttpException) {
    return normalizeHttpException(exception);
  }

  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    code: ApiErrorCode.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
  };
}

function normalizeHttpException(exception: HttpException): NormalizedException {
  const statusCode = exception.getStatus();
  const responseBody = exception.getResponse();
  const isServerError = statusCode >= HttpStatus.INTERNAL_SERVER_ERROR;

  if (isServerError) {
    return {
      statusCode,
      code: codeForStatus(statusCode),
      message: safeDefaultMessageForStatus(statusCode),
    };
  }

  const message = readMessage(responseBody) ?? exception.message;
  const details = readValidationDetails(responseBody);

  return {
    statusCode,
    code: codeForStatus(statusCode, responseBody),
    message,
    ...(details === undefined ? {} : { details }),
  };
}

function codeForStatus(
  statusCode: number,
  responseBody?: unknown,
): ApiErrorCode {
  if (statusCode === HttpStatus.BAD_REQUEST && hasMessageArray(responseBody)) {
    return ApiErrorCode.VALIDATION_ERROR;
  }

  switch (statusCode) {
    case HttpStatus.BAD_REQUEST:
      return ApiErrorCode.BAD_REQUEST;
    case HttpStatus.UNAUTHORIZED:
      return ApiErrorCode.UNAUTHORIZED;
    case HttpStatus.FORBIDDEN:
      return ApiErrorCode.FORBIDDEN;
    case HttpStatus.NOT_FOUND:
      return ApiErrorCode.NOT_FOUND;
    case HttpStatus.CONFLICT:
      return ApiErrorCode.CONFLICT;
    case HttpStatus.TOO_MANY_REQUESTS:
      return ApiErrorCode.TOO_MANY_REQUESTS;
    case HttpStatus.SERVICE_UNAVAILABLE:
      return ApiErrorCode.SERVICE_UNAVAILABLE;
    default:
      return ApiErrorCode.INTERNAL_SERVER_ERROR;
  }
}

function safeDefaultMessageForStatus(statusCode: number): string {
  if (statusCode === HttpStatus.SERVICE_UNAVAILABLE) {
    return 'Service unavailable';
  }

  return 'Internal server error';
}

function readMessage(responseBody: unknown): string | undefined {
  if (typeof responseBody === 'string') {
    return responseBody;
  }

  if (!isRecord(responseBody)) {
    return undefined;
  }

  const message = responseBody.message;
  if (typeof message === 'string') {
    return message;
  }

  if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
    return 'Validation failed';
  }

  const error = responseBody.error;
  if (typeof error === 'string') {
    return error;
  }

  return undefined;
}

function readValidationDetails(responseBody: unknown): readonly string[] | undefined {
  if (!isRecord(responseBody)) {
    return undefined;
  }

  const message = responseBody.message;
  if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
    return message;
  }

  return undefined;
}

function hasMessageArray(responseBody: unknown): boolean {
  return isRecord(responseBody) && Array.isArray(responseBody.message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
