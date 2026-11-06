import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OperationsRepository } from './operations.repository';
import { OperationsAuditService } from './operations-audit.service';
import { FeatureFlag } from './operations.entities';

export interface CreateFeatureFlagDto {
  flagKey: string;
  name: string;
  description?: string;
  enabled: boolean;
  rolloutPercentage: number;
  audience?: Record<string, unknown>;
}

export interface UpdateFeatureFlagDto {
  name?: string;
  description?: string;
  enabled?: boolean;
  rolloutPercentage?: number;
  audience?: Record<string, unknown>;
}

export interface FlagEvaluationContext {
  userId?: string;
  role?: string;
  attributes?: Record<string, unknown>;
}

@Injectable()
export class FeatureFlagService {
  private readonly logger = new Logger(FeatureFlagService.name);

  constructor(
    private readonly opsRepo: OperationsRepository,
    private readonly auditService: OperationsAuditService,
  ) {}

  async getFlags(adminId: string): Promise<FeatureFlag[]> {
    this.logger.debug(`Fetching all feature flags for admin ${adminId}`);
    return this.opsRepo.findAllFeatureFlags();
  }

  async getFlagByKey(key: string): Promise<FeatureFlag> {
    this.logger.debug(`Fetching feature flag: ${key}`);
    const flag = await this.opsRepo.findFeatureFlagByKey(key);
    if (!flag) {
      throw new NotFoundException(`Feature flag '${key}' not found`);
    }
    return flag;
  }

  async createFlag(
    dto: CreateFeatureFlagDto,
    adminId: string,
  ): Promise<FeatureFlag> {
    const flag = await this.opsRepo.createFeatureFlag({
      flagKey: dto.flagKey,
      name: dto.name,
      description: dto.description || null,
      ownerId: adminId,
      metadata: {},
    });

    this.logger.log(`Feature flag created: ${flag.flagKey} by admin ${adminId}`);

    await this.auditService.logAction(
      adminId,
      'feature_flag.created',
      'feature_flag',
      flag.id,
      { flagKey: dto.flagKey, name: dto.name, enabled: dto.enabled },
    );

    return flag;
  }

  async updateFlag(
    id: string,
    dto: UpdateFeatureFlagDto,
    adminId: string,
  ): Promise<FeatureFlag> {
    const updated = await this.opsRepo.updateFeatureFlag(id, {
      enabled: dto.enabled,
      rolloutPercentage: dto.rolloutPercentage,
      audience: dto.audience,
    });

    if (!updated) {
      throw new NotFoundException(`Feature flag not found`);
    }

    this.logger.log(`Feature flag '${id}' updated by admin ${adminId}`);

    await this.auditService.logAction(
      adminId,
      'feature_flag.updated',
      'feature_flag',
      id,
      { changes: dto },
    );

    return updated;
  }

  async evaluateFlag(
    key: string,
    context?: FlagEvaluationContext,
  ): Promise<boolean> {
    try {
      const flag = await this.getFlagByKey(key);

      if (!flag.enabled) {
        return false;
      }

      if (flag.rolloutPercentage >= 100) {
        return true;
      }

      if (flag.rolloutPercentage <= 0) {
        return false;
      }

      if (context?.userId) {
        const hash = this.hashString(`${key}:${context.userId}`);
        const bucket = hash % 100;
        return bucket < flag.rolloutPercentage;
      }

      return Math.random() * 100 < flag.rolloutPercentage;
    } catch {
      this.logger.warn(`Feature flag '${key}' not found, defaulting to disabled`);
      return false;
    }
  }

  /**
   * Every defined flag evaluated for one user, as `{ flagKey: boolean }`. Served to the student
   * web so admin toggles / rollout changes take effect without a deploy. Keys that are not
   * defined are simply absent; clients treat absent as "feature on".
   */
  async evaluateAll(userId: string): Promise<Record<string, boolean>> {
    const flags = await this.opsRepo.findAllFeatureFlags();
    const out: Record<string, boolean> = {};
    for (const flag of flags) {
      if (!flag.enabled || flag.rolloutPercentage <= 0) {
        out[flag.flagKey] = false;
      } else if (flag.rolloutPercentage >= 100) {
        out[flag.flagKey] = true;
      } else {
        out[flag.flagKey] = this.hashString(`${flag.flagKey}:${userId}`) % 100 < flag.rolloutPercentage;
      }
    }
    return out;
  }

  private hashString(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }
}
