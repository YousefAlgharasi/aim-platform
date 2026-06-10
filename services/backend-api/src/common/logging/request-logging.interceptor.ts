import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';
import {
  buildSafeRequestLogFields,
  formatSafeRequestLog,
  RequestForLogging,
} from './safe-request-log';

interface ResponseForLogging {
  statusCode?: number;
}

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestForLogging>();
    const response = http.getResponse<ResponseForLogging>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logRequest('completed', request, response.statusCode ?? 200, startedAt);
      }),
      catchError((error: unknown) => {
        this.logRequest('failed', request, statusCodeFromError(error, response), startedAt);
        return throwError(() => error);
      }),
    );
  }

  private logRequest(
    outcome: 'completed' | 'failed',
    request: RequestForLogging,
    statusCode: number,
    startedAt: number,
  ): void {
    const fields = buildSafeRequestLogFields(
      outcome,
      request,
      statusCode,
      Date.now() - startedAt,
    );
    const message = formatSafeRequestLog(fields);

    if (outcome === 'failed') {
      this.logger.warn(message);
      return;
    }

    this.logger.log(message);
  }
}

function statusCodeFromError(error: unknown, response: ResponseForLogging): number {
  if (error instanceof HttpException) {
    return error.getStatus();
  }

  return response.statusCode ?? 500;
}
