export interface EmailDeliveryPayload {
  to: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  providerMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface EmailProviderAdapter {
  send(payload: EmailDeliveryPayload): Promise<EmailDeliveryResult>;
}

export const EMAIL_PROVIDER_ADAPTER = Symbol('EMAIL_PROVIDER_ADAPTER');
