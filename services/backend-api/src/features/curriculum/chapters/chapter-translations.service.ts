import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { EntityTranslationsService } from '../translations/entity-translations.service';

export const CHAPTER_TRANSLATIONS_CONFIG = {
  label: 'Chapter',
  entityTable: 'chapters',
  translationTable: 'chapter_translations',
  foreignKey: 'chapter_id',
  idKey: 'chapterId',
  requireEnglishDescription: false,
} as const;

@Injectable()
export class ChapterTranslationsService extends EntityTranslationsService {
  constructor(db: DatabaseService) {
    super(db, CHAPTER_TRANSLATIONS_CONFIG);
  }
}
