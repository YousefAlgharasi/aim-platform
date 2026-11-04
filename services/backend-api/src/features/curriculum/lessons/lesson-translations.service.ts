import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { EntityTranslationsService } from '../translations/entity-translations.service';

export const LESSON_TRANSLATIONS_CONFIG = {
  label: 'Lesson',
  entityTable: 'lessons',
  translationTable: 'lesson_translations',
  foreignKey: 'lesson_id',
  idKey: 'lessonId',
  requireEnglishDescription: true,
} as const;

@Injectable()
export class LessonTranslationsService extends EntityTranslationsService {
  constructor(db: DatabaseService) {
    super(db, LESSON_TRANSLATIONS_CONFIG);
  }
}
