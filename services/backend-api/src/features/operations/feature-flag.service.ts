import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

  constructor(private readonly auditService: OperationsAuditService) {}

  async getFlags(adminId: string): Promise<FeatureFlag[]> {
    this.logger.debug(`Fetching all feature flags for admin ${adminId}`);

    // TODO: Query from database when operations repository is implemented
    return [];
  }

  async getFlagByKey(key: string): Promise<FeatureFlag> {
    this.logger.debug(`Fetching feature flag: ${key}`);

    // TODO: Query from database when operations repository is implemented
    throw new NotFoundException(`Feature flag '${key}' not found`);
  }

  async createFlag(
    dto: CreateFeatureFlagDto,
    adminId: string,
  ): Promise<FeatureFlag> {
    const flag: FeatureFlag = {
      id: crypto.randomUUID(),
      flagKey: dto.flagKey,
      name: dto.name,
      description: dto.description || null,
      enabled: dto.enabled,
      rolloutPercentage: dto.rolloutPercentage,
      audience: dto.audience || {},
      ownerId: adminId,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.logger.log(`Feature flag created: ${flag.flagKey} by admin ${adminId}`);

    await this.auditService.logAction(
      adminId,
      'feature_flag.created',
      'feature_flag',
      flag.id,
      { flagKey: dto.flagKey, name: dto.name, enabled: dto.enabled },
    );

    // TODO: Persist to database when operations repository is implemented
    return flag;
  }

  async updateFlag(
    key: string,
    dto: UpdateFeatureFlagDto,
    adminId: string,
  ): Promise<FeatureFlag> {
    const flag = await this.getFlagByKey(key);

    const updated: FeatureFlag = {
      ...flag,
      name: dto.name ?? flag.name,
      description: dto.description !== undefined ? (dto.description || null) : flag.description,
      enabled: dto.enabled ?? flag.enabled,
      rolloutPercentage: dto.rolloutPercentage ?? flag.rolloutPercentage,
      audience: dto.audience ?? flag.audience,
      updatedAt: new Date(),
    };

    this.logger.log(`Feature flag '${key}' updated by admin ${adminId}`);

    await this.auditService.logAction(
      adminId,
      'feature_flag.updated',
      'feature_flag',
      flag.id,
      { changes: dto },
    );

    // TODO: Persist to database when operations repository is implemented
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

      // Deterministic rollout based on userId if available
      if (context?.userId) {
        const hash = this.hashString(`${key}:${context.userId}`);
        const bucket = hash % 100;
        return bucket < flag.rolloutPercentage;
      }

      // Random rollout for anonymous contexts
      return Math.random() * 100 < flag.rolloutPercentage;
    } catch {
      // Flag not found defaults to disabled
      this.logger.warn(`Feature flag '${key}' not found, defaulting to disabled`);
      return false;
    }
  }

  private hashString(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
