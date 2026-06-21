// P18-028: Create Model Config Service
// Backend service for selecting allowed model configs and limits without
// exposing secrets. providerKeyRef is a non-secret reference string only —
// resolving it to an actual provider credential happens elsewhere, never
// in this service or in any response returned to a client.

import { Injectable, NotFoundException } from '@nestjs/common';

import { AiModelConfigRepository } from './ai-model-config.repository';
import { AiModelConfigRow } from './governance-repository.types';

export interface SafeModelConfigView {
  readonly id: string;
  readonly name: string;
  readonly tier: 'economy' | 'standard' | 'premium';
  readonly limits: unknown;
}

@Injectable()
export class ModelConfigService {
  constructor(private readonly modelConfigRepository: AiModelConfigRepository) {}

  async selectByTier(tier: 'economy' | 'standard' | 'premium'): Promise<AiModelConfigRow> {
    const configs = await this.modelConfigRepository.listActiveByTier(tier);

    if (configs.length === 0) {
      throw new NotFoundException(`No active model config found for tier="${tier}"`);
    }

    return configs[0];
  }

  async getById(id: string): Promise<AiModelConfigRow> {
    const config = await this.modelConfigRepository.findById(id);

    if (!config) {
      throw new NotFoundException(`Model config not found: ${id}`);
    }

    return config;
  }

  toSafeView(config: AiModelConfigRow): SafeModelConfigView {
    return {
      id: config.id,
      name: config.name,
      tier: config.tier,
      limits: config.limits,
    };
  }

  // ---------------------------------------------------------------------
  // P18-049: Admin AI Model Config API — read/update metadata without
  // secrets. Only an admin caller (enforced by the controller's role
  // guard) may reach these.
  // ---------------------------------------------------------------------

  async listAllConfigs(): Promise<AiModelConfigRow[]> {
    return this.modelConfigRepository.listAll();
  }

  async setStatus(
    id: string,
    status: 'draft' | 'active' | 'retired',
  ): Promise<AiModelConfigRow> {
    const updated = await this.modelConfigRepository.updateStatus(id, status);

    if (!updated) {
      throw new NotFoundException(`Model config not found: ${id}`);
    }

    return updated;
  }

  async updateLimitsAndParameters(
    id: string,
    limits: Record<string, unknown>,
    parameters: Record<string, unknown>,
  ): Promise<AiModelConfigRow> {
    const updated = await this.modelConfigRepository.updateLimitsAndParameters(
      id,
      limits,
      parameters,
    );

    if (!updated) {
      throw new NotFoundException(`Model config not found: ${id}`);
    }

    return updated;
  }
}
