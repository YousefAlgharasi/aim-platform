// P12-025: Add Parent Permission Guards
// Single enforcement point for parent-facing endpoints that read child
// data: verifies auth, an active parent-child relationship, and (when
// required) a granted consent type, before the handler runs.
//
// This guard never resolves link/consent state itself — it always
// delegates to ParentAccessPolicyService, the backend authority for
// "may this parent see this child's data." It never computes or exposes
// mastery, weakness, score, correctness, recommendations, or any
// AIM/assessment output.
//
// Is a no-op unless the handler/class is annotated with
// @RequireParentChildAccess(...).

import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { AppError } from '../../../common/errors/app-error';
import { AuthenticatedRequest } from '../../../auth/authenticated-user';
import { ParentAccessScopeEntity } from '../dto/parent-access-scope.entity';
import { ParentAccessPolicyService } from '../parent-access-policy.service';
import { PARENT_CHILD_ACCESS_KEY } from './parent-child-access.constants';
import { ParentChildAccessRequirement } from './parent-child-access-requirement';

export interface ParentChildAccessRequest extends AuthenticatedRequest {
  readonly params?: Record<string, string | undefined>;
  /** Attached by this guard so downstream handlers can reuse the resolved scope. */
  parentAccessScope?: ParentAccessScopeEntity;
}

@Injectable()
export class ParentChildAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly parentAccessPolicyService: ParentAccessPolicyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = this.reflector.getAllAndOverride<ParentChildAccessRequirement>(
      PARENT_CHILD_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requirement) {
      return true;
    }

    const request = context.switchToHttp().getRequest<ParentChildAccessRequest>();
    const user = request.user;

    if (!user) {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Authenticated parent is required for child access checks.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const childId = request.params?.[requirement.paramName]?.trim();

    if (!childId) {
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Parent-child access target is missing.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    const scope = requirement.consentType
      ? await this.parentAccessPolicyService.assertAccess(user.id, childId, requirement.consentType)
      : await this.parentAccessPolicyService.assertLinked(user.id, childId);

    request.parentAccessScope = scope;

    return true;
  }
}
