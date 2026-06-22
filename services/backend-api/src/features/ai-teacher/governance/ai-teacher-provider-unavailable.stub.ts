// P18-026: Create AI Provider Adapter Interface
// Fail-closed stub binding for AiTeacherProviderGateway. No concrete
// provider implementation exists yet (that is separate, later scope); this
// stub lets the governance module boot safely while every call fails
// closed rather than the app crashing on missing dependency injection.

import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import { AiTeacherProviderGateway } from './ai-teacher-provider.interface';

@Injectable()
export class AiTeacherProviderUnavailableStub extends AiTeacherProviderGateway {
  async generateText(): Promise<never> {
    throw new ServiceUnavailableException('AI Teacher provider gateway is not yet configured');
  }

  async transcribeSpeech(): Promise<never> {
    throw new ServiceUnavailableException('AI Teacher provider gateway is not yet configured');
  }

  async synthesizeSpeech(): Promise<never> {
    throw new ServiceUnavailableException('AI Teacher provider gateway is not yet configured');
  }

  async moderateContent(): Promise<never> {
    throw new ServiceUnavailableException('AI Teacher provider gateway is not yet configured');
  }
}
