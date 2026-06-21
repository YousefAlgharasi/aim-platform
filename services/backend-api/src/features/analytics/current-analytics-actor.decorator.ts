import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AnalyticsActorRole } from './analytics.entities';

export interface AnalyticsActor {
  userId: string;
  role: AnalyticsActorRole;
}

/**
 * Reads the actor resolved by AnalyticsAccessGuard. Only valid on routes
 * guarded by AnalyticsAccessGuard — that guard is what populates this value.
 */
export const CurrentAnalyticsActor = createParamDecorator<keyof AnalyticsActor | undefined>(
  (property, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{ analyticsActor?: AnalyticsActor }>();
    const actor = request.analyticsActor;

    if (!property) {
      return actor;
    }

    return actor?.[property];
  },
);
