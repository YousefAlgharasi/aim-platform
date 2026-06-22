import { Injectable, Logger } from '@nestjs/common';
import { EmailProviderAdapter, EmailDeliveryPayload, EmailDeliveryResult } from './email-provider-adapter.interface';

@Injectable()
export class NoopEmailProviderAdapter implements EmailProviderAdapter {
  private readonly logger = new Logger(NoopEmailProviderAdapter.name);

  async send(payload: EmailDeliveryPayload): Promise<EmailDeliveryResult> {
    this.logger.log('[NOOP] Email send dispatched');
    return { success: true, providerMessageId: `noop-email-${Date.now()}` };
  }
}
