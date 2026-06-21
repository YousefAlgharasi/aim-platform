// P18-030: Create AI Cost and Quota Service
// Budget/quota checks for student usage. Quota check must happen BEFORE
// any provider call; the cost event is recorded only after the provider
// call completes (or fails), per ai-cost-control-policy.md. Quota state is
// always computed server-side from ai_usage_cost_events — never trusted
// from the client.

import { Injectable } from '@nestjs/common';

import { AiUsageCostEventRepository } from './ai-usage-cost-event.repository';
import { AiUsageCostEventRow } from './governance-repository.types';

const DAILY_BUDGET_USD = 2.0;
const MONTHLY_BUDGET_USD = 30.0;

export interface QuotaCheckResult {
  readonly allowed: boolean;
  readonly periodSpend: number;
  readonly budget: number;
}

@Injectable()
export class AiCostQuotaService {
  constructor(private readonly usageCostEventRepository: AiUsageCostEventRepository) {}

  async checkQuota(
    studentId: string,
    quotaPeriod: 'daily' | 'monthly',
    estimatedCost: number,
  ): Promise<QuotaCheckResult> {
    const windowStart = this.windowStartFor(quotaPeriod);
    const periodSpend = await this.usageCostEventRepository.sumCostSince(studentId, windowStart);
    const budget = quotaPeriod === 'daily' ? DAILY_BUDGET_USD : MONTHLY_BUDGET_USD;

    return {
      allowed: periodSpend + estimatedCost <= budget,
      periodSpend,
      budget,
    };
  }

  async recordUsage(input: {
    studentId: string;
    eventType: 'text_generation' | 'stt' | 'tts';
    modelConfigId?: string | null;
    requestId: string;
    tokensUsed?: number | null;
    durationSeconds?: number | null;
    costEstimate: number;
    quotaPeriod: 'daily' | 'monthly';
  }): Promise<AiUsageCostEventRow> {
    return this.usageCostEventRepository.create(input);
  }

  private windowStartFor(quotaPeriod: 'daily' | 'monthly'): Date {
    const now = new Date();
    if (quotaPeriod === 'daily') {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}
