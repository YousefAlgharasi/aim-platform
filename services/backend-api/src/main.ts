import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import compression from 'compression';
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

  // JSON compresses ~5-10x. The Home response alone carries a dozen sections, so on a phone
  // connection this is a large share of the load time. Audio and event streams are skipped.
  app.use(
    compression({
      threshold: 1024,
      filter: (req, res) => {
        const type = String(res.getHeader('Content-Type') ?? '');
        if (type.includes('text/event-stream') || type.startsWith('audio/')) return false;
        return compression.filter(req, res);
      },
    }),
  );

  // Log every request slower than SLOW_REQUEST_MS (default 800 ms) so the slow endpoints show up
  // in the server log with their real duration instead of being guessed at.
  const slowRequestMs = parseInt(process.env.SLOW_REQUEST_MS ?? '800', 10);
  app.use((req: { method: string; originalUrl: string }, res: { statusCode: number; on: (e: string, cb: () => void) => void }, next: () => void) => {
    const startedAt = process.hrtime.bigint();
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - startedAt) / 1e6;
      if (ms >= slowRequestMs) {
        // Path only: the query string can carry user input.
        logger.warn(`SLOW_REQUEST ${req.method} ${req.originalUrl.split('?')[0]} ${Math.round(ms)}ms status=${res.statusCode}`);
      }
    });
    next();
  });

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
