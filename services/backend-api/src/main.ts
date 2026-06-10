import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BackendConfigService } from './config/backend-config.service';
import { setupOpenApi } from './openapi/openapi.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(BackendConfigService);

  app.enableCors({
    origin: [...config.corsOrigins],
  });

  setupOpenApi(app);

  await app.listen(config.port);
}

void bootstrap();
