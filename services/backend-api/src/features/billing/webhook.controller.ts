import {
  Controller,
  Post,
  Headers,
  RawBodyRequest,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Request } from 'express';
import { ProviderWebhookService } from './provider-webhook.service';

@ApiExcludeController()
@Controller('billing/webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly webhookService: ProviderWebhookService,
  ) {}

  @Post('provider')
  @HttpCode(HttpStatus.OK)
  async handleProviderWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
    @Headers('x-webhook-signature') genericSignature?: string,
  ): Promise<{ received: boolean }> {
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Raw body is required for webhook verification');
    }

    const webhookSignature = signature || genericSignature;
    if (!webhookSignature) {
      throw new BadRequestException('Webhook signature header is required');
    }

    const event = await this.webhookService.verifyAndStoreEvent(
      rawBody,
      webhookSignature,
    );

    try {
      await this.webhookService.processEvent(event);
    } catch (error) {
      this.logger.error(
        `Webhook event processing failed for ${event.id}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    return { received: true };
  }
}
