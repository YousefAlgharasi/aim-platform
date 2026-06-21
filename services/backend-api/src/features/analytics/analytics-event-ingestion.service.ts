import { Injectable } from '@nestjs/common';

import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsEvent, AnalyticsActorRole } from './analytics.entities';
import { validateEventType, validateActorRole } from './analytics.validation';

export interface IngestEventInput {
  eventType: string;
  actorRole: AnalyticsActorRole;
  actorId?: string | null;
  subjectType: string;
  subjectId?: string | null;
  occurredAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Backend-internal event ingestion. Never exposed directly to UI clients
 * (see docs/phase-15/analytics-api-contract-map.md) — other backend feature
 * modules call this service to record analytics events as side effects of
 * their own domain actions.
 */
@Injectable()
export class AnalyticsEventIngestionService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async ingest(input: IngestEventInput): Promise<AnalyticsEvent> {
    validateEventType(input.eventType);
    validateActorRole(input.actorRole);

    return this.analyticsRepository.insertEvent({
      eventType: input.eventType,
      actorRole: input.actorRole,
      actorId: input.actorId ?? null,
      subjectType: input.subjectType,
      subjectId: input.subjectId ?? null,
      occurredAt: input.occurredAt,
      metadata: this.stripUnsafeMetadata(input.metadata ?? {}),
    });
  }

  /**
   * Removes any field that resembles a secret/credential/token before
   * persisting event metadata, per docs/phase-15/analytics-privacy-data-safety-rules.md.
   */
  private stripUnsafeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    const forbiddenKeyPattern = /password|secret|token|api[_-]?key|credential|card[_-]?number/i;
    const safe: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (forbiddenKeyPattern.test(key)) {
        continue;
      }
      safe[key] = value;
    }

    return safe;
  }
}
