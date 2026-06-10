import { Injectable } from '@nestjs/common';
import { BackendConfig } from './backend-config.types';
import { validateBackendConfig } from './backend-config.validation';

@Injectable()
export class BackendConfigService {
  private readonly config: BackendConfig = validateBackendConfig();

  get nodeEnv(): BackendConfig['nodeEnv'] {
    return this.config.nodeEnv;
  }

  get port(): number {
    return this.config.port;
  }

  get corsOrigins(): readonly string[] {
    return this.config.cors.origins;
  }

  get supabase(): BackendConfig['supabase'] {
    return this.config.supabase;
  }

  get database(): BackendConfig['database'] {
    return this.config.database;
  }

  get aimEngine(): BackendConfig['aimEngine'] {
    return this.config.aimEngine;
  }

  get aiProvider(): BackendConfig['aiProvider'] {
    return this.config.aiProvider;
  }

  snapshot(): BackendConfig {
    return this.config;
  }
}
