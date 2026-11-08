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

  // The API sits behind exactly one reverse proxy (nginx). Trust one hop so req.ip is the real
  // client address taken from X-Forwarded-For; without this every request appears to come from
  // the proxy and shares a single rate-limit bucket. TRUST_PROXY_HOPS=0 disables it (direct access).
  const hops = parseInt(process.env.TRUST_PROXY_HOPS ?? '1', 10);
  app.getHttpAdapter().getInstance().set('trust proxy', Number.isFinite(hops) ? hops : 1);

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
    credentials: true,
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
