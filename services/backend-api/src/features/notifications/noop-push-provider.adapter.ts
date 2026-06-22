import { Injectable, Logger } from '@nestjs/common';
import { PushProviderAdapter, PushDeliveryPayload, PushDeliveryResult } from './push-provider-adapter.interface';

@Injectable()
export class NoopPushProviderAdapter implements PushProviderAdapter {
  private readonly logger = new Logger(NoopPushProviderAdapter.name);

  async send(payload: PushDeliveryPayload): Promise<PushDeliveryResult> {
    this.logger.log('[NOOP] Push send dispatched');
    return { success: true, providerMessageId: `noop-${Date.now()}` };
  }

  async validateToken(_token: string): Promise<boolean> {
    return true;
  }
}
