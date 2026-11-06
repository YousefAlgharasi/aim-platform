import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicCatalogService } from './public-catalog.service';

// Anonymous (landing page). Rate-limited by the global per-client throttler; cacheable for 5 minutes.
@ApiTags('Public')
@Controller('public')
export class PublicCatalogController {
  constructor(private readonly catalog: PublicCatalogService) {}

  @Get('catalog')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Published courses (title, level, lesson count) for the public landing page.' })
  async courses(@Query('locale') loc?: string) {
    return { courses: await this.catalog.courses(loc === 'ar' ? 'ar' : 'en') };
  }
}
