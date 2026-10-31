import { Module } from '@nestjs/common';
import { AuthModule } from '../../../auth';
import { DatabaseModule } from '../../../database/database.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { LocaleModule } from '../../../common/locale/locale.module';
import { ChapterTranslationsController } from './chapter-translations.controller';
import { ChapterTranslationsService } from './chapter-translations.service';
import { ChaptersController } from './chapters.controller';
import { ChaptersService } from './chapters.service';

@Module({
  imports: [AuthModule, DatabaseModule, LocaleModule, RolesModule, UsersModule],
  controllers: [ChaptersController, ChapterTranslationsController],
  providers: [ChaptersService, ChapterTranslationsService],
  exports: [ChaptersService, ChapterTranslationsService],
})
export class ChaptersModule {}
