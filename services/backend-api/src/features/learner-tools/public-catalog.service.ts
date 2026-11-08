import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { courseTextSql } from '../../common/locale/course-text.sql';

export interface PublicCourse { id: string; title: string; description: string | null; levelCode: string | null; cefrCode: string | null; lessonCount: number }

/** Read-only, anonymous view of what the platform teaches (titles, levels, size) — no lesson content. */
@Injectable()
export class PublicCatalogService {
  constructor(private readonly db: DatabaseService) {}

  async courses(locale: 'en' | 'ar'): Promise<PublicCourse[]> {
    const ct = courseTextSql('co', '$1');
    const r = await this.db.query<any>(
      `SELECT co.id, ${ct.title} AS title, ${ct.description} AS description, co.cefr_code,
              (SELECT count(*) FROM lessons l
                 JOIN chapters ch ON ch.id = l.chapter_id AND ch.status = 'published'
                 JOIN levels lv ON lv.id = ch.level_id AND lv.status = 'published'
                WHERE lv.course_id = co.id AND l.status = 'published')::int AS lesson_count
       FROM courses co ${ct.joins}
       WHERE co.status = 'published' ORDER BY co.cefr_rank NULLS LAST, co.sort_order`, [locale]);
    return r.rows.map((x) => ({ id: x.id, title: x.title, description: x.description, levelCode: x.cefr_code, cefrCode: x.cefr_code, lessonCount: x.lesson_count }));
  }
}
