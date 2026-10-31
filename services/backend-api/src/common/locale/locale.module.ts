import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { LocaleHeadersInterceptor } from './locale-headers.interceptor';
import { LocaleResolverService } from './locale-resolver.service';

@Module({
  imports: [DatabaseModule],
  providers: [LocaleResolverService, LocaleHeadersInterceptor],
  exports: [LocaleResolverService, LocaleHeadersInterceptor],
})
export class LocaleModule {}
