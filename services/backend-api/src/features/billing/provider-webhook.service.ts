import {
  Injectable,
  Inject,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { BillingRepository } from './billing.repository';
import {
  PaymentProviderAdapter,
  PAYMENT_PROVIDER_ADAPTER,
} from './payment-provider.adapter';
import { PaymentProviderEvent } from './billing.entities';

@Injectable()
export class ProviderWebhookService {
  private readonly logger = new Logger(ProviderWebhookService.name);

  constructor(
    private readonly billingRepo: BillingRepository,
    @Inject(PAYMENT_PROVIDER_ADAPTER)
    private readonly providerAdapter: PaymentProviderAdapter,
  ) {}

  async verifyAndStoreEvent(
    payload: Buffer,
    signature: string,
  ): Promise<PaymentProviderEvent> {
    const isValid = await this.providerAdapter.verifyWebhookSignature(
      payload,
      signature,
    );
    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const parsed = await this.providerAdapter.parseWebhookEvent(payload);
    if (!parsed.valid) {
      throw new BadRequestException('Failed to parse webhook event');
    }

    const existingEvent = await this.billingRepo.findProviderEventByIdempotencyKey(
      parsed.eventId,
    );
    if (existingEvent) {
      this.logger.log(`Duplicate event skipped: ${parsed.eventId}`);
      return existingEvent;
    }

    const event = await this.billingRepo.createProviderEvent({
      providerEventId: parsed.eventId,
      eventType: parsed.eventType,
      provider: parsed.provider,
      processingStatus: 'pending',
      idempotencyKey: parsed.eventId,
      payloadSummary: parsed.payloadSummary,
      errorMessage: null,
      processedAt: null,
    } as Partial<PaymentProviderEvent>);

    return event;
  }

  async markEventProcessed(eventId: string): Promise<void> {
    await this.billingRepo.updateProviderEvent(eventId, {
      processingStatus: 'processed',
      processedAt: new Date(),
    });
  }

  async markEventFailed(eventId: string, errorMessage: string): Promise<void> {
    await this.billingRepo.updateProviderEvent(eventId, {
      processingStatus: 'failed',
      errorMessage,
    });
  }

  async markEventSkipped(eventId: string): Promise<void> {
    await this.billingRepo.updateProviderEvent(eventId, {
      processingStatus: 'skipped',
    });
  }

  async processEvent(event: PaymentProviderEvent): Promise<void> {
    try {
      switch (event.eventType) {
        case 'checkout.session.completed':
        case 'payment_intent.succeeded':
        case 'payment_intent.payment_failed':
        case 'invoice.paid':
        case 'invoice.payment_failed':
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
        case 'charge.refunded':
          await this.markEventProcessed(event.id);
          break;
        default:
          this.logger.log(`Unhandled event type: ${event.eventType}`);
          await this.markEventSkipped(event.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to process event ${event.id}: ${message}`);
      await this.markEventFailed(event.id, message);
      throw error;
    }
  }

  async getEventsByStatus(
    status: PaymentProviderEvent['processingStatus'],
  ): Promise<PaymentProviderEvent[]> {
    return this.billingRepo.findProviderEventsByStatus(status);
  }
}
