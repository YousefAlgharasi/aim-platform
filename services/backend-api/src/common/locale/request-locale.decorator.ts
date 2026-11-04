import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { LOCALE_QUERY_PARAM, SupportedLocale } from './locale.constants';
import { resolveRequestedLocale } from './locale.util';

export interface LocaleContext {
  readonly requested: SupportedLocale | null;
  readonly userId: string | null;
}

interface LocaleRequest {
  query?: Record<string, unknown>;
  headers?: Record<string, string | string[] | undefined>;
  user?: { id?: string };
  resolvedInternalUserId?: string;
}

export function readLocaleContext(request: LocaleRequest): LocaleContext {
  return {
    requested: resolveRequestedLocale(
      request.query?.[LOCALE_QUERY_PARAM],
      request.headers?.['accept-language'],
    ),
    userId: request.resolvedInternalUserId || request.user?.id || null,
  };
}

export const RequestLocale = createParamDecorator<undefined, LocaleContext>(
  (_data, context: ExecutionContext) =>
    readLocaleContext(context.switchToHttp().getRequest<LocaleRequest>()),
);
