import { Injectable } from '@nestjs/common';

import { TtsProviderResponse } from './tts-gateway.types';
import { TTS_SAFE_FALLBACK_MESSAGE } from './tts-safe-failure.constants';

export interface SafeTtsOutcome {
  readonly audioRef: string | null;
  readonly message: string | null;
  readonly isFallback: boolean;
}

@Injectable()
export class TtsSafeFailureService {
  toSafeOutcome(response: TtsProviderResponse): SafeTtsOutcome {
    if (response.status === 'success' && response.audioRef) {
      return { audioRef: response.audioRef, message: null, isFallback: false };
    }

    return {
      audioRef: null,
      message: TTS_SAFE_FALLBACK_MESSAGE,
      isFallback: true,
    };
  }
}
