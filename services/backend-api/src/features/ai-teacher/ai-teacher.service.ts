import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiTeacherService {
  private readonly logger = new Logger(AiTeacherService.name);

  constructor(private readonly configService: ConfigService) {}

  isAvailable(): boolean {
    const apiKey = this.configService.get<string>('AI_PROVIDER_API_KEY');
    return Boolean(apiKey && apiKey.length > 0);
  }
}
