import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { BackendConfigService } from './config/backend-config.service';
import { setupOpenApi } from './openapi/openapi.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(BackendConfigService);
  const logger = new Logger('Bootstrap');

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [...config.corsOrigins],
  });

  app.enableShutdownHooks();

  setupOpenApi(app);

  await app.listen(config.port);

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error);
    process.exit(1);
  });
}

void bootstrap();
