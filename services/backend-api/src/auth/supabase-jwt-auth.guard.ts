import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppError } from '../common/errors/app-error';
import { ApiErrorCode } from '../common/errors/api-error-code';
import { AuthenticatedRequest } from './authenticated-user';
import { IS_PUBLIC_ROUTE_KEY } from './auth.constants';
import { extractBearerToken } from './bearer-token';
import { SupabaseJwtVerifierService } from './supabase-jwt-verifier.service';

@Injectable()
export class SupabaseJwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly verifier: SupabaseJwtVerifierService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublicRoute(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request);

    if (!token) {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Missing bearer token',
        statusCode: 401,
      });
    }

    request.user = await this.verifier.verify(token);
    return true;
  }

  private isPublicRoute(context: ExecutionContext): boolean {
    return (
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false
    );
  }
}
