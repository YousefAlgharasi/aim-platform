import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  OPENAPI_DESCRIPTION,
  OPENAPI_DOCS_PATH,
  OPENAPI_JSON_PATH,
  OPENAPI_TITLE,
  OPENAPI_VERSION,
} from './openapi.constants';
import { OPENAPI_TAGS } from './openapi.tags';

function isOpenApiEnabled(): boolean {
  if (process.env.OPENAPI_ENABLED === 'true') {
    return true;
  }

  return process.env.NODE_ENV !== 'production';
}

export function setupOpenApi(app: INestApplication): void {
  if (!isOpenApiEnabled()) {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle(OPENAPI_TITLE)
    .setDescription(OPENAPI_DESCRIPTION)
    .setVersion(OPENAPI_VERSION)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Supabase access token. Never paste service-role keys here.',
      },
      'supabase-jwt',
    )
    .addTag(OPENAPI_TAGS.foundation, 'Health, version, and platform foundation endpoints.')
    .addTag(OPENAPI_TAGS.auth, 'Authentication boundary placeholders.')
    .addTag(OPENAPI_TAGS.students, 'Student profile and learner-owned data placeholders.')
    .addTag(OPENAPI_TAGS.lessons, 'Lesson/catalog placeholders.')
    .addTag(OPENAPI_TAGS.sessions, 'Learning session placeholders.')
    .addTag(OPENAPI_TAGS.aim, 'Backend-owned AIM Engine integration placeholders.')
    .addTag(OPENAPI_TAGS.aiTeacher, 'AI Teacher gateway placeholders.')
    .addTag(OPENAPI_TAGS.admin, 'Admin-only operational placeholders.')
    .addTag(OPENAPI_TAGS.reports, 'Reporting placeholders.')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(OPENAPI_DOCS_PATH, app, document, {
    jsonDocumentUrl: OPENAPI_JSON_PATH,
    swaggerOptions: {
      persistAuthorization: false,
      displayRequestDuration: true,
    },
    customSiteTitle: 'AIM Backend API Docs',
  });
}
