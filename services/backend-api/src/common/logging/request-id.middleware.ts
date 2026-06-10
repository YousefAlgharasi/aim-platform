import { Injectable, NestMiddleware } from '@nestjs/common';
import { createRequestId, readRequestIdHeader, REQUEST_ID_HEADER } from './request-id';

interface RequestWithMutableHeaders {
  requestId?: string;
  headers: Record<string, string | string[] | undefined>;
}

interface ResponseWithHeaders {
  setHeader(name: string, value: string): void;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(
    request: RequestWithMutableHeaders,
    response: ResponseWithHeaders,
    next: () => void,
  ): void {
    const requestId = readRequestIdHeader(request.headers) ?? createRequestId();

    request.requestId = requestId;
    request.headers[REQUEST_ID_HEADER] = requestId;
    response.setHeader(REQUEST_ID_HEADER, requestId);

    next();
  }
}
