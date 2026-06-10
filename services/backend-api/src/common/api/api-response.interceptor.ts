import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { createApiResponseMeta, RequestLike } from './api-response-meta';
import { ApiSuccessResponse } from './api-response.types';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<unknown>> {
    const request = context.switchToHttp().getRequest<RequestLike>();

    return next.handle().pipe(
      map((data: unknown): ApiSuccessResponse<unknown> => ({
        success: true,
        data: data ?? null,
        meta: createApiResponseMeta(request),
      })),
    );
  }
}
