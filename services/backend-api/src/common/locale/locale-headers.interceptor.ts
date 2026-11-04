import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

interface HeaderResponse {
  getHeader(name: string): unknown;
  setHeader(name: string, value: string): void;
}

@Injectable()
export class LocaleHeadersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<HeaderResponse>();

    if (typeof response?.setHeader === 'function') {
      const existingVary = response.getHeader('Vary');
      const vary = typeof existingVary === 'string' && existingVary.length > 0 ? existingVary : '';
      if (!/accept-language/i.test(vary)) {
        response.setHeader('Vary', vary ? `${vary}, Accept-Language` : 'Accept-Language');
      }
      if (!response.getHeader('Cache-Control')) {
        response.setHeader('Cache-Control', 'private');
      }
    }

    return next.handle();
  }
}
