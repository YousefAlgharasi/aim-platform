export interface PushDeliveryPayload {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface PushDeliveryResult {
  success: boolean;
  providerMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface PushProviderAdapter {
  send(payload: PushDeliveryPayload): Promise<PushDeliveryResult>;
  validateToken(token: string): Promise<boolean>;
}

export const PUSH_PROVIDER_ADAPTER = Symbol('PUSH_PROVIDER_ADAPTER');
